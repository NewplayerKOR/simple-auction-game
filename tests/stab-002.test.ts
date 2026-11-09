import fs from 'fs';
import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  evaluateRoomGating,
  loadProfileFromStorage,
  STORAGE_BACKUP_KEY,
  STORAGE_KEY_V2,
  useCareerStore,
} from '../src/stores/useCareerStore';
import { useAuctionStore } from '../src/stores/useAuctionStore';
import { MASTER_ITEMS } from '../src/data/masterItems';
import { MASTER_ACHIEVEMENTS } from '../src/data/masterAchievements';
import { MASTER_SYNERGIES } from '../src/data/masterSynergies';
import { CategoryMarketRates, Player } from '../src/types';
import {
  calculateConsignmentPayout,
  getAdjustedItemValue,
  getAppraisalCost,
  getSessionItemValue,
} from '../src/services/itemValueService';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

const setCareerFunds = (cash: number, netWorth = cash) => {
  useCareerStore.setState((state) => ({
    profile: {
      ...state.profile,
      careerCash: cash,
      careerNetWorth: netWorth,
      isBankrupt: false,
      activeSession: undefined,
      lastSettlementReceipt: undefined,
    },
  }));
};

const getHuman = (): Player => useAuctionStore.getState().players.find((player) => player.isHuman)!;

const makeMarketRates = (multiplier: number, trend: 'PUMP' | 'DUMP' | 'STABLE' = 'STABLE'): CategoryMarketRates => ({
  lastUpdatedGame: 1,
  rates: {
    PAINTING: { multiplier, trend, newsHeadline: 'test' },
    ANTIQUE: { multiplier, trend, newsHeadline: 'test' },
    JEWELRY: { multiplier, trend, newsHeadline: 'test' },
  },
});

const failProfileWrites = () => {
  const originalSetItem = localStorageMock.setItem;
  vi.spyOn(localStorageMock, 'setItem').mockImplementation((key: string, value: string) => {
    if (key === STORAGE_KEY_V2) throw new Error('quota exceeded');
    originalSetItem(key, value);
  });
};

describe('STAB-002 v2.3.1 P1 data/economy/display stabilization', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    useAuctionStore.getState().tickEngine.stop();
    localStorageMock.clear();
    useCareerStore.getState().resetCareer();
    useAuctionStore.setState({ currentView: 'LOBBY', fsmState: 'IDLE' });
  });

  it('QD-01 repairs an invalid room tier and invalid nested state instead of crashing', () => {
    localStorageMock.setItem(STORAGE_KEY_V2, JSON.stringify({
      storageVersion: '2.3.1',
      careerCash: 20_000,
      careerNetWorth: 'not-a-number',
      vaultItemIds: ['item_br_01', 'unknown_item'],
      vaultItemStates: {
        item_br_01: { condition: 'PLATINUM', isJackpot: true },
        unknown_item: { condition: 'PRISTINE' },
      },
      unlockedAchievementIds: ['ach-first-win', 'unknown-achievement'],
      highestRoomTierUnlocked: 'PLATINUM',
      blackVipTicketCount: -3,
      totalGamesPlayed: 2,
      totalWins: 1,
    }));

    const recovered = loadProfileFromStorage();
    expect(recovered.highestRoomTierUnlocked).toBe('SILVER');
    expect(recovered.careerNetWorth).toBe(20_000);
    expect(recovered.vaultItemIds).toEqual(['item_br_01']);
    expect(recovered.vaultItemStates).toEqual({});
    expect(recovered.unlockedAchievementIds).toEqual(['ach-first-win']);
    expect(recovered.blackVipTicketCount).toBe(0);
    expect(() => evaluateRoomGating('BRONZE', recovered)).not.toThrow();
  });

  it('QD-01 backs up a corrupt JSON profile and loads safe defaults', () => {
    const corrupt = '{not-json';
    localStorageMock.setItem(STORAGE_KEY_V2, corrupt);
    const recovered = loadProfileFromStorage();
    expect(recovered.careerCash).toBe(5_000);
    expect(localStorageMock.getItem(STORAGE_BACKUP_KEY)).toBe(corrupt);
  });

  it('QD-01 provides an ErrorBoundary around the application', () => {
    const mainSource = fs.readFileSync(path.resolve(__dirname, '../src/main.tsx'), 'utf-8');
    const boundarySource = fs.readFileSync(
      path.resolve(__dirname, '../src/components/common/ErrorBoundary.tsx'),
      'utf-8'
    );
    expect(mainSource).toContain('<ErrorBoundary>');
    expect(boundarySource).toContain('getDerivedStateFromError');
    expect(boundarySource).toContain('STORAGE_BACKUP_KEY');
  });

  it('QD-02 blocks room entry and keeps state when profile persistence fails', () => {
    setCareerFunds(20_000);
    failProfileWrites();

    expect(useCareerStore.getState().enterRoom('SILVER')).toBe(false);
    expect(useCareerStore.getState().profile.careerCash).toBe(20_000);
    expect(useCareerStore.getState().profile.activeSession).toBeUndefined();
    expect(useCareerStore.getState().persistenceError).toBeTruthy();
  });

  it('QD-02 keeps the active session and blocks the result transition when settlement save fails', () => {
    setCareerFunds(20_000);
    expect(useCareerStore.getState().enterRoom('SILVER')).toBe(true);
    const sessionId = useCareerStore.getState().profile.activeSession!.sessionId;
    failProfileWrites();

    const result = useCareerStore.getState().commitGameResult({
      sessionId,
      outcome: 'NORMAL',
      endingCash: 19_000,
      acquiredItems: [],
      isWinner: false,
      unlockedAchievementIds: [],
    });

    expect(result.status).toBe('SAVE_FAILED');
    expect(useCareerStore.getState().profile.activeSession?.sessionId).toBe(sessionId);
    expect(useCareerStore.getState().profile.careerCash).toBe(19_000);
  });

  it('QD-02 keeps finishGame in the auction view when the final commit fails', () => {
    setCareerFunds(20_000);
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    failProfileWrites();

    useAuctionStore.getState().finishGame();
    expect(useAuctionStore.getState().fsmState).not.toBe('GAME_OVER');
    expect(useAuctionStore.getState().currentView).toBe('AUCTION');
    expect(useCareerStore.getState().profile.activeSession).toBeDefined();
    expect(useCareerStore.getState().persistenceError).toBeTruthy();
  });

  it('QD-02 does not replace a valid profile with defaults when load-time normalization cannot write', () => {
    localStorageMock.setItem(STORAGE_KEY_V2, JSON.stringify({
      storageVersion: '2.3.1',
      careerCash: 12_345,
      careerNetWorth: 12_345,
      vaultItemIds: [],
      unlockedAchievementIds: [],
      highestRoomTierUnlocked: 'SILVER',
      totalGamesPlayed: 1,
      totalWins: 0,
      isBankrupt: false,
      bankruptcyCount: 0,
      lastUpdatedTimestamp: Date.now(),
    }));
    failProfileWrites();

    const loaded = loadProfileFromStorage();
    expect(loaded.careerCash).toBe(12_345);
    expect(loaded.highestRoomTierUnlocked).toBe('SILVER');
  });

  it('QD-03 prevents spending below an outstanding highest bid', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    useAuctionStore.getState().startBidding();
    const item = { ...MASTER_ITEMS[0], appraisalCost: 300, isAppraised: false };
    useAuctionStore.setState((state) => ({
      currentItem: item,
      players: state.players.map((player) => player.isHuman ? { ...player, cash: 5_000 } : player),
    }));

    const user = getHuman();
    expect(useAuctionStore.getState().placeBid(user.id, 5_000)).toBe(true);
    expect(useAuctionStore.getState().requestAppraisal()).toBe(false);
    expect(getHuman().cash).toBe(5_000);

    useAuctionStore.setState((state) => ({
      currentHighestBid: 4_700,
      highestBidder: state.players.find((player) => player.isHuman)!,
    }));
    expect(useAuctionStore.getState().requestAppraisal()).toBe(true);
    expect(getHuman().cash).toBe(4_700);
    useAuctionStore.getState().concludeRound();
    expect(getHuman().cash).toBe(0);
  });

  it('QD-03 blocks appraisal after a sealed bid is already submitted', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    useAuctionStore.setState({ currentRound: 4 });
    useAuctionStore.getState().startRoundIntro();
    useAuctionStore.getState().startBidding();
    useAuctionStore.getState().submitSealedBid(2_000);
    expect(useAuctionStore.getState().requestAppraisal()).toBe(false);
  });

  it('QD-04 deducts the emergency loan repayment when escaping a police raid', () => {
    setCareerFunds(200_000);
    useAuctionStore.getState().startNewGame('BLACK_MARKET', 'ENGLISH');
    expect(useAuctionStore.getState().takeEmergencyLoan()).toBe(true);
    useAuctionStore.getState().triggerPoliceRaid();
    useAuctionStore.getState().escapePoliceRaid();

    // 200,000 - 10,000 entry + 3,000 loan - 3,600 repayment
    expect(useCareerStore.getState().profile.careerCash).toBe(189_400);
    expect(useCareerStore.getState().profile.lastSettlementReceipt?.outcome).toBe('ESCAPED');
  });

  it('QD-04 applies the 30% loan curse to escape settlement', () => {
    const loanCurse = MASTER_ITEMS.find((item) => item.id === 'item_bm_05')!;
    setCareerFunds(200_000, 200_000 + loanCurse.realValue);
    useCareerStore.setState((state) => ({
      profile: { ...state.profile, vaultItemIds: [loanCurse.id] },
    }));
    useAuctionStore.getState().startNewGame('BLACK_MARKET', 'ENGLISH');
    expect(useAuctionStore.getState().takeEmergencyLoan()).toBe(true);
    expect(getHuman().loanRepaymentAmount).toBe(3_900);
    useAuctionStore.getState().triggerPoliceRaid();
    useAuctionStore.getState().escapePoliceRaid();
    expect(useCareerStore.getState().profile.careerCash).toBe(189_100);
  });

  it('QD-05 does not expose hidden realValue in the police raid modal', () => {
    const modalSource = fs.readFileSync(
      path.resolve(__dirname, '../src/components/auction/PoliceRaidModal.tsx'),
      'utf-8'
    );
    expect(modalSource).not.toContain('realValue');
    expect(modalSource).toContain('estimatedMin');
    expect(modalSource).toContain('isAppraised');
  });

  it('QD-06 applies the preservation multiplier exactly once in consignment payout', () => {
    const item = MASTER_ITEMS.find((master) => master.id === 'item_br_03')!;
    const rates = makeMarketRates(2.5, 'PUMP');
    useCareerStore.setState({
      profile: {
        ...useCareerStore.getState().profile,
        careerCash: 5_000,
        careerNetWorth: 5_000,
        vaultItemIds: [item.id],
        vaultItemStates: { [item.id]: { condition: 'DUSTY', isJackpot: false } },
      },
      marketRates: rates,
    });

    const expected = calculateConsignmentPayout(
      item,
      { condition: 'DUSTY', isJackpot: false },
      rates,
      new Set()
    );
    const { payout } = useCareerStore.getState().sellConsignmentItem(item.id);
    expect(payout).toBe(expected);
    expect(payout).toBe(Math.round(Math.round(item.realValue * 0.8) * 2.5));
    expect(useCareerStore.getState().profile.careerCash).toBe(5_000 + expected);
  });

  it('QD-07 persists market rates across a simulated refresh', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    setCareerFunds(20_000);
    expect(useCareerStore.getState().enterRoom('SILVER')).toBe(true);
    const session = useCareerStore.getState().profile.activeSession!;
    useCareerStore.getState().commitGameResult({
      sessionId: session.sessionId,
      outcome: 'NORMAL',
      endingCash: 19_000,
      acquiredItems: [],
      isWinner: false,
      unlockedAchievementIds: [],
    });

    const saved = useCareerStore.getState().profile.marketRates!;
    expect(saved.rates.PAINTING.multiplier).toBe(3.2);
    const refreshed = loadProfileFromStorage();
    expect(refreshed.marketRates?.rates.PAINTING.multiplier).toBe(3.2);
    expect(refreshed.marketRates?.rates.ANTIQUE.trend).toBe('PUMP');
  });

  it('QD-08 uses each item appraisalCost as the authority with exact boundaries', () => {
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    const representatives = [
      'item_br_01',
      'item_sv_01',
      'item_gd_01',
      'item_dm_01',
      'item_bm_01',
    ];

    representatives.forEach((id) => {
      const item = MASTER_ITEMS.find((master) => master.id === id)!;
      const cost = getAppraisalCost(item);
      expect(cost).toBe(item.appraisalCost);

      useAuctionStore.setState((state) => ({
        currentItem: { ...item, isAppraised: false },
        isAppraisalModalOpen: false,
        players: state.players.map((player) => player.isHuman ? { ...player, cash: cost - 1 } : player),
      }));
      expect(useAuctionStore.getState().requestAppraisal()).toBe(false);

      useAuctionStore.setState((state) => ({
        players: state.players.map((player) => player.isHuman ? { ...player, cash: cost } : player),
      }));
      expect(useAuctionStore.getState().requestAppraisal()).toBe(true);
      expect(getHuman().cash).toBe(0);
      useAuctionStore.getState().closeAppraisalModal();
      expect(useAuctionStore.getState().requestAppraisal()).toBe(false);
    });
  });

  it('QD-09 evaluates condition, jackpot, fake, market event, and synergy with one contract', () => {
    const baseItem = MASTER_ITEMS.find((item) => item.id === 'item_sv_04')!;
    const base = { ...baseItem, isFake: false, isJackpot: false, realValue: 10_000 };
    expect(getAdjustedItemValue({ ...base, condition: 'PRISTINE' })).toBe(10_000);
    expect(getAdjustedItemValue({ ...base, condition: 'DUSTY' })).toBe(8_000);
    expect(getAdjustedItemValue({ ...base, condition: 'DAMAGED' })).toBe(5_000);
    expect(getAdjustedItemValue({ ...base, condition: 'RUINED' })).toBe(2_000);
    expect(getAdjustedItemValue({ ...base, condition: 'DUSTY', isJackpot: true })).toBe(20_000);
    expect(getAdjustedItemValue({ ...base, isFake: true })).toBe(0);

    const event = {
      id: 'event_test',
      round: 3,
      title: 'test',
      headline: 'test',
      description: 'test',
      effectType: 'CATEGORY_MULTIPLIER' as const,
      targetCategory: 'PAINTING' as const,
      multiplier: 1.5,
    };
    expect(getSessionItemValue({ ...base, condition: 'DUSTY' }, event)).toBe(12_000);
  });

  it('QD-09 applies adjusted values and excludes fakes from session rankings and synergies', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    const synergy = MASTER_SYNERGIES[0];
    const itemA = { ...MASTER_ITEMS.find((item) => item.id === synergy.requiredItemIds[0])!, realValue: 10_000, condition: 'DUSTY' as const, isFake: false };
    const itemB = { ...MASTER_ITEMS.find((item) => item.id === synergy.requiredItemIds[1])!, realValue: 20_000, condition: 'PRISTINE' as const, isFake: false };
    useAuctionStore.setState((state) => ({
      players: state.players.map((player) => player.isHuman
        ? { ...player, cash: 5_000, inventory: [itemA, itemB] }
        : { ...player, cash: 1_000, inventory: [] }),
    }));
    useAuctionStore.getState().finishGame();

    const userRank = useAuctionStore.getState().settlementSummary!.playerRankings.find((ranking) => ranking.player.isHuman)!;
    expect(userRank.inventoryTotalValue).toBe(28_000);
    expect(userRank.synergyBonusValue).toBe(Math.floor(28_000 * synergy.bonusMultiplier));

    useAuctionStore.getState().returnToLobby();
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    const fakeA = { ...itemA, isFake: true, realValue: 10_000 };
    const fakeB = { ...itemB, isFake: true, realValue: 20_000 };
    useAuctionStore.setState((state) => ({
      players: state.players.map((player) => player.isHuman
        ? { ...player, cash: 5_000, inventory: [fakeA, fakeB] }
        : player),
    }));
    useAuctionStore.getState().finishGame();
    const fakeRank = useAuctionStore.getState().settlementSummary!.playerRankings.find((ranking) => ranking.player.isHuman)!;
    expect(fakeRank.inventoryTotalValue).toBe(0);
    expect(fakeRank.synergyBonusValue).toBe(0);
  });

  it('QD-09 preserves the jackpot state when a session item enters the permanent vault', () => {
    setCareerFunds(20_000);
    expect(useCareerStore.getState().enterRoom('BRONZE')).toBe(true);
    const session = useCareerStore.getState().profile.activeSession!;
    const item = { ...MASTER_ITEMS[0], condition: 'DUSTY' as const, isJackpot: true, isFake: false };
    useCareerStore.getState().commitGameResult({
      sessionId: session.sessionId,
      outcome: 'NORMAL',
      endingCash: 19_000,
      acquiredItems: [item],
      isWinner: false,
      unlockedAchievementIds: [],
    });
    expect(useCareerStore.getState().profile.vaultItemStates?.[item.id]).toEqual({
      condition: 'DUSTY',
      isJackpot: true,
    });
    expect(useCareerStore.getState().profile.careerNetWorth).toBe(19_000 + item.realValue * 2);
    const hydrated = useCareerStore.getState().getHydratedVaultItems().find((vaultItem) => vaultItem.id === item.id)!;
    expect(hydrated.realValue).toBe(item.realValue * 2);
    expect(hydrated.condition).toBe('DUSTY');
    expect(hydrated.isJackpot).toBe(true);
  });

  it('QD-15 rejects NaN, Infinity, and fractional bids', () => {
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    useAuctionStore.getState().startBidding();
    const user = getHuman();
    expect(useAuctionStore.getState().placeBid(user.id, Number.NaN)).toBe(false);
    expect(useAuctionStore.getState().placeBid(user.id, Number.POSITIVE_INFINITY)).toBe(false);
    expect(useAuctionStore.getState().placeBid(user.id, 1_000.5)).toBe(false);
  });

  it('QD-16 uses the master achievement length as the denominator', () => {
    const headerSource = fs.readFileSync(path.resolve(__dirname, '../src/components/common/Header.tsx'), 'utf-8');
    const codexSource = fs.readFileSync(path.resolve(__dirname, '../src/components/codex/CodexModal.tsx'), 'utf-8');
    expect(MASTER_ACHIEVEMENTS.length).toBe(6);
    expect(headerSource).toContain('MASTER_ACHIEVEMENTS.length');
    expect(codexSource).toContain('hydratedAchievements.length');
  });

  it('QD-17 grants iron vault only without net worth loss at $25,000', () => {
    setCareerFunds(25_000);
    expect(useCareerStore.getState().enterRoom('BRONZE')).toBe(true);
    let session = useCareerStore.getState().profile.activeSession!;
    useCareerStore.getState().commitGameResult({
      sessionId: session.sessionId,
      outcome: 'NORMAL',
      endingCash: 25_000,
      acquiredItems: [],
      isWinner: false,
      unlockedAchievementIds: [],
    });
    expect(useCareerStore.getState().profile.unlockedAchievementIds).toContain('ach-iron-vault');

    useCareerStore.getState().resetCareer();
    setCareerFunds(25_000);
    expect(useCareerStore.getState().enterRoom('BRONZE')).toBe(true);
    session = useCareerStore.getState().profile.activeSession!;
    useCareerStore.getState().commitGameResult({
      sessionId: session.sessionId,
      outcome: 'NORMAL',
      endingCash: 24_999,
      acquiredItems: [],
      isWinner: false,
      unlockedAchievementIds: [],
    });
    expect(useCareerStore.getState().profile.unlockedAchievementIds).not.toContain('ach-iron-vault');
  });

  it('QD-18 does not grant forgery hunter without a win', () => {
    setCareerFunds(20_000);
    expect(useCareerStore.getState().enterRoom('BRONZE')).toBe(true);
    const session = useCareerStore.getState().profile.activeSession!;
    const genuine = { ...MASTER_ITEMS[0], isFake: false, isAppraised: true };
    useCareerStore.getState().commitGameResult({
      sessionId: session.sessionId,
      outcome: 'NORMAL',
      endingCash: 19_000,
      acquiredItems: [genuine],
      isWinner: false,
      unlockedAchievementIds: [],
    });
    expect(useCareerStore.getState().profile.unlockedAchievementIds).not.toContain('ach-forgery-hunter');
  });

  it('QD-19 reports only newly unlocked achievements on the result screen', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    setCareerFunds(20_000);
    useCareerStore.setState((state) => ({
      profile: { ...state.profile, unlockedAchievementIds: ['ach-first-win'] },
    }));
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    const genuine = { ...MASTER_ITEMS[0], isFake: false, realValue: 3_000 };
    useAuctionStore.setState((state) => ({
      players: state.players.map((player) => player.isHuman
        ? { ...player, cash: 20_000, inventory: [genuine] }
        : { ...player, cash: 1_000, inventory: [] }),
    }));
    useAuctionStore.getState().finishGame();

    const summary = useAuctionStore.getState().settlementSummary!;
    expect(summary.newlyUnlockedAchievementIds).not.toContain('ach-first-win');
    expect(summary.newlyUnlockedAchievementIds).toContain('ach-forgery-hunter');
  });

  it('QD-21 refreshes baseIncrement per round', () => {
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    const queue = useAuctionStore.getState().auctionQueue;
    useAuctionStore.setState({ currentRound: 2 });
    useAuctionStore.getState().startRoundIntro();
    expect(useAuctionStore.getState().baseIncrement).toBe(
      Math.max(100, Math.round(queue[1].startingBid * 0.1))
    );
  });

  it('QD-22 accepts an explicit zero sealed bid as a fold', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    useAuctionStore.setState({ currentRound: 4 });
    useAuctionStore.getState().startRoundIntro();
    useAuctionStore.getState().startBidding();
    useAuctionStore.getState().submitSealedBid(0);

    expect(useAuctionStore.getState().fsmState).toBe('SEALED_BID_REVEALED');
    expect(useAuctionStore.getState().sealedBids.find((bid) => bid.isHuman)?.amount).toBe(0);
    expect(useAuctionStore.getState().isSealedBidModalOpen).toBe(true);
  });

  it('QD-24 arms the speed hammer and forces a two-second timer on the next human bid', () => {
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    useAuctionStore.getState().startBidding();
    const speedHammer = {
      id: 'card-speed-test',
      type: 'SPEED_HAMMER' as const,
      name: '스피드 해머',
      description: '',
      icon: '⚡',
      isUsed: false,
    };
    useAuctionStore.setState((state) => ({
      players: state.players.map((player) => player.isHuman
        ? { ...player, chanceCards: [speedHammer] }
        : player),
    }));

    expect(useAuctionStore.getState().useChanceCard(speedHammer.id)).toBe(true);
    expect(useAuctionStore.getState().timeLeft).toBe(2);
    const user = getHuman();
    expect(useAuctionStore.getState().placeBid(user.id, useAuctionStore.getState().currentHighestBid + 500)).toBe(true);
    expect(useAuctionStore.getState().timeLeft).toBe(2);
    expect(useAuctionStore.getState().timerDeadline).toBeGreaterThan(Date.now());
  });

  it('QD-25 corrects the English timer from the deadline after a background throttle', () => {
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    useAuctionStore.getState().startBidding();
    useAuctionStore.setState({
      timeLeft: 10,
      timerDeadline: Date.now() - 3_000,
    });
    useAuctionStore.getState().tickTimer();
    expect(useAuctionStore.getState().timeLeft).toBe(0);
    expect(useAuctionStore.getState().fsmState).toBe('ROUND_PASSED');
  });

  it('QD-26 ignores duplicate nextRound calls outside the reveal state', () => {
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    expect(useAuctionStore.getState().fsmState).toBe('ROUND_INTRO');
    useAuctionStore.getState().nextRound();
    expect(useAuctionStore.getState().currentRound).toBe(1);
    expect(useAuctionStore.getState().fsmState).toBe('ROUND_INTRO');
  });

  it('QD-27 blocks entry when another tab stored an active session', () => {
    const activeProfile = {
      ...useCareerStore.getState().profile,
      careerCash: 20_000,
      careerNetWorth: 20_000,
      activeSession: {
        sessionId: 'session-other-tab',
        tier: 'SILVER' as const,
        entryFee: 1_000,
        sessionCashStart: 19_000,
        ticketConsumed: 0 as const,
        status: 'ACTIVE' as const,
      },
    };
    localStorageMock.setItem(STORAGE_KEY_V2, JSON.stringify(activeProfile));
    useCareerStore.setState((state) => ({
      profile: { ...state.profile, careerCash: 20_000, careerNetWorth: 20_000, activeSession: undefined },
    }));

    expect(useCareerStore.getState().enterRoom('SILVER')).toBe(false);
    expect(useCareerStore.getState().persistenceError).toContain('다른 탭');
  });

  it('QD-20 and QD-33/QD-34 normalize the profile and use the event payload', () => {
    const auctionSource = fs.readFileSync(
      path.resolve(__dirname, '../src/components/auction/AuctionGameView.tsx'),
      'utf-8'
    );
    expect(auctionSource).toContain('activeMarketEvent.multiplier');
    expect(auctionSource).toContain('activeMarketEvent.cashAmount');

    const raw = {
      storageVersion: '2.0.0',
      careerCash: 5_000,
      careerNetWorth: 5_000,
      vaultItemIds: ['item_br_01'],
      vaultItemStates: { item_br_01: { condition: 'PRISTINE', isJackpot: true } },
      unlockedAchievementIds: ['ach-first-win'],
      highestRoomTierUnlocked: 'GOLD',
      totalGamesPlayed: 0,
      totalWins: 0,
    };
    localStorageMock.setItem(STORAGE_KEY_V2, JSON.stringify(raw));
    const loaded = loadProfileFromStorage();
    expect(loaded.vaultItemStates?.item_br_01.isJackpot).toBe(true);
    expect(loaded.unlockedAchievementIds).toEqual(['ach-first-win']);
    expect(loaded.marketRates).toBeDefined();
  });
});
