import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MASTER_ITEMS } from '../src/data/masterItems';
import { MASTER_BOTS } from '../src/data/masterBots';
import { MASTER_ACHIEVEMENTS } from '../src/data/masterAchievements';
import { MASTER_EVENTS } from '../src/data/masterEvents';
import { CHANCE_CARDS_MASTER } from '../src/data/chanceCards';

const PUBLIC_DIR = path.resolve(__dirname, '../public');

describe('QA-306: 모든 비주얼 이미지 에셋 경로 및 무결성(404 에러 방지) 전수 검증', () => {

  it('1. 30종 마스터 아이템(MASTER_ITEMS)의 imageUrl 파일 실존 및 용량 검증', () => {
    expect(MASTER_ITEMS.length).toBe(30);

    MASTER_ITEMS.forEach((item) => {
      expect(item.imageUrl).toBeDefined();
      expect(item.imageUrl.startsWith('/assets/images/items/')).toBe(true);

      const filePath = path.join(PUBLIC_DIR, item.imageUrl.replace(/^\//, ''));
      expect(fs.existsSync(filePath), `아이템 이미지 파일 미존재: ${filePath}`).toBe(true);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(1000); // 1KB 이상 정상 이미지
    });
  });

  it('2. AI 봇 3인 및 유저 아바타(avatar) 파일 실존 및 용량 검증', () => {
    expect(MASTER_BOTS.length).toBe(3);

    // 봇 아바타 검증
    MASTER_BOTS.forEach((bot) => {
      expect(bot.avatar).toBeDefined();
      expect(bot.avatar.startsWith('/assets/images/avatars/')).toBe(true);

      const filePath = path.join(PUBLIC_DIR, bot.avatar.replace(/^\//, ''));
      expect(fs.existsSync(filePath), `봇 아바타 미존재: ${filePath}`).toBe(true);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(1000);
    });

    // 유저 아바타 검증
    const userAvatarPath = path.join(PUBLIC_DIR, 'assets/images/avatars/avatar_user.webp');
    expect(fs.existsSync(userAvatarPath)).toBe(true);
    expect(fs.statSync(userAvatarPath).size).toBeGreaterThan(1000);
  });

  it('3. 6종 업적(MASTER_ACHIEVEMENTS)의 badgeImageUrl 파일 실존 및 용량 검증', () => {
    expect(MASTER_ACHIEVEMENTS.length).toBe(6);


    MASTER_ACHIEVEMENTS.forEach((ach) => {
      expect(ach.badgeImageUrl!).toBeDefined();
      expect(ach.badgeImageUrl!.startsWith('/assets/images/achievements/')).toBe(true);

      const filePath = path.join(PUBLIC_DIR, ach.badgeImageUrl!.replace(/^\//, ''));
      expect(fs.existsSync(filePath), `업적 뱃지 미존재: ${filePath}`).toBe(true);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(1000);
    });
  });

  it('4. 3종 찬스 카드(CHANCE_CARDS_MASTER)의 imageUrl 파일 실존 및 용량 검증', () => {
    const cardList = Object.values(CHANCE_CARDS_MASTER);
    expect(cardList.length).toBe(3);

    cardList.forEach((card) => {
      expect(card.imageUrl!).toBeDefined();
      expect(card.imageUrl!.startsWith('/assets/images/cards/')).toBe(true);

      const filePath = path.join(PUBLIC_DIR, card.imageUrl!.replace(/^\//, ''));
      expect(fs.existsSync(filePath), `찬스 카드 이미지 미존재: ${filePath}`).toBe(true);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(1000);
    });
  });

  it('5. 4종 돌발 시장 이벤트(MASTER_EVENTS)의 imageUrl 파일 실존 및 용량 검증', () => {
    expect(MASTER_EVENTS.length).toBe(4);

    MASTER_EVENTS.forEach((event) => {
      expect(event.imageUrl!).toBeDefined();
      expect(event.imageUrl!.startsWith('/assets/images/events/')).toBe(true);

      const filePath = path.join(PUBLIC_DIR, event.imageUrl!.replace(/^\//, ''));
      expect(fs.existsSync(filePath), `이벤트 배너 이미지 미존재: ${filePath}`).toBe(true);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(1000);
    });
  });

  it('6. 3종 배경(Backgrounds) 및 4종 UI/시스템 아이콘 파일 실존 및 용량 검증', () => {
    const requiredSystemAssets = [
      'assets/images/backgrounds/bg_auction_hall.webp',
      'assets/images/backgrounds/bg_museum_gallery.webp',
      'assets/images/backgrounds/bg_lobby.webp',
      'assets/images/ui/stamp_fake.webp',
      'assets/images/ui/stamp_genuine.webp',
      'assets/images/ui/icon_sealed_envelope.webp',
      'assets/images/ui/icon_vip_loan.webp',
    ];

    requiredSystemAssets.forEach((assetRelPath) => {
      const filePath = path.join(PUBLIC_DIR, assetRelPath);
      expect(fs.existsSync(filePath), `시스템/배경 에셋 미존재: ${filePath}`).toBe(true);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(500);
    });
  });

  it('7. src/ 디렉터리 내의 모든 정적 이미지 URL 참조(/assets/images/...) 전수 무결성 검증 (Broken Link 0건)', () => {
    const srcDir = path.resolve(__dirname, '../src');

    function getAllFiles(dir: string, fileList: string[] = []): string[] {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          getAllFiles(filePath, fileList);
        } else if (/\.(tsx?|css|html)$/.test(file)) {
          fileList.push(filePath);
        }
      });
      return fileList;
    }

    const allSrcFiles = getAllFiles(srcDir);
    const assetRegex = /\/assets\/images\/[a-zA-Z0-9_\-\/]+\.webp/g;
    const foundPaths = new Set<string>();

    allSrcFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(assetRegex);
      if (matches) {
        matches.forEach((p) => foundPaths.add(p));
      }
    });

    expect(foundPaths.size).toBeGreaterThan(10);

    foundPaths.forEach((relPath) => {
      const realFilePath = path.join(PUBLIC_DIR, relPath.replace(/^\//, ''));
      expect(fs.existsSync(realFilePath), `코드에서 참조 중이나 실제 파일이 존재하지 않음 (404 위험): ${relPath}`).toBe(true);
    });
  });
});
