import { describe, it, expect, beforeEach } from 'vitest';
import { useCareerStore, evaluateRoomGating } from '../src/stores/useCareerStore';
import { ROOM_TIERS_MASTER } from '../src/data/roomTiers';
import { RoomTier } from '../src/types';
import { MASTER_ITEMS } from '../src/data/masterItems';

// Mock localStorage for Node test runner
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

describe('DEV-301, DEV-302, DEV-303: Career Profile & 4-Tier Room Gating', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useCareerStore.getState().resetCareer();
  });


  it('DEV-302: 신규 유저는 초기 ,000의 자본금 및 순자산으로 시작해야 한다', () => {
    const profile = useCareerStore.getState().profile;
    expect(profile.careerCash).toBe(5000);
    expect(profile.careerNetWorth).toBe(5000);
    expect(profile.storageVersion).toBe('2.3.1');
    expect(profile.vaultItemIds).toEqual([]);
    expect(profile.highestRoomTierUnlocked).toBe('BRONZE');
  });

  it('DEV-303: 4단계 룸 티어별 순자산 커트라인 및 입장료 게이팅이 정확히 작동해야 한다', () => {
    const profile = useCareerStore.getState().profile; // NetWorth ,000, Cash ,000

    // 1. Bronze (조건: , 입장료: ) -> 입장 가능
    const bronzeStatus = evaluateRoomGating('BRONZE', profile);
    expect(bronzeStatus.isUnlocked).toBe(true);
    expect(bronzeStatus.canAffordFee).toBe(true);
    expect(bronzeStatus.isPlayable).toBe(true);

    // 2. Silver (조건: ,000, 입장료: ,000) -> 잠김 (부족액 ,000)
    const silverStatus = evaluateRoomGating('SILVER', profile);
    expect(silverStatus.isUnlocked).toBe(false);
    expect(silverStatus.netWorthDeficit).toBe(10000);
    expect(silverStatus.isPlayable).toBe(false);

    // 3. Gold (조건: ,000, 입장료: ,000) -> 잠김
    const goldStatus = evaluateRoomGating('GOLD', profile);
    expect(goldStatus.isUnlocked).toBe(false);
    expect(goldStatus.isPlayable).toBe(false);

    // 4. Diamond (조건: ,000, 입장료: ,000) -> 잠김
    const diamondStatus = evaluateRoomGating('DIAMOND', profile);
    expect(diamondStatus.isUnlocked).toBe(false);
    expect(diamondStatus.isPlayable).toBe(false);
  });

  it('DEV-303: 룸 입장 시 입장료가 보유 현금에서 즉시 차감되어야 한다', () => {
    const enterBronze = useCareerStore.getState().enterRoom('BRONZE');
    expect(enterBronze).toBe(true);
    expect(useCareerStore.getState().profile.careerCash).toBe(5000); // 브론즈는 무료
    const bronzeSession = useCareerStore.getState().profile.activeSession!;
    useCareerStore.getState().commitGameResult({
      sessionId: bronzeSession.sessionId,
      outcome: 'ABANDONED',
      endingCash: 5000,
      acquiredItems: [],
      isWinner: false,
      unlockedAchievementIds: [],
    });

    // 실버 룸 강제 해금 시뮬레이션
    useCareerStore.setState((prev) => ({
      profile: { ...prev.profile, careerCash: 20000, careerNetWorth: 20000 }
    }));

    const enterSilver = useCareerStore.getState().enterRoom('SILVER');
    expect(enterSilver).toBe(true);
    expect(useCareerStore.getState().profile.careerCash).toBe(19000); // ,000 차감
  });

  it('DEV-302: 게임 종료 시 판당 수익과 획득 유물이 영구 누적되고 티어가 자동 승급되어야 한다', () => {
    useCareerStore.setState((state) => ({
      profile: { ...state.profile, careerCash: 60000, careerNetWorth: 60000 },
    }));
    expect(useCareerStore.getState().enterRoom('GOLD')).toBe(true);
    const session = useCareerStore.getState().profile.activeSession!;
    const mockWonItems = [{ ...MASTER_ITEMS.find((item) => item.id === 'item_gd_01')!, isFake: false, isAppraised: true }];

    const result = useCareerStore.getState().commitGameResult({
      sessionId: session.sessionId,
      outcome: 'NORMAL',
      endingCash: 10000,
      acquiredItems: mockWonItems,
      isWinner: true,
      unlockedAchievementIds: [],
    });

    const updatedProfile = useCareerStore.getState().profile;
    expect(updatedProfile.careerCash).toBe(10000); // 기존 현금 합산이 아닌 세션 종료 잔액 교체
    expect(updatedProfile.vaultItemIds).toContain('item_gd_01');
    expect(updatedProfile.careerNetWorth).toBe(10000 + 55000);
    expect(updatedProfile.highestRoomTierUnlocked).toBe('GOLD');
    expect(result.promotedTier).toBe('GOLD');
    expect(updatedProfile.totalWins).toBe(1);
    expect(updatedProfile.totalGamesPlayed).toBe(1);
  });
});
