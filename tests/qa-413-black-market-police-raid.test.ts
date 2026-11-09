import { describe, it, expect, beforeEach } from 'vitest';
import { useCareerStore } from '../src/stores/useCareerStore';
import { useAuctionStore } from '../src/stores/useAuctionStore';
import { MASTER_ITEMS } from '../src/data/masterItems';

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

describe('QA-413: 자정의 비밀 암시장 (BLACK_MARKET) & 경찰 급습 (Police Raid)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useCareerStore.getState().resetCareer();
  });

  it('암시장 전용 밀수품 6종이 모두 정상 등록되어 있고 isContraband 및 저주 디버프를 가져야 한다', () => {
    const contrabandItems = MASTER_ITEMS.filter((item) => item.tier === 'BLACK_MARKET');
    expect(contrabandItems.length).toBe(6);

    contrabandItems.forEach((item) => {
      expect(item.isContraband).toBe(true);
      expect(typeof item.curseCode).toBe('string');
      expect(typeof item.curseDebuff).toBe('string');
      expect(item.realValue).toBeGreaterThanOrEqual(250000);
    });
  });

  it('VIP 티켓을 1장 보유하고 있다면 순자산 $100,000 미만이어도 암시장에 입장할 수 있어야 한다', () => {
    const career = useCareerStore.getState();
    expect(career.profile.careerNetWorth).toBe(5000); // 10만 미만

    // 티켓 0장일 때 입장 불가
    const gatingBefore = career.getGatingStatus('BLACK_MARKET');
    expect(gatingBefore.isUnlocked).toBe(false);

    // VIP 티켓 1장 지급
    useCareerStore.getState().grantBlackVipTicket(1);
    expect(useCareerStore.getState().profile.blackVipTicketCount).toBe(1);

    // 현금 $20,000 부여 (입장료 $10,000 지불 가능)
    useCareerStore.setState({
      profile: {
        ...useCareerStore.getState().profile,
        careerCash: 20000,
      }
    });

    const gatingAfter = useCareerStore.getState().getGatingStatus('BLACK_MARKET');
    expect(gatingAfter.isUnlocked).toBe(true);
    expect(gatingAfter.isPlayable).toBe(true);

    // 입장 실행 -> 티켓 1장 소모되고 현금 $10,000 차감
    const success = useCareerStore.getState().enterRoom('BLACK_MARKET');
    expect(success).toBe(true);
    expect(useCareerStore.getState().profile.blackVipTicketCount).toBe(0);
    expect(useCareerStore.getState().profile.careerCash).toBe(10000);
  });

  it('경찰 급습 시 [즉시 탈출]을 선택하면 안전하게 로비로 복귀해야 한다', () => {
    useCareerStore.setState((state) => ({
      profile: { ...state.profile, careerCash: 200000, careerNetWorth: 200000 },
    }));
    useAuctionStore.getState().startNewGame('BLACK_MARKET', 'ENGLISH');
    useAuctionStore.getState().triggerPoliceRaid();

    const raidState = useAuctionStore.getState().policeRaidState;
    expect(raidState.isActive).toBe(true);
    expect(useAuctionStore.getState().isPoliceRaidModalOpen).toBe(true);

    useAuctionStore.getState().escapePoliceRaid();

    expect(useAuctionStore.getState().isPoliceRaidModalOpen).toBe(false);
    expect(useAuctionStore.getState().currentView).toBe('LOBBY');
    expect(useCareerStore.getState().profile.lastSettlementReceipt?.outcome).toBe('ESCAPED');
  });

  it('경찰 급습 시 [뇌물 $5,000 + 시작가]를 지불하면 봇을 쫓아내고 밀수품을 단독 낙찰받아야 한다', () => {
    useCareerStore.setState((state) => ({
      profile: { ...state.profile, careerCash: 200000, careerNetWorth: 200000 },
    }));
    useAuctionStore.getState().startNewGame('BLACK_MARKET', 'ENGLISH');
    const contrabandItem = useAuctionStore.getState().currentItem!;

    useAuctionStore.getState().triggerPoliceRaid();
    const totalCost = useAuctionStore.getState().policeRaidState.totalCost;

    // 무작위 출품 시작가와 무관하게 승인 계약의 경계값을 직접 검증한다.
    useAuctionStore.setState({
      players: useAuctionStore.getState().players.map((p) => (p.isHuman ? { ...p, cash: totalCost - 1 } : p)),
    });
    expect(useAuctionStore.getState().bribePoliceRaid()).toBe(false);
    expect(useAuctionStore.getState().isPoliceRaidModalOpen).toBe(true);

    useAuctionStore.setState({
      players: useAuctionStore.getState().players.map((p) => (p.isHuman ? { ...p, cash: totalCost } : p)),
    });
    const success = useAuctionStore.getState().bribePoliceRaid();

    expect(success).toBe(true);
    expect(useAuctionStore.getState().isPoliceRaidModalOpen).toBe(false);
    expect(useAuctionStore.getState().highestBidder?.isHuman).toBe(true);
    
    // 유저 인벤토리에 밀수품 획득
    const user = useAuctionStore.getState().players.find((p) => p.isHuman);
    expect(user?.inventory.some((i) => i.id === contrabandItem.id)).toBe(true);
    expect(user?.cash).toBe(0);
  });
});
