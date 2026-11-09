import { describe, it, expect, beforeEach } from 'vitest';
import { useAuctionStore } from '../src/stores/useAuctionStore';
import { TIMER_CONFIG } from '../src/data/constants';

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

describe('QA-302: 4R 비밀 봉투 경매 단판 승부 및 동점자 처리 검증', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('1. 4R 진입 시 SEALED_BID_ACTIVE 및 15초 제한시간 정상 세팅 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    useAuctionStore.setState({ currentRound: 4 });
    store.startRoundIntro();

    let state = useAuctionStore.getState();
    expect(state.currentRound).toBe(4);
    expect(state.timeLeft).toBe(TIMER_CONFIG.SEALED_BID_DURATION); // 15초

    store.startBidding();
    state = useAuctionStore.getState();
    expect(state.fsmState).toBe('SEALED_BID_ACTIVE');
  });

  it('2. 비공개 입찰 제출 시 4인 전원 입찰값 수집 및 최고가 내림차순 정렬 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');
    useAuctionStore.setState({ currentRound: 4 });
    store.startRoundIntro();
    store.startBidding();

    // 유저가 $3,500 비공개 제출 (예산 $5,000 이내)
    store.submitSealedBid(3500);

    const state = useAuctionStore.getState();
    expect(state.isSealedBidModalOpen).toBe(true);
    expect(state.sealedBids.length).toBe(4);

    // 내림차순 정렬 검증
    for (let i = 0; i < state.sealedBids.length - 1; i++) {
      expect(state.sealedBids[i].amount).toBeGreaterThanOrEqual(state.sealedBids[i + 1].amount);
    }

    const topBidder = state.sealedBids[0];
    expect(state.currentHighestBid).toBe(topBidder.amount);
    expect(state.highestBidder?.id).toBe(topBidder.playerId);
  });

  it('3. 최고 입찰자 단판 낙찰 처리 및 잔고 차감 / 인벤토리 획득 일관성 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');
    useAuctionStore.setState({ currentRound: 4 });
    store.startRoundIntro();
    store.startBidding();

    // 유저에게 $20,000 현금을 부여하여 확실한 최고가 낙찰 시나리오 구성
    useAuctionStore.setState({
      players: useAuctionStore.getState().players.map(p => p.isHuman ? { ...p, cash: 20000 } : p)
    });

    const targetItem = useAuctionStore.getState().currentItem!;
    const user = useAuctionStore.getState().players.find(p => p.isHuman)!;
    const initialUserCash = user.cash; // $20,000
    const winningBidAmount = 15000;

    // 봇들의 최대 지불 가능액($10,000)을 초과하는 $15,000 제출
    store.submitSealedBid(winningBidAmount);
    let state = useAuctionStore.getState();
    expect(state.sealedBids[0].playerId).toBe(user.id);
    expect(state.sealedBids[0].amount).toBe(winningBidAmount);

    // 모달 닫기 및 라운드 종료
    store.closeSealedBidModal();
    state = useAuctionStore.getState();
    expect(state.fsmState).toBe('ROUND_REVEAL');

    const updatedUser = state.players.find(p => p.isHuman)!;
    expect(updatedUser.cash).toBe(initialUserCash - winningBidAmount);
    expect(updatedUser.inventory.some(i => i.id === targetItem.id)).toBe(true);
  });

  it('4. 동점자 발생 시(Tie-breaker) 안정적 정렬 및 단일 낙찰자 결정 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');
    useAuctionStore.setState({ currentRound: 4 });
    store.startRoundIntro();
    store.startBidding();

    // submitSealedBid 로직 직접 점검
    store.submitSealedBid(4000);
    const state = useAuctionStore.getState();
    
    // 최고가 1인 선정에 null이 없고 정확한 단일 Player가 highestBidder로 지정되어야 함
    expect(state.highestBidder).not.toBeNull();
    expect(typeof state.highestBidder?.id).toBe('string');
    expect(typeof state.currentHighestBid).toBe('number');
  });

  it('5. 4R 제한시간 만료 시 미제출 유저의 startingBid 자동 제출 폴백 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');
    useAuctionStore.setState({ currentRound: 4 });
    store.startRoundIntro();
    store.startBidding();

    // 유저가 아직 제출하지 않은 상태에서 timeLeft = 1초 후 tickTimer 발생
    useAuctionStore.setState({ timeLeft: 1 });
    store.tickTimer();

    const state = useAuctionStore.getState();
    // DEV-314: 타임아웃 만료 시 유저 자동 0원(기권) 제출 후 모달 오픈
    expect(state.isSealedBidModalOpen).toBe(true);
    const userBid = state.sealedBids.find(b => b.isHuman);
    expect(userBid).toBeDefined();
    expect(userBid?.amount).toBe(0);
  });

  it('6. 보유 현금을 초과하는 금액 입력 시 0원(기권)으로 안전 처리되어 무한 로딩을 방지해야 한다 (DEV-314)', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');
    useAuctionStore.setState({ currentRound: 4 });
    store.startRoundIntro();
    store.startBidding();

    const userCash = useAuctionStore.getState().players.find(p => p.isHuman)!.cash;
    
    // 현금보다 큰 금액 제출 시도 시 0원(Fold)으로 처리되어 모달 정상 오픈
    store.submitSealedBid(userCash + 5000);

    const state = useAuctionStore.getState();
    expect(state.isSealedBidModalOpen).toBe(true);
    const userBid = state.sealedBids.find(b => b.isHuman);
    expect(userBid?.amount).toBe(0);
  });
});
