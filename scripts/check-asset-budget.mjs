import fs from 'fs';
import path from 'path';

/**
 * PERF-ASSET-001 자산 예산·무결성 회귀 검사.
 * - public 전체 5 MB 이하
 * - 모든 런타임 이미지가 실제 WebP이며 참조 파일이 존재
 * - 표시 크기별 변형 파일과 미사용 레거시 파일 부재 확인
 *
 * 실행: npm run check:assets
 */
const PUBLIC_ROOT = path.resolve('public');
const IMAGE_ROOT = path.join(PUBLIC_ROOT, 'assets', 'images');
const TOTAL_BUDGET = 5 * 1024 * 1024;
const MAX_FILE_BUDGET = 300 * 1024;

const walk = (dir) => {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
};

const readWebpDimensions = (buffer) => {
  if (buffer.length < 30) return null;
  if (buffer.subarray(0, 4).toString('ascii') !== 'RIFF') return null;
  if (buffer.subarray(8, 12).toString('ascii') !== 'WEBP') return null;
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8X') {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }
  if (chunk === 'VP8 ') {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
};

const failures = [];
const warnings = [];
const publicFiles = walk(PUBLIC_ROOT);
const publicBytes = publicFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);

if (publicBytes > TOTAL_BUDGET) {
  failures.push(`public 전체 ${(publicBytes / 1024 / 1024).toFixed(2)} MB > 5 MB 예산`);
}

const imageFiles = walk(IMAGE_ROOT);
for (const file of imageFiles) {
  const buffer = fs.readFileSync(file);
  const relative = path.relative(PUBLIC_ROOT, file).replace(/\\/g, '/');
  const dimensions = readWebpDimensions(buffer);
  if (!dimensions) {
    failures.push(`실제 WebP가 아님: ${relative} (${buffer.subarray(0, 8).toString('hex')})`);
    continue;
  }
  if (buffer.length > MAX_FILE_BUDGET) {
    failures.push(`개별 파일 300 KB 초과: ${relative} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }
  if (path.dirname(file).endsWith('items') && !relative.includes('-256.webp') && dimensions.width !== 512) {
    failures.push(`아이템 원본 크기 불일치: ${relative} (${dimensions.width}x${dimensions.height})`);
  }
}

const requireFile = (relative, label) => {
  const full = path.join(PUBLIC_ROOT, relative.replace(/^\//, ''));
  if (!fs.existsSync(full)) failures.push(`${label} 파일 없음: ${relative}`);
  return full;
};

const dataFiles = [
  'src/data/masterItems.ts',
  'src/data/masterBots.ts',
  'src/data/masterAchievements.ts',
  'src/data/masterEvents.ts',
  'src/data/chanceCards.ts',
];
const referenced = new Map();
for (const dataFile of dataFiles) {
  const text = fs.readFileSync(dataFile, 'utf8');
  for (const match of text.matchAll(/['"`](\/assets\/images\/[^'"`]+\.webp)['"`]/g)) {
    referenced.set(match[1], dataFile);
  }
}
for (const [url, source] of referenced) {
  requireFile(url, source);
}

const expectedVariants = [
  ['items/item_br_01.webp', 'items/item_br_01-256.webp'],
  ['achievements/badge_ach_first_win.webp', 'achievements/badge_ach_first_win-128.webp'],
  ['avatars/avatar_user.webp', 'avatars/avatar_user-64.webp'],
  ['cards/card_magnifier.webp', 'cards/card_magnifier-128.webp'],
  ['events/event_art_boom.webp', 'events/event_art_boom-256.webp'],
  ['backgrounds/bg_lobby.webp', 'backgrounds/bg_lobby-960.webp'],
];
for (const [main, variant] of expectedVariants) {
  requireFile(`/assets/images/${main}`, '원본');
  requireFile(`/assets/images/${variant}`, '변형');
}

for (const legacy of ['item_04.webp', 'item_08.webp', 'item_11.webp', 'item_12.webp']) {
  const full = path.join(IMAGE_ROOT, 'items', legacy);
  if (fs.existsSync(full)) failures.push(`미사용 레거시 파일이 남아 있음: items/${legacy}`);
}

const categoryBytes = {};
for (const file of imageFiles) {
  const category = path.relative(IMAGE_ROOT, file).split(path.sep)[0];
  categoryBytes[category] = (categoryBytes[category] || 0) + fs.statSync(file).size;
}

if (failures.length > 0) {
  console.error('[assets] 예산·무결성 검사 실패');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('[assets] 예산·무결성 검사 통과');
console.log(`  public 전체: ${(publicBytes / 1024).toFixed(1)} KB / 5,120 KB`);
console.log(`  이미지 파일: ${imageFiles.length}개, ${(Object.values(categoryBytes).reduce((a, b) => a + b, 0) / 1024).toFixed(1)} KB`);
for (const [category, bytes] of Object.entries(categoryBytes).sort()) {
  console.log(`  ${category}: ${(bytes / 1024).toFixed(1)} KB`);
}
if (warnings.length > 0) {
  for (const warning of warnings) console.warn(`  경고: ${warning}`);
}
