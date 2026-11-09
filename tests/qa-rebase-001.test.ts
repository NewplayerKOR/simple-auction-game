import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { INITIAL_CAREER_PROFILE, useCareerStore } from '../src/stores/useCareerStore';
import { useAuctionStore } from '../src/stores/useAuctionStore';
import { MASTER_ITEMS } from '../src/data/masterItems';
import { ContrabandCurseCode } from '../src/types';
import {
  applyDumpLossCurse,
  applyEndGameCashCurse,
  getDutchBotLatencyMultiplier,
  getLoanRepaymentAmount,
  getPoliceRaidChance,
  getRestorationProbabilities,
} from '../src/services/contrabandService';

/**
 * QA-REBASE-001: 기존 테스트가 비어 있던 추적성 공백을 고정한다.
 * - TC-STAB-001: 음수 종료 잔액 정산
 * - TC-STAB-008: 6종 저주 개별 계약
 * - REQ-AUC-001: 잉글리시 입찰 경계값
 * - REQ-BM-001: 비정상 완주·비골드 완주 티켓 미지급
 * - REQ-BM-003: 뇌물 비용 부족 거부
 */
describe('QA-REBASE-001 추적성 보강', () => {
  beforeEach(() => {
    useAuctionStore.getState().tickEngine.stop();
    useCareerStore.getState().resetCareer();
  });

  afterEach(() => {
    useAuctionStore.getState().tickEngine.stop();
  });

  it('TC-STAB-001 REQ-CORE-002: 음수 종료 잔액도 파산으로 정산하고 현금을 임의 보정하지 않는다', () => {
    expect(useCareerStore.getState().enterRoom('BRONZE')).toBe(true);
    const session = useCareerStore.getState().profile.activeSession!;

    const result = useCareerStore.getState().commitGameResult({
      sessionId: session.sessionId,
      outcome: 'NORMAL',
      endingCash: -750,
      acquiredItems: [],
      isWinner: false,
      unlockedAchievementIds: [],
    });

    expect(result.status).toBe('APPLIED');
    expect(result.newNetWorth).toBe(-750);
    expect(result.isBankrupt).toBe(true);

    const profile = useCareerStore.getState().profile;
    expect(profile.careerCash).toBe(-750);
    expect(profile.careerNetWorth).toBe(-750);
    expect(profile.isBankrupt).toBe(true);
    expect(profile.highestRoomTierUnlocked).toBe('BRONZE');
  });

  const contrabandItems = MASTER_ITEMS.filter((item) => item.curseCode);

  const assertCurse = (code: ContrabandCurseCode): void => {
    const curses = new Set<ContrabandCurseCode>([code]);
    switch (code) {
      case 'END_GAME_CASH_FEE':
        expect(applyEndGameCashCurse(5_000, curses)).toBe(4_000);
        break;
      case 'DUTCH_BOT_LATENCY_20':
        expect(getDutchBotLatencyMultiplier(curses)).toBe(0.8);
        break;
      case 'POLICE_RAID_CHANCE_30':
        expect(getPoliceRaidChance(new Set())).toBe(0.15);
        expect(getPoliceRaidChance(curses)).toBe(0.30);
        break;
      case 'DUMP_LOSS_X1_5':
        expect(applyDumpLossCurse(0.4, curses)).toBeCloseTo(0.1);
        break;
      case 'LOAN_INTEREST_30':
        expect(getLoanRepaymentAmount(curses)).toBe(3_900);
        break;
      case 'RESTORE_FAIL_PLUS_10P':
        expect(getRestorationProbabilities(curses)).toEqual({
          success: 0.60,
          jackpot: 0.10,
          failed: 0.30,
        });
        break;
    }
  };

  for (const item of contrabandItems) {
    it(`TC-STAB-008 REQ-BM-002: ${item.curseCode} 저주가 ${item.id} 행동 계약에 적용된다`, () => {
      expect(item.curseCode).toBeDefined();
      assertCurse(item.curseCode!);
    });
  }

  it('TC-STAB-008 REQ-BM-002: 밀수품 6종의 저주 코드가 중복 없이 모두 존재한다', () => {
    expect(contrabandItems).toHaveLength(6);
    expect(new Set(contrabandItems.map((item) => item.curseCode)).size).toBe(6);
  });

  it('REQ-AUC-001: 현재 최고가 이하·보유 현금 초과 입찰을 거부하고 경계값 입찰만 허용한다', () => {
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
    useAuctionStore.getState().startBidding();

    const state = useAuctionStore.getState();
    const human = state.players.find((player) => player.isHuman)!;
    const bot = state.players.find((player) => !player.isHuman)!;
    useAuctionStore.setState({
      currentHighestBid: 500,
      highestBidder: bot,
      players: state.players.map((player) =>
        player.isHuman ? { ...player, cash: 1_000 } : player
      ),
    });

    expect(useAuctionStore.getState().placeBid(human.id, 500)).toBe(false);
    expect(useAuctionStore.getState().placeBid(human.id, 1_001)).toBe(false);
    expect(useAuctionStore.getState().placeBid(human.id, 1_000)).toBe(true);
    expect(useAuctionStore.getState().currentHighestBid).toBe(1_000);
  });

  it('REQ-BM-003: 뇌물 총비용보다 현금이 1 부족하면 뇌물 낙찰을 거부한다', () => {
    useAuctionStore.getState().startNewGame('BLACK_MARKET', 'ENGLISH');
    useAuctionStore.getState().triggerPoliceRaid();
    const totalCost = useAuctionStore.getState().policeRaidState.totalCost;
    const state = useAuctionStore.getState();
    const human = state.players.find((player) => player.isHuman)!;

    useAuctionStore.setState({
      players: state.players.map((player) =>
        player.isHuman ? { ...player, cash: totalCost - 1 } : player
      ),
    });

    expect(useAuctionStore.getState().bribePoliceRaid()).toBe(false);
    const after = useAuctionStore.getState().players.find((player) => player.id === human.id)!;
    expect(after.cash).toBe(totalCost - 1);
    expect(after.inventory).toHaveLength(0);
  });

  it('REQ-BM-001: 브론즈 승리·골드 탈출·체포·중도 종료에는 VIP 티켓을 지급하지 않는다', () => {
    const settle = (
      tier: 'BRONZE' | 'GOLD' | 'DIAMOND',
      outcome: 'NORMAL' | 'ESCAPED' | 'ARRESTED' | 'ABANDONED',
      isWinner: boolean
    ) => {
      useCareerStore.setState({
        profile: {
          ...INITIAL_CAREER_PROFILE,
          careerCash: 200_000,
          careerNetWorth: 200_000,
        },
      });
      expect(useCareerStore.getState().enterRoom(tier)).toBe(true);
      const session = useCareerStore.getState().profile.activeSession!;
      const result = useCareerStore.getState().commitGameResult({
        sessionId: session.sessionId,
        outcome,
        endingCash: 100_000,
        acquiredItems: [],
        isWinner,
        unlockedAchievementIds: [],
      });
      expect(result.status).toBe('APPLIED');
      return useCareerStore.getState().profile.blackVipTicketCount;
    };

    expect(settle('BRONZE', 'NORMAL', true)).toBe(0);
    expect(settle('GOLD', 'ESCAPED', false)).toBe(0);
    expect(settle('GOLD', 'ARRESTED', false)).toBe(0);
    expect(settle('GOLD', 'ABANDONED', false)).toBe(0);
    expect(settle('DIAMOND', 'NORMAL', false)).toBe(1);
  });

  it('REQ-BM-001: 순자산 조건을 충족하면 암시장 입장에 VIP 티켓을 사용하지 않는다', () => {
    useCareerStore.setState({
      profile: {
        ...INITIAL_CAREER_PROFILE,
        careerCash: 200_000,
        careerNetWorth: 200_000,
        blackVipTicketCount: 1,
      },
    });

    expect(useCareerStore.getState().enterRoom('BLACK_MARKET')).toBe(true);
    const profile = useCareerStore.getState().profile;
    expect(profile.blackVipTicketCount).toBe(1);
    expect(profile.activeSession?.ticketConsumed).toBe(0);
  });
});
