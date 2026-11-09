import { describe, it, expect, beforeEach } from 'vitest';
import { useCareerStore, checkIsBankrupt } from '../src/stores/useCareerStore';
import { BANKRUPTCY_CONFIG } from '../src/data/constants';
import { Item } from '../src/types';

describe('QA-404: DEV-308 Strict Economy, Loss Erosion & Bankruptcy Rollback', () => {
  beforeEach(() => {
    useCareerStore.getState().resetCareer();
  });

  it('1. Bankruptcy threshold detection logic', () => {
    // Normal healthy state
    expect(checkIsBankrupt(5000, 5000)).toBe(false);
    expect(checkIsBankrupt(400, 2000)).toBe(false); // Net worth >= 1000
    expect(checkIsBankrupt(1000, 800)).toBe(false); // Cash >= 500

    // Bankrupt state: Cash < 500 AND Net Worth < 1000
    expect(checkIsBankrupt(499, 999)).toBe(true);
    expect(checkIsBankrupt(0, 0)).toBe(true);
    expect(checkIsBankrupt(-500, -200)).toBe(true);
  });

  it('2. Net worth erosion and loss reflection on game completion', () => {
    const store = useCareerStore.getState();
    expect(store.profile.careerCash).toBe(5000);
    expect(store.profile.careerNetWorth).toBe(5000);

    // Enter room with fee ,000 (SILVER)
    // First simulate enough net worth to enter silver
    useCareerStore.setState({
      profile: {
        ...store.profile,
        careerCash: 20000,
        careerNetWorth: 20000
      }
    });

    const entered = useCareerStore.getState().enterRoom('SILVER');
    expect(entered).toBe(true);
    expect(useCareerStore.getState().profile.careerCash).toBe(19000);
    expect(useCareerStore.getState().profile.careerNetWorth).toBe(19000);

    // Player lost money during the game (e.g. -19,000 resulting in  cash, and acquired 1 fake item )
    const fakeItem: Item = {
      id: 'fake_01',
      tier: 'BRONZE',
      name: '위작 골동품',
      category: 'ANTIQUE',
      estimatedMin: 5000,
      estimatedMax: 8000,
      realValue: 0,
      isFake: true,
      startingBid: 1000,
      isAppraised: true,
      dutchStartPrice: 10000,
      dutchFloorPrice: 2000,
      dutchDropRatePerSec: 100,
      appraisalCost: 500,
      imageUrl: '/assets/images/items/bronze/item_pottery.webp',
      description: '가짜 유물'
    };

    const session = useCareerStore.getState().profile.activeSession!;
    const result = useCareerStore.getState().commitGameResult({
      sessionId: session.sessionId,
      outcome: 'NORMAL',
      endingCash: 200,
      acquiredItems: [fakeItem],
      isWinner: false,
      unlockedAchievementIds: [],
    });
    expect(result.newNetWorth).toBe(200);
    expect(result.isBankrupt).toBe(true);

    const updatedProfile = useCareerStore.getState().profile;
    expect(updatedProfile.careerCash).toBe(200);
    expect(updatedProfile.careerNetWorth).toBe(200);
    expect(updatedProfile.isBankrupt).toBe(true);
    // Fake item should NOT be added to permanent vault
    expect(updatedProfile.vaultItemIds).not.toContain('fake_01');
  });

  it('3. declareBankruptcy executes recovery bailout to seed ,000 and clears vault', () => {
    // Put store in bankrupt state with some fake/previous items
    useCareerStore.setState({
      profile: {
        storageVersion: '2.3.1',
        careerCash: -1200,
        careerNetWorth: 300,
        vaultItemIds: ['item_bz_01', 'item_bz_02'],
        unlockedAchievementIds: ['ach-first-win'],
        highestRoomTierUnlocked: 'GOLD',
        totalGamesPlayed: 5,
        totalWins: 1,
        isBankrupt: true,
        bankruptcyCount: 0,
        lastUpdatedTimestamp: Date.now()
      }
    });

    expect(useCareerStore.getState().profile.isBankrupt).toBe(true);

    // Execute bailout
    useCareerStore.getState().declareBankruptcy();

    const recovered = useCareerStore.getState().profile;
    expect(recovered.careerCash).toBe(BANKRUPTCY_CONFIG.SEED_RECOVERY_CASH); // ,000
    expect(recovered.careerNetWorth).toBe(BANKRUPTCY_CONFIG.SEED_RECOVERY_CASH); // ,000
    expect(recovered.vaultItemIds).toEqual([]); // Cleared for debt liquidation
    expect(recovered.highestRoomTierUnlocked).toBe('BRONZE'); // Reset to starter room
    expect(recovered.isBankrupt).toBe(false); // No longer bankrupt
    expect(recovered.bankruptcyCount).toBe(1); // Increment count
  });
});
