import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuctionStore } from '../src/stores/useAuctionStore';
import { MASTER_ITEMS } from '../src/data/masterItems';
import { useCareerStore } from '../src/stores/useCareerStore';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

describe('QA-412: 4R 비밀 봉투 경매 타임아웃 무한로딩 방지 (Zero-Freeze Guarantee)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useCareerStore.getState().resetCareer();
    useAuctionStore.getState().startNewGame('BRONZE', 'ENGLISH');
  });

  it('유저 잔고가 $0이고 미입력 상태에서 submitSealedBid(0) 호출 시 봇들의 입찰가가 정상 오픈되어야 한다', () => {
    const store = useAuctionStore.getState();
    const round4Item = store.auctionQueue[3]; // 4라운드 아이템

    useAuctionStore.setState({
      currentRound: 4,
      currentItem: round4Item,
      players: store.players.map((p) => (p.isHuman ? { ...p, cash: 0 } : p)),
    });
    useAuctionStore.getState().startBidding();

    // 0원 또는 잔고 부족 상태로 제출
    useAuctionStore.getState().submitSealedBid(0);

    const updatedState = useAuctionStore.getState();
    expect(updatedState.isSealedBidModalOpen).toBe(true);
    expect(updatedState.sealedBids.length).toBe(4); // 유저 1인 + 봇 3인
    
    // 유저는 0원으로 등록
    const userBid = updatedState.sealedBids.find((b) => b.isHuman);
    expect(userBid?.amount).toBe(0);

    // 봇들은 0원 초과의 정상 입찰액 제출
    const botBids = updatedState.sealedBids.filter((b) => !b.isHuman);
    botBids.forEach((botBid) => {
      expect(botBid.amount).toBeGreaterThan(0);
    });

    // 최고 입찰자는 봇이어야 함
    expect(updatedState.highestBidder?.isHuman).toBe(false);
  });

  it('타이머가 1초에서 0초로 만료될 때 무한 대기 없이 자동 0원 처리되고 결과 모달이 열려야 한다', () => {
    const store = useAuctionStore.getState();
    const round4Item = store.auctionQueue[3];

    useAuctionStore.setState({
      currentRound: 4,
      currentItem: round4Item,
      timeLeft: 1,
    });
    useAuctionStore.getState().startBidding();
    useAuctionStore.setState({ timeLeft: 1 });

    // 1초 틱 실행 -> 시간 만료
    useAuctionStore.getState().tickTimer();

    const finalState = useAuctionStore.getState();
    expect(finalState.isSealedBidModalOpen).toBe(true);
    expect(finalState.sealedBids.length).toBe(4);

    // 모달 닫기 시 즉시 라운드 결산(concludeRound)으로 전이
    useAuctionStore.getState().closeSealedBidModal();
    expect(useAuctionStore.getState().fsmState).toBe('ROUND_REVEAL');
  });
});
