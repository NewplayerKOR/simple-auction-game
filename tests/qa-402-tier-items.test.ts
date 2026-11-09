import { describe, it, expect } from 'vitest';
import { MASTER_ITEMS, createTierItemQueue } from '../src/data/masterItems';
import { ROOM_TIER_ORDER } from '../src/data/roomTiers';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

describe('DEV-304: 30종 고유 유물 데이터셋 및 티어별 큐 추출기 (5개 티어)', () => {
  it('총 유물 데이터셋은 정확히 30종이어야 하며 5개 티어별로 6종씩 분할되어야 한다', () => {
    expect(MASTER_ITEMS.length).toBe(30);

    const bronzeItems = MASTER_ITEMS.filter((i) => i.tier === 'BRONZE');
    const silverItems = MASTER_ITEMS.filter((i) => i.tier === 'SILVER');
    const goldItems = MASTER_ITEMS.filter((i) => i.tier === 'GOLD');
    const diamondItems = MASTER_ITEMS.filter((i) => i.tier === 'DIAMOND');
    const blackMarketItems = MASTER_ITEMS.filter((i) => i.tier === 'BLACK_MARKET');

    expect(bronzeItems.length).toBe(6);
    expect(silverItems.length).toBe(6);
    expect(goldItems.length).toBe(6);
    expect(diamondItems.length).toBe(6);
    expect(blackMarketItems.length).toBe(6);
  });

  it('모든 30종 유물은 고유한 ID와 유효한 더치 역경매 파라미터(시작가 > 바닥가, 초당 하락률 > 0)를 가져야 한다', () => {
    const ids = new Set<string>();

    MASTER_ITEMS.forEach((item) => {
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);

      expect(item.dutchStartPrice).toBeGreaterThan(item.dutchFloorPrice);
      expect(item.dutchDropRatePerSec).toBeGreaterThan(0);
      expect(item.estimatedMax).toBeGreaterThan(item.estimatedMin);
      expect(item.realValue).toBeGreaterThan(0);
    });
  });

  it('모든 30종 유물은 고유한 런타임 이미지 URL과 실제 WebP 파일을 가져야 한다', () => {
    const imageUrls = MASTER_ITEMS.map((item) => item.imageUrl);
    expect(new Set(imageUrls).size).toBe(MASTER_ITEMS.length);

    imageUrls.forEach((imageUrl) => {
      const runtimePath = join(process.cwd(), 'public', imageUrl.replace(/^\//, ''));
      expect(imageUrl.endsWith('.webp')).toBe(true);
      expect(existsSync(runtimePath), `Missing runtime asset: ${runtimePath}`).toBe(true);
    });
  });

  it('createTierItemQueue(tier)는 해당 티어의 6종 중 5종을 무작위 비복원 추출하여 중복 출품 0%를 보장해야 한다', () => {
    ROOM_TIER_ORDER.forEach((tier) => {
      const queue = createTierItemQueue(tier);
      expect(queue.length).toBe(5);

      // 모든 아이템이 해당 티어에 속해야 함
      queue.forEach((item) => {
        expect(item.tier).toBe(tier);
      });

      // 5종 내 중복 ID 0% 보장
      const queueIds = new Set(queue.map((i) => i.id));
      expect(queueIds.size).toBe(5);
    });
  });
});
