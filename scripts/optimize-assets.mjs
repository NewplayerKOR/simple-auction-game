import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * PERF-ASSET-001 에셋 파이프라인.
 *
 * 사용법:
 *   node scripts/optimize-assets.mjs [원본_이미지_디렉터리]
 *
 * 기본 원본 경로는 `assets-src/images`다. 이 저장소는 원본을 Git 이력에만 보관하므로
 * 현재 `public/assets/images`를 다시 최적화할 때는 그 경로를 인자로 넘긴다.
 * 이미 최적화된 파일에 재실행하면 품질이 다시 낮아질 수 있으므로 원본에만 실행한다.
 */
const sourceRoot = path.resolve(process.argv[2] || 'assets-src/images');
const outputRoot = path.resolve('public/assets/images');

if (!fs.existsSync(sourceRoot)) {
  console.error(`[assets] 원본 이미지 디렉터리를 찾지 못했습니다: ${sourceRoot}`);
  console.error('[assets] 사용법: node scripts/optimize-assets.mjs <원본_이미지_디렉터리>');
  process.exit(1);
}

const UNUSED_ITEM_FILES = ['item_04.webp', 'item_08.webp', 'item_11.webp', 'item_12.webp'];

const jobs = [
  { dir: 'items', pattern: /^item_.+\.webp$/, width: 512, height: 512, quality: 78, variant: { suffix: '-256', width: 256, height: 256, quality: 68 } },
  { dir: 'achievements', pattern: /^badge_.+\.webp$/, width: 256, height: 256, quality: 82, variant: { suffix: '-128', width: 128, height: 128, quality: 80 } },
  { dir: 'avatars', pattern: /^avatar_.+\.webp$/, width: 128, height: 128, quality: 82, variant: { suffix: '-64', width: 64, height: 64, quality: 80 } },
  { dir: 'cards', pattern: /^card_.+\.webp$/, width: 256, height: 256, quality: 80, variant: { suffix: '-128', width: 128, height: 128, quality: 78 } },
  { dir: 'events', pattern: /^event_.+\.webp$/, width: 512, quality: 78, variant: { suffix: '-256', width: 256, quality: 76 } },
  { dir: 'ui', pattern: /^icon_.+\.webp$/, width: 128, height: 128, quality: 82 },
  { dir: 'ui', pattern: /^stamp_.+\.webp$/, width: 256, height: 256, quality: 82 },
  { dir: 'backgrounds', pattern: /^bg_.+\.webp$/, width: 1280, height: 720, quality: 62, variant: { suffix: '-960', width: 960, height: 540, quality: 58 } },
];

const report = [];

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const writeImage = async (input, output, width, height, quality) => {
  ensureDir(path.dirname(output));
  const pipeline = sharp(input).rotate().resize({
    width,
    height,
    fit: 'cover',
    position: 'centre',
    withoutEnlargement: true,
  });
  const buffer = await pipeline.webp({ quality, effort: 6 }).toBuffer();
  fs.writeFileSync(output, buffer);
  return buffer.length;
};

const run = async () => {
  for (const job of jobs) {
    const sourceDir = path.join(sourceRoot, job.dir);
    const targetDir = path.join(outputRoot, job.dir);
    if (!fs.existsSync(sourceDir)) continue;
    ensureDir(targetDir);

    const files = fs.readdirSync(sourceDir).filter((name) => job.pattern.test(name)).sort();
    for (const name of files) {
      if (job.dir === 'items' && UNUSED_ITEM_FILES.includes(name)) continue;
      const sourcePath = path.join(sourceDir, name);
      const input = fs.readFileSync(sourcePath);
      const targetPath = path.join(targetDir, name);
      const mainBytes = await writeImage(input, targetPath, job.width, job.height, job.quality);
      report.push({ file: path.relative(outputRoot, targetPath), bytes: mainBytes });

      if (job.variant) {
        const variantName = name.replace(/\.webp$/, `${job.variant.suffix}.webp`);
        const variantPath = path.join(targetDir, variantName);
        const variantBytes = await writeImage(
          input,
          variantPath,
          job.variant.width,
          job.variant.height,
          job.variant.quality
        );
        report.push({ file: path.relative(outputRoot, variantPath), bytes: variantBytes });
      }
    }
  }

  for (const name of UNUSED_ITEM_FILES) {
    const targetPath = path.join(outputRoot, 'items', name);
    if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
  }

  const totalBytes = report.reduce((sum, entry) => sum + entry.bytes, 0);
  console.log(`[assets] ${report.length}개 파일 생성, ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  for (const entry of report.sort((a, b) => b.bytes - a.bytes).slice(0, 10)) {
    console.log(`  ${(entry.bytes / 1024).toFixed(1)} KB  ${entry.file}`);
  }
};

run().catch((error) => {
  console.error('[assets] 최적화 실패:', error);
  process.exit(1);
});
