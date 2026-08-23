import { describe, it, expect, beforeEach } from 'vitest';
import { useAuctionStore } from '../src/stores/useAuctionStore';
import { LOAN_CONFIG } from '../src/data/constants';

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

describe('QA-304: 긴급 대출 실행 시 최종 스코어에서 $3,600 정확 차감 검증', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('1. 대출 실행 시 즉시 +$3,000 현금 지급 및 플레이어 대출 상태 세팅 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    const userInitialCash = useAuctionStore.getState().players.find(p => p.isHuman)!.cash; // $10,000
    const loanSuccess = store.takeEmergencyLoan();
    expect(loanSuccess).toBe(true);

    const state = useAuctionStore.getState();
    const updatedUser = state.players.find(p => p.isHuman)!;
    expect(updatedUser.cash).toBe(userInitialCash + LOAN_CONFIG.AMOUNT); // $13,000
    expect(updatedUser.hasTakenLoan).toBe(true);
    expect(updatedUser.loanRepaymentAmount).toBe(LOAN_CONFIG.TOTAL_REPAY); // $3,600
  });

  it('2. 게임당 1회 한정 대출 정책 검증 (중복 대출 시도시 차단)', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    expect(store.takeEmergencyLoan()).toBe(true);
    // 2회차 시도
    expect(store.takeEmergencyLoan()).toBe(false);
    // 3회차 시도
    expect(store.takeEmergencyLoan()).toBe(false);

    // 현금은 1회분($3,000)만 증가해야 함
    const user = useAuctionStore.getState().players.find(p => p.isHuman)!;
    expect(user.cash).toBe(5000 + LOAN_CONFIG.AMOUNT);
  });

  it('3. 5R 최종 정산 시 대출 상환액 $3,600 정확 차감 및 finalNetWorth 산출 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    // 대출 실행
    store.takeEmergencyLoan();
    const user = useAuctionStore.getState().players.find(p => p.isHuman)!;
    const currentCash = user.cash; // $13,000

    // 게임 종료
    store.finishGame();
    const state = useAuctionStore.getState();
    const userRank = state.settlementSummary?.playerRankings.find(r => r.player.isHuman)!;

    expect(userRank.loanDeduction).toBe(3600);
    // 순자산 = 현금(13,000) + 소장품(0) + 시너지(0) - 대출상환(3,600) = 9,400
    expect(userRank.finalNetWorth).toBe(currentCash - 3600);
  });

  it('4. 대출을 받지 않은 플레이어는 차감액이 0원인지 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    // 대출 받지 않고 게임 종료
    store.finishGame();
    const state = useAuctionStore.getState();
    const userRank = state.settlementSummary?.playerRankings.find(r => r.player.isHuman)!;

    expect(userRank.loanDeduction).toBe(0);
    expect(userRank.finalNetWorth).toBe(userRank.cash);
  });

  it('5. 대출을 받고 이자를 갚은 후 최종 1위 달성 시 "ach-leverage-king" 업적 언락 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    store.takeEmergencyLoan();

    // 봇들보다 높은 현금 보유 상태로 1위 보장
    useAuctionStore.setState({
      players: useAuctionStore.getState().players.map(p => 
        p.isHuman ? { ...p, cash: 20000 } : { ...p, cash: 1000, inventory: [] }
      )
    });

    store.finishGame();
    const state = useAuctionStore.getState();
    const userRank = state.settlementSummary?.playerRankings.find(r => r.player.isHuman)!;

    expect(userRank.rank).toBe(1);
    expect(state.settlementSummary?.newlyUnlockedAchievementIds).toContain('ach-leverage-king');
  });
});
