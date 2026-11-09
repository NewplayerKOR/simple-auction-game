import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { MASTER_ITEMS } from '../src/data/masterItems';
import { MASTER_BOTS } from '../src/data/masterBots';
import { MASTER_ACHIEVEMENTS } from '../src/data/masterAchievements';
import { MASTER_EVENTS } from '../src/data/masterEvents';
import { CHANCE_CARDS_MASTER } from '../src/data/chanceCards';

const PUBLIC_ROOT = path.resolve(__dirname, '../public');
const IMAGE_ROOT = path.join(PUBLIC_ROOT, 'assets/images');
const TOTAL_BUDGET = 5 * 1024 * 1024;
const MAX_FILE_BUDGET = 300 * 1024;

const walk = (dir: string): string[] => {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
};

const isWebp = (file: string): boolean => {
  const buffer = fs.readFileSync(file);
  return (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  );
};

const assertAssetExists = (url: string) => {
  const full = path.join(PUBLIC_ROOT, url.replace(/^\//, ''));
  expect(fs.existsSync(full), `에셋 파일 미존재: ${url}`).toBe(true);
  expect(isWebp(full), `실제 WebP가 아님: ${url}`).toBe(true);
};

describe('PERF-ASSET-001 이미지·폰트·번들 예산 회귀', () => {
  it('public 전체 자산과 개별 이미지가 예산 안에 있다', () => {
    const publicFiles = walk(PUBLIC_ROOT);
    const totalBytes = publicFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);
    expect(totalBytes).toBeLessThanOrEqual(TOTAL_BUDGET);

    const imageFiles = walk(IMAGE_ROOT);
    expect(imageFiles.length).toBeGreaterThan(0);
    for (const file of imageFiles) {
      expect(fs.statSync(file).size, `300 KB 초과: ${file}`).toBeLessThanOrEqual(MAX_FILE_BUDGET);
      expect(isWebp(file), `실제 WebP가 아님: ${file}`).toBe(true);
    }
  });

  it('30종 아이템·봇·업적·이벤트·카드 참조 파일이 모두 존재한다', () => {
    expect(MASTER_ITEMS).toHaveLength(30);
    MASTER_ITEMS.forEach((item) => assertAssetExists(item.imageUrl));
    MASTER_BOTS.forEach((bot) => assertAssetExists(bot.avatar));
    MASTER_ACHIEVEMENTS.forEach((achievement) => {
      if (achievement.badgeImageUrl) assertAssetExists(achievement.badgeImageUrl);
    });
    MASTER_EVENTS.forEach((event) => {
      if (event.imageUrl) assertAssetExists(event.imageUrl);
    });
    Object.values(CHANCE_CARDS_MASTER).forEach((card) => {
      if (card.imageUrl) assertAssetExists(card.imageUrl);
    });
  });

  it('표시 크기별 변형 파일과 자체 호스팅 폰트가 존재한다', () => {
    const variants = [
      'items/item_01-256.webp',
      'achievements/badge_ach_first_win-128.webp',
      'avatars/avatar_user-64.webp',
      'cards/card_magnifier-128.webp',
      'events/event_art_boom-256.webp',
      'backgrounds/bg_lobby-960.webp',
    ];
    variants.forEach((variant) => assertAssetExists(`/assets/images/${variant}`));
    expect(fs.existsSync(path.join(PUBLIC_ROOT, 'assets/fonts/cinzel-latin.woff2'))).toBe(true);
  });

  it('미사용 레거시 아이템과 외부 Google Fonts 의존이 없다', () => {
    ['item_04.webp', 'item_08.webp', 'item_11.webp', 'item_12.webp'].forEach((legacy) => {
      expect(fs.existsSync(path.join(IMAGE_ROOT, 'items', legacy))).toBe(false);
    });

    const indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    expect(indexHtml).not.toContain('fonts.googleapis.com');
    expect(indexHtml).not.toContain('Noto+Sans+KR');
    expect(indexHtml).toContain('cinzel-latin.woff2');
  });

  it('이미지 컴포넌트와 지연 로딩 구조를 사용한다', () => {
    const sourceFiles = walk(path.resolve(__dirname, '../src')).filter((file) => file.endsWith('.tsx'));
    const rawImageTags = sourceFiles
      .filter((file) => !file.endsWith('AssetImage.tsx'))
      .flatMap((file) => (fs.readFileSync(file, 'utf8').match(/<img\b/g) ?? []))
      .length;
    expect(rawImageTags).toBe(0);

    const assetImage = fs.readFileSync(
      path.resolve(__dirname, '../src/components/common/AssetImage.tsx'),
      'utf8'
    );
    expect(assetImage).toContain("loading = 'lazy'");
    expect(assetImage).toContain("decoding = 'async'");
    expect(assetImage).toContain('fallbackSrc');

    const app = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf8');
    expect(app).toContain('React.lazy');
    expect(app).toContain('<React.Suspense');
  });
});
