import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadProfileFromStorage, STORAGE_KEY_V2, useCareerStore } from '../src/stores/useCareerStore';
import { useAuctionStore } from '../src/stores/useAuctionStore';
import { MASTER_ITEMS } from '../src/data/masterItems';
import { AiBotService } from '../src/services/aiBotService';
import {
  applyDumpLossCurse,
  getDutchBotLatencyMultiplier,
  getLoanRepaymentAmount,
  getPoliceRaidChance,
  getRestorationProbabilities,
} from '../src/services/contrabandService';
import { APP_VERSION } from '../src/version';
import { Player } from '../src/types';

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

describe('STAB-001 v2.3.1 stabilization contract', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    useAuctionStore.getState().tickEngine.stop();
    localStorageMock.clear();
    useCareerStore.getState().resetCareer();
    useAuctionStore.setState({ currentView: 'LOBBY', fsmState: 'IDLE' });
  });

  it('WP-01 replaces career cash with ending session cash and settles idempotently', () => {
    setCareerFunds(20_000);
    expect(useCareerStore.getState().enterRoom('SILVER')).toBe(true);
    const session = useCareerStore.getState().profile.activeSession!;
    expect(session.sessionCashStart).toBe(19_000);

    const command = {
      sessionId: session.sessionId,
      outcome: 'NORMAL' as const,
      endingCash: 19_000,
      acquiredItems: [],
      isWinner: false,
      unlockedAchievementIds: [],
    };
    expect(useCareerStore.getState().commitGameResult(command).status).toBe('APPLIED');
    expect(useCareerStore.getState().profile.careerCash).toBe(19_000);
    expect(useCareerStore.getState().profile.totalGamesPlayed).toBe(1);

    expect(useCareerStore.getState().commitGameResult(command).status).toBe('ALREADY_APPLIED');
    expect(useCareerStore.getState().profile.careerCash).toBe(19_000);
    expect(useCareerStore.getState().profile.totalGamesPlayed).toBe(1);
  });

  it('WP-01 closes an unrecoverable refreshed session as ABANDONED without refunding entry cost', () => {
    const activeProfile = {
      ...useCareerStore.getState().profile,
      careerCash: 19_000,
      careerNetWorth: 19_000,
      activeSession: {
        sessionId: 'session-refresh',
        tier: 'SILVER' as const,
        entryFee: 1_000,
        sessionCashStart: 19_000,
        ticketConsumed: 0 as const,
        status: 'ACTIVE' as const,
      },
    };
    localStorageMock.setItem(STORAGE_KEY_V2, JSON.stringify(activeProfile));
    const recovered = loadProfileFromStorage();
    expect(recovered.activeSession).toBeUndefined();
    expect(recovered.careerCash).toBe(19_000);
    expect(recovered.totalGamesPlayed).toBe(0);
    expect(recovered.lastSettlementReceipt?.outcome).toBe('ABANDONED');
  });

  it('WP-02 freezes sealed submissions and settles a reveal only once', () => {
    vi.spyOn(AiBotService, 'calculateSealedBid').mockReturnValue(100);
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    const initial = useAuctionStore.getState();
    useAuctionStore.setState({
      currentRound: 4,
      currentItem: initial.auctionQueue[3],
      players: initial.players.map((player) => player.isHuman ? { ...player, cash: 500 } : player),
    });
    useAuctionStore.getState().startBidding();
    useAuctionStore.getState().submitSealedBid(200);

    const frozen = JSON.stringify(useAuctionStore.getState().sealedBids);
    expect(useAuctionStore.getState().fsmState).toBe('SEALED_BID_REVEALED');
    useAuctionStore.getState().tickTimer();
    useAuctionStore.getState().submitSealedBid(400);
    expect(JSON.stringify(useAuctionStore.getState().sealedBids)).toBe(frozen);

    useAuctionStore.getState().closeSealedBidModal();
    const once = useAuctionStore.getState().players.find((player) => player.isHuman)!;
    expect(once.cash).toBe(300);
    expect(once.inventory).toHaveLength(1);
    useAuctionStore.getState().closeSealedBidModal();
    const twice = useAuctionStore.getState().players.find((player) => player.isHuman)!;
    expect(twice.cash).toBe(300);
    expect(twice.inventory).toHaveLength(1);
    expect(useAuctionStore.getState().sealedBidResolution?.phase).toBe('SETTLED');
  });

  it('WP-02 treats all zero sealed bids as an unsold round', () => {
    vi.spyOn(AiBotService, 'calculateSealedBid').mockReturnValue(0);
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    const initial = useAuctionStore.getState();
    useAuctionStore.setState({ currentRound: 4, currentItem: initial.auctionQueue[3] });
    useAuctionStore.getState().startBidding();
    useAuctionStore.getState().submitSealedBid(Number.NaN);
    expect(useAuctionStore.getState().highestBidder).toBeNull();
    useAuctionStore.getState().closeSealedBidModal();
    expect(useAuctionStore.getState().fsmState).toBe('ROUND_PASSED');
  });

  it('WP-03 persists an arrest once while preserving the pre-session vault', () => {
    const permanentItem = MASTER_ITEMS.find((item) => item.id === 'item_gd_01')!;
    setCareerFunds(200_000, 200_000 + permanentItem.realValue);
    useCareerStore.setState((state) => ({
      profile: { ...state.profile, vaultItemIds: [permanentItem.id] },
    }));
    useAuctionStore.getState().startNewGame('BLACK_MARKET', 'ENGLISH');
    useAuctionStore.getState().triggerPoliceRaid();
    useAuctionStore.getState().handleArrested();
    useAuctionStore.getState().handleArrested();

    const profile = useCareerStore.getState().profile;
    expect(profile.careerCash).toBe(0);
    expect(profile.careerNetWorth).toBe(permanentItem.realValue);
    expect(profile.vaultItemIds).toEqual([permanentItem.id]);
    expect(profile.totalGamesPlayed).toBe(1);
    expect(profile.lastSettlementReceipt?.outcome).toBe('ARRESTED');
  });

  it('WP-03 charges bribe fee plus starting price exactly once', () => {
    setCareerFunds(200_000);
    useAuctionStore.getState().startNewGame('BLACK_MARKET', 'ENGLISH');
    useAuctionStore.getState().triggerPoliceRaid();
    const totalCost = useAuctionStore.getState().policeRaidState.totalCost;
    useAuctionStore.setState((state) => ({
      players: state.players.map((player) => player.isHuman ? { ...player, cash: totalCost } : player),
    }));

    expect(useAuctionStore.getState().bribePoliceRaid()).toBe(true);
    expect(useAuctionStore.getState().bribePoliceRaid()).toBe(false);
    const user = useAuctionStore.getState().players.find((player) => player.isHuman)!;
    expect(user.cash).toBe(0);
    expect(user.inventory).toHaveLength(1);
  });

  it('WP-04 maps all six curses and applies their distinct behavior contracts', () => {
    const contraband = MASTER_ITEMS.filter((item) => item.isContraband);
    expect(contraband).toHaveLength(6);
    expect(new Set(contraband.map((item) => item.curseCode)).size).toBe(6);

    expect(getDutchBotLatencyMultiplier(new Set(['DUTCH_BOT_LATENCY_20']))).toBe(0.8);
    expect(getPoliceRaidChance(new Set(['POLICE_RAID_CHANCE_30']))).toBe(0.30);
    expect(applyDumpLossCurse(0.4, new Set(['DUMP_LOSS_X1_5']))).toBeCloseTo(0.1);
    expect(getLoanRepaymentAmount(new Set(['LOAN_INTEREST_30']))).toBe(3900);
    expect(getRestorationProbabilities(new Set(['RESTORE_FAIL_PLUS_10P']))).toEqual({
      success: 0.60,
      jackpot: 0.10,
      failed: 0.30,
    });

    const cursedDagger = MASTER_ITEMS.find((item) => item.id === 'item_bm_01')!;
    setCareerFunds(5_000, 5_000 + cursedDagger.realValue);
    useCareerStore.setState((state) => ({ profile: { ...state.profile, vaultItemIds: [cursedDagger.id] } }));
    expect(useCareerStore.getState().enterRoom('BRONZE')).toBe(true);
    const session = useCareerStore.getState().profile.activeSession!;
    useCareerStore.getState().commitGameResult({
      sessionId: session.sessionId,
      outcome: 'NORMAL',
      endingCash: 5_000,
      acquiredItems: [],
      isWinner: false,
      unlockedAchievementIds: [],
    });
    expect(useCareerStore.getState().profile.careerCash).toBe(4_000);
  });

  it('WP-04 uses cursed loan and restoration behavior in the live stores', () => {
    const loanCurse = MASTER_ITEMS.find((item) => item.id === 'item_bm_05')!;
    const restoreCurse = MASTER_ITEMS.find((item) => item.id === 'item_bm_06')!;
    setCareerFunds(100_000, 100_000 + loanCurse.realValue + restoreCurse.realValue);
    useCareerStore.setState((state) => ({
      profile: {
        ...state.profile,
        vaultItemIds: [loanCurse.id, restoreCurse.id],
        vaultItemStates: { [restoreCurse.id]: { condition: 'DAMAGED' } },
      },
    }));
    vi.spyOn(Math, 'random').mockReturnValue(0.75);
    expect(useCareerStore.getState().attemptRestoration(restoreCurse.id).outcome).toBe('FAILED_RUINED');
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    expect(useAuctionStore.getState().takeEmergencyLoan()).toBe(true);
    expect(useAuctionStore.getState().players.find((player) => player.isHuman)?.loanRepaymentAmount).toBe(3900);
  });

  it('WP-05 grants independent Gold completion and first blind-master tickets', () => {
    setCareerFunds(100_000);
    expect(useCareerStore.getState().enterRoom('GOLD')).toBe(true);
    const session = useCareerStore.getState().profile.activeSession!;
    const command = {
      sessionId: session.sessionId,
      outcome: 'NORMAL' as const,
      endingCash: 95_000,
      acquiredItems: [],
      isWinner: false,
      unlockedAchievementIds: ['ach-blind-master'],
    };
    useCareerStore.getState().commitGameResult(command);
    expect(useCareerStore.getState().profile.blackVipTicketCount).toBe(2);
    useCareerStore.getState().commitGameResult(command);
    expect(useCareerStore.getState().profile.blackVipTicketCount).toBe(2);
  });

  it('WP-06 validates buyers before locking and gives the floor a 500ms final window', () => {
    vi.useFakeTimers();
    vi.spyOn(AiBotService, 'evaluateDutchBots').mockImplementation(() => undefined);
    useAuctionStore.getState().startNewGame('BRONZE', 'DUTCH');
    useAuctionStore.getState().startDutchRound();
    const startPrice = useAuctionStore.getState().dutchState.currentPrice;
    expect(useAuctionStore.getState().claimDutchAuction('missing-buyer')).toBe(false);
    useAuctionStore.setState((state) => ({
      players: state.players.map((player) => player.isHuman ? { ...player, cash: 0 } : player),
    }));
    const underfundedId = useAuctionStore.getState().players.find((player) => player.isHuman)!.id;
    expect(useAuctionStore.getState().claimDutchAuction(underfundedId)).toBe(false);
    expect(useAuctionStore.getState().tickEngine.getIsLocked()).toBe(false);
    vi.advanceTimersByTime(600);
    expect(useAuctionStore.getState().dutchState.currentPrice).toBeLessThan(startPrice);

    useAuctionStore.getState().tickEngine.stop();
    useAuctionStore.setState((state) => ({
      fsmState: 'DUTCH_DROPPING',
      dutchState: { ...state.dutchState, currentPrice: state.dutchState.floorPrice, claimStatus: 'OPEN', isClaimed: false },
      players: state.players.map((player) => player.isHuman ? { ...player, cash: state.dutchState.floorPrice } : player),
    }));
    useAuctionStore.getState().passDutchAuction();
    expect(useAuctionStore.getState().dutchState.claimStatus).toBe('FLOOR_HOLD');
    vi.advanceTimersByTime(499);
    const userId = useAuctionStore.getState().players.find((player) => player.isHuman)!.id;
    expect(useAuctionStore.getState().claimDutchAuction(userId)).toBe(true);

    useAuctionStore.getState().tickEngine.stop();
    useCareerStore.getState().resetCareer();
    useAuctionStore.setState({ currentView: 'LOBBY', fsmState: 'IDLE' });
    useAuctionStore.getState().startNewGame('BRONZE', 'DUTCH');
    useAuctionStore.getState().startDutchRound();
    useAuctionStore.getState().tickEngine.stop();
    useAuctionStore.setState((state) => ({
      fsmState: 'DUTCH_DROPPING',
      dutchState: { ...state.dutchState, currentPrice: state.dutchState.floorPrice, claimStatus: 'OPEN', isClaimed: false },
    }));
    useAuctionStore.getState().passDutchAuction();
    vi.advanceTimersByTime(500);
    const secondUserId = useAuctionStore.getState().players.find((player) => player.isHuman)!.id;
    expect(useAuctionStore.getState().dutchState.claimStatus).toBe('PASSED');
    expect(useAuctionStore.getState().claimDutchAuction(secondUserId)).toBe(false);
  });

  it('WP-06 allows only one simultaneous Dutch claimant and one deduction', () => {
    vi.useFakeTimers();
    vi.spyOn(AiBotService, 'evaluateDutchBots').mockImplementation(() => undefined);
    useAuctionStore.getState().startNewGame('BRONZE', 'DUTCH');
    useAuctionStore.getState().startDutchRound();
    const state = useAuctionStore.getState();
    const price = state.dutchState.currentPrice;
    const human = state.players.find((player) => player.isHuman)!;
    const bot = state.players.find((player) => !player.isHuman)!;
    useAuctionStore.setState({
      players: state.players.map((player) => ({ ...player, cash: price + 1_000 })),
    });

    expect(useAuctionStore.getState().claimDutchAuction(human.id)).toBe(true);
    expect(useAuctionStore.getState().claimDutchAuction(bot.id)).toBe(false);
    vi.advanceTimersByTime(1_500);
    const settledHuman = useAuctionStore.getState().players.find((player) => player.isHuman)!;
    expect(settledHuman.cash).toBe(1_000);
    expect(settledHuman.inventory).toHaveLength(1);
  });

  it('WP-06 ignores hidden real value and forgery flags for Dutch AI decisions', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const baseItem = MASTER_ITEMS[0];
    const bot: Player = {
      id: 'bot-test',
      name: 'bot',
      isHuman: false,
      avatar: '',
      cash: 10_000,
      inventory: [],
      chanceCards: [],
      hasTakenLoan: false,
      loanRepaymentAmount: 0,
      persona: 'WARREN',
    };
    const first = vi.fn();
    const second = vi.fn();
    AiBotService.evaluateDutchBots(100, { ...baseItem, realValue: 1, isFake: true }, [bot], 'BRONZE', first);
    AiBotService.evaluateDutchBots(100, { ...baseItem, realValue: 9_999_999, isFake: false }, [bot], 'BRONZE', second);
    vi.runAllTimers();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('WP-08 exposes version 2.3.1 and a unique 30-item, five-room catalog', () => {
    expect(APP_VERSION).toBe('2.3.1');
    expect(MASTER_ITEMS).toHaveLength(30);
    expect(new Set(MASTER_ITEMS.map((item) => item.id)).size).toBe(30);
    for (const tier of ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND', 'BLACK_MARKET'] as const) {
      expect(MASTER_ITEMS.filter((item) => item.tier === tier)).toHaveLength(6);
    }
  });
});
