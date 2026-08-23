import { describe, it, expect, beforeEach } from 'vitest';
import { useAuctionStore } from '../src/stores/useAuctionStore';
import { MASTER_ITEMS } from '../src/data/masterItems';

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

describe('QA-303: 위작 낙찰 시 가치 $0 처리 및 안심 보험 환급 검증', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('1. 위작(Fake) 아이템 생성 시 realValue가 0으로 처리되는지 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');
    const queue = useAuctionStore.getState().auctionQueue;

    queue.forEach(item => {
      if (item.isFake) {
        expect(item.realValue).toBe(0);
      } else {
        expect(item.realValue).toBeGreaterThan(0);
      }
    });
  });

  it('2. 안심 보험 활성화 상태에서 위작 낙찰 시 손실액(낙찰가 - 0) 100% 전액 환급 검증 (원금 보전)', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    // 위작 아이템 세팅
    const fakeItem = { ...MASTER_ITEMS[0], isFake: true, realValue: 0, isAppraised: false };
    const user = useAuctionStore.getState().players.find(p => p.isHuman)!;
    const initialCash = user.cash; // $10,000

    useAuctionStore.setState({
      currentItem: fakeItem,
      isInsuranceActive: true, // 보험 활성화
    });

    store.startBidding();
    const bidAmount = 4000;
    store.placeBid(user.id, bidAmount);
    store.concludeRound();

    const state = useAuctionStore.getState();
    expect(state.fsmState).toBe('ROUND_REVEAL');
    expect(state.insuranceRefundAmount).toBe(bidAmount); // $4,000 전액 환급

    const updatedUser = state.players.find(p => p.isHuman)!;
    // 유저 잔고: 10000 - 4000(낙찰가) + 4000(환급액) = 10000 (원금 100% 보전)
    expect(updatedUser.cash).toBe(initialCash);
    expect(updatedUser.inventory.length).toBe(1);
    expect(updatedUser.inventory[0].realValue).toBe(0);
  });

  it('3. 안심 보험 활성화 상태에서 고가 진품 낙찰 시(낙찰가 > 실제가치) 차액 손실분 환급 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    // 실제 가치 $4,200인 진품 아이템
    const authenticItem = { ...MASTER_ITEMS[2], isFake: false, realValue: 4200, isAppraised: true };
    
    useAuctionStore.setState({
      currentItem: authenticItem,
      isInsuranceActive: true,
      players: useAuctionStore.getState().players.map(p => p.isHuman ? { ...p, cash: 10000 } : p)
    });

    const user = useAuctionStore.getState().players.find(p => p.isHuman)!;
    const initialCash = user.cash; // $10,000

    store.startBidding();
    const bidAmount = 6000; // 가치 $4,200보다 높은 $6,000에 고가 낙찰
    store.placeBid(user.id, bidAmount);
    store.concludeRound();

    const state = useAuctionStore.getState();
    expect(state.fsmState).toBe('ROUND_REVEAL');
    const expectedRefund = bidAmount - authenticItem.realValue; // 6000 - 4200 = 1800
    expect(state.insuranceRefundAmount).toBe(expectedRefund);

    const updatedUser = state.players.find(p => p.isHuman)!;
    // 유저 잔고: 10000 - 6000 + 1800 = 5800
    expect(updatedUser.cash).toBe(initialCash - bidAmount + expectedRefund);
  });

  it('4. 안심 보험 미활성화 상태에서 위작 낙찰 시 환급 0원 및 현금 전액 차감 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    const fakeItem = { ...MASTER_ITEMS[0], isFake: true, realValue: 0, isAppraised: false };
    const user = useAuctionStore.getState().players.find(p => p.isHuman)!;
    const initialCash = user.cash; // $10,000

    useAuctionStore.setState({
      currentItem: fakeItem,
      isInsuranceActive: false, // 보험 미적용
    });

    store.startBidding();
    const bidAmount = 3500;
    store.placeBid(user.id, bidAmount);
    store.concludeRound();

    const state = useAuctionStore.getState();
    expect(state.fsmState).toBe('ROUND_REVEAL');
    expect(state.insuranceRefundAmount).toBeNull(); // 환급 없음

    const updatedUser = state.players.find(p => p.isHuman)!;
    expect(updatedUser.cash).toBe(initialCash - bidAmount); // $6,500
    expect(updatedUser.inventory[0].realValue).toBe(0);
  });

  it('5. 5R 최종 정산 시 위작 아이템의 순자산 기여도가 $0으로 정확히 계산되는지 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    const fakeItem1 = { ...MASTER_ITEMS[0], isFake: true, realValue: 0 };
    const fakeItem2 = { ...MASTER_ITEMS[1], isFake: true, realValue: 0 };

    useAuctionStore.setState({
      players: useAuctionStore.getState().players.map(p => 
        p.isHuman ? { ...p, inventory: [fakeItem1, fakeItem2], cash: 4000 } : { ...p, inventory: [], cash: 2000 }
      )
    });

    store.finishGame();
    const state = useAuctionStore.getState();
    const userRanking = state.settlementSummary?.playerRankings.find(r => r.player.isHuman)!;

    // 위작 2점 소장품 가치는 $0
    expect(userRanking.inventoryTotalValue).toBe(0);
    expect(userRanking.synergyBonusValue).toBe(0);
    expect(userRanking.finalNetWorth).toBe(4000); // 오직 보유 현금만 반영
  });

  it('6. 위작 없이 진품만 낙찰받아 승리했을 때 "ach-forgery-hunter" 업적 정상 해금 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    const genuineItem = { ...MASTER_ITEMS[0], isFake: false, realValue: 5500 };

    useAuctionStore.setState({
      players: useAuctionStore.getState().players.map(p => 
        p.isHuman ? { ...p, inventory: [genuineItem], cash: 8000 } : { ...p, inventory: [], cash: 2000 }
      )
    });

    store.finishGame();
    const state = useAuctionStore.getState();
    expect(state.settlementSummary?.newlyUnlockedAchievementIds).toContain('ach-forgery-hunter');
  });
});
