import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../src/services/storageService';
import { MASTER_ITEMS } from '../src/data/masterItems';
import { MASTER_ACHIEVEMENTS } from '../src/data/masterAchievements';
import { STORAGE_KEY_V2 } from '../src/stores/useCareerStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('QA-305: [중요] 영구 도감 로컬 스토리지 캐시 안전성 및 Normalized Hydration 검증', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('1. 로컬 스토리지에 오직 ID 목록과 통계만 저장되는 Normalized Storage 스키마 검증', () => {
    // 아이템 해금
    StorageService.unlockItems(['item_br_01', 'item_sv_01']);

    const rawStored = localStorageMock.getItem(STORAGE_KEY_V2);
    expect(rawStored).not.toBeNull();

    const parsed = JSON.parse(rawStored!);
    
    expect(parsed.storageVersion).toBe('2.3.1');
    expect(parsed.vaultItemIds).toEqual(['item_br_01', 'item_sv_01']);
    
    // item 객체 전체가 저장되지 않아야 함
    expect(parsed.items).toBeUndefined();
    expect(parsed.masterItems).toBeUndefined();
  });

  it('2. getHydratedCodex()가 최신 MASTER_ITEMS와 저장된 ID를 실시간 조인(Hydration)하는지 검증', () => {
    StorageService.unlockItems(['item_br_01']);

    const hydrated = StorageService.getHydratedCodex();
    expect(hydrated.length).toBe(MASTER_ITEMS.length); // 30종 전수 반환

    const item01Entry = hydrated.find(h => h.item.id === 'item_br_01')!;
    expect(item01Entry.isUnlocked).toBe(true);
    expect(item01Entry.item.name).toBe(MASTER_ITEMS.find(i => i.id === 'item_br_01')!.name);

    const lockedEntry = hydrated.find(h => h.item.id === 'item_dm_01')!;
    expect(lockedEntry.isUnlocked).toBe(false);
  });

  it('3. [핵심 시나리오] 마스터 데이터셋(이름, 이미지, 가치 등)이 수정 배포되더라도 로컬스토리지의 stale 데이터로 덮어쓰지 않고 최신 데이터로 하이드레이션되는지 검증', () => {
    StorageService.unlockItems(['item_br_01']);

    const originalItem = MASTER_ITEMS.find(i => i.id === 'item_br_01')!;
    const originalName = originalItem.name;
    const originalRealValue = originalItem.realValue;

    try {
      // 마스터 데이터 업데이트 시뮬레이션
      originalItem.name = '로마 제국 청동 동전 (2026 리마스터 복원판)';
      originalItem.realValue = 99999;

      const hydrated = StorageService.getHydratedCodex();
      const item01Hydrated = hydrated.find(h => h.item.id === 'item_br_01')!;

      expect(item01Hydrated.isUnlocked).toBe(true);
      expect(item01Hydrated.item.name).toBe('로마 제국 청동 동전 (2026 리마스터 복원판)');
      expect(item01Hydrated.item.realValue).toBe(99999);
    } finally {
      originalItem.name = originalName;
      originalItem.realValue = originalRealValue;
    }
  });

  it('4. 업적(MASTER_ACHIEVEMENTS) 역시 ID 기반으로 최신 배포 데이터와 안전하게 하이드레이션되는지 검증', () => {
    StorageService.unlockAchievements(['ach-first-win']);

    const hydratedAch = StorageService.getHydratedAchievements();
    expect(hydratedAch.length).toBe(MASTER_ACHIEVEMENTS.length);

    const firstWinAch = hydratedAch.find(a => a.achievement.id === 'ach-first-win')!;
    expect(firstWinAch.isUnlocked).toBe(true);
    expect(firstWinAch.achievement.title).toBe(MASTER_ACHIEVEMENTS.find(a => a.id === 'ach-first-win')!.title);
  });

  it('5. 알 수 없는/폐기된 ID가 로컬스토리지에 오염되어 있어도 예외 없이 안전하게 처리되는지(Graceful Fallback) 검증', () => {
    localStorageMock.setItem(STORAGE_KEY_V2, JSON.stringify({
      storageVersion: '2.0.0',
      careerCash: 5000,
      careerNetWorth: 5000,
      vaultItemIds: ['invalid_deprecated_item_id_999', 'item_br_01'],
      unlockedAchievementIds: ['unknown_ach_id_888'],
      totalGamesPlayed: 10,
      totalWins: 5,
    }));

    const hydratedItems = StorageService.getHydratedCodex();
    expect(hydratedItems.length).toBe(MASTER_ITEMS.length);
    expect(hydratedItems.find(h => h.item.id === 'item_br_01')?.isUnlocked).toBe(true);

    const hydratedAch = StorageService.getHydratedAchievements();
    expect(hydratedAch.length).toBe(MASTER_ACHIEVEMENTS.length);
  });
});
