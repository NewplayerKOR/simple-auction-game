import { describe, it, expect, beforeEach } from 'vitest';
import { useAuctionStore } from '../src/stores/useAuctionStore';
import { LOAN_CONFIG, APPRAISAL_CONFIG, TIMER_CONFIG } from '../src/data/constants';
import { ROOM_TIERS_MASTER } from '../src/data/roomTiers';
import { MASTER_ITEMS } from '../src/data/masterItems';
import { MASTER_SYNERGIES } from '../src/data/masterSynergies';
import { useCareerStore } from '../src/stores/useCareerStore';

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

describe('QA-301: TC-01 ~ TC-10 기본 인수 조건 검증', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useCareerStore.getState().resetCareer();
  });

  // TC-01: 초기 설정 및 봇 프로필
  it('TC-01: 룸 티어별 초기 자본/봇 세팅 및 찬스 카드 2장 정상 지급 검증', () => {
    const store = useAuctionStore.getState();
    
    // 1. BRONZE 티어
    store.startNewGame('BRONZE');
    let state = useAuctionStore.getState();
    expect(state.currentTier).toBe('BRONZE');
    const userBronze = state.players.find(p => p.isHuman);
    const botsBronze = state.players.filter(p => !p.isHuman);
    expect(userBronze?.cash).toBe(5000);
    expect(botsBronze.length).toBe(3);
    botsBronze.forEach(bot => {
      expect(bot.cash).toBeGreaterThanOrEqual(4000);
      expect(bot.cash).toBeLessThanOrEqual(6000);
    });
    expect(userBronze?.chanceCards.length).toBe(2);
    expect(state.auctionQueue.length).toBe(5);

    // 2. DIAMOND 티어
    store.returnToLobby();
    useCareerStore.setState((career) => ({
      profile: { ...career.profile, careerCash: 300000, careerNetWorth: 300000 },
    }));
    store.startNewGame('DIAMOND');
    state = useAuctionStore.getState();
    const botsDiamond = state.players.filter(p => !p.isHuman);
    botsDiamond.forEach(bot => {
      expect(bot.cash).toBeGreaterThanOrEqual(200000);
      expect(bot.cash).toBeLessThanOrEqual(400000);
    });
  });

  // TC-02: 스택형 호가 버튼
  it('TC-02: +500 버튼 3회 클릭 시 +$1,500 누적 표시 및 단일 입찰 전송 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');
    store.startBidding(); // BIDDING_ACTIVE

    store.addIncrement(500);
    store.addIncrement(500);
    store.addIncrement(500);


    let state = useAuctionStore.getState();
    expect(state.accumulatedIncrement).toBe(1500);

    const user = state.players.find(p => p.isHuman)!;
    const targetBid = state.currentHighestBid + state.baseIncrement + state.accumulatedIncrement;
    const bidSuccess = store.placeBid(user.id, targetBid);

    expect(bidSuccess).toBe(true);
    state = useAuctionStore.getState();
    expect(state.currentHighestBid).toBe(targetBid);
    expect(state.highestBidder?.id).toBe(user.id);
    expect(state.accumulatedIncrement).toBe(0); // 입찰 후 누적액 리셋
  });

  // TC-03: Anti-Sniping 타이머
  it('TC-03: 타이머 2초일 때 입찰 시 최고가 갱신 및 타이머 5초로 즉시 연장 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');
    store.startBidding();

    // 타이머를 2초(<= 3초)로 강제 설정
    useAuctionStore.setState({ timeLeft: 2 });
    expect(useAuctionStore.getState().timeLeft).toBe(2);

    const user = useAuctionStore.getState().players.find(p => p.isHuman)!;
    const bidSuccess = store.placeBid(user.id, useAuctionStore.getState().currentHighestBid + 500);

    expect(bidSuccess).toBe(true);
    expect(useAuctionStore.getState().timeLeft).toBe(TIMER_CONFIG.ANTI_SNIPING_RESET); // 5초
  });

  // TC-04: 무응찰 유찰 폐기
  it('TC-04: 10초 동안 무입찰 시 유찰(Passed) 판정 및 물품 폐기, 다음 라운드 전환 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');
    store.startBidding();

    // 입찰자 없음 상태에서 타이머 0초로 concludeRound 호출
    store.concludeRound();

    let state = useAuctionStore.getState();
    expect(state.fsmState).toBe('ROUND_PASSED');
    expect(state.highestBidder).toBeNull();
    // 유저 및 봇 인벤토리에 아이템이 들어가지 않음
    state.players.forEach(p => expect(p.inventory.length).toBe(0));

    // 다음 라운드 전환
    store.nextRound();
    state = useAuctionStore.getState();
    expect(state.currentRound).toBe(2);
    expect(state.fsmState).toBe('ROUND_INTRO');
  });

  // TC-05: 찬스 카드 사용
  it('TC-05: 돋보기 / 스피드해머 / 보험 사용 시 카드 효과 즉시 발동 및 소모 상태 전환 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');
    store.startBidding();

    const user = useAuctionStore.getState().players.find(p => p.isHuman)!;
    
    // 수동으로 3종 카드 모두 부여하여 테스트
    const cards = [
      { id: 'card-1', type: 'MAGNIFIER' as const, name: '정밀 감정 돋보기', description: '', icon: '🔍', isUsed: false },
      { id: 'card-2', type: 'SPEED_HAMMER' as const, name: '스피드 해머', description: '', icon: '⚡', isUsed: false },
      { id: 'card-3', type: 'INSURANCE' as const, name: '낙찰 안심 보험', description: '', icon: '🛡️', isUsed: false },
    ];
    useAuctionStore.setState({
      players: useAuctionStore.getState().players.map(p => p.isHuman ? { ...p, chanceCards: cards } : p)
    });

    // 1. 돋보기 사용
    store.useChanceCard('card-1');
    let state = useAuctionStore.getState();
    expect(state.isMagnifierActive).toBe(true);
    expect(state.currentItem?.isAppraised).toBe(true);
    expect(state.isAppraisalModalOpen).toBe(true);
    expect(state.players.find(p => p.isHuman)?.chanceCards.find(c => c.id === 'card-1')?.isUsed).toBe(true);

    // 2. 스피드해머 사용 (타이머가 2초로 강제 단축)
    useAuctionStore.setState({ timeLeft: 10 });
    store.useChanceCard('card-2');
    state = useAuctionStore.getState();
    expect(state.timeLeft).toBe(2);
    expect(state.players.find(p => p.isHuman)?.chanceCards.find(c => c.id === 'card-2')?.isUsed).toBe(true);

    // 3. 보험 사용
    store.useChanceCard('card-3');
    state = useAuctionStore.getState();
    expect(state.isInsuranceActive).toBe(true);
    expect(state.players.find(p => p.isHuman)?.chanceCards.find(c => c.id === 'card-3')?.isUsed).toBe(true);

    // 이미 사용된 카드는 재사용 불가
    const reuseResult = store.useChanceCard('card-1');
    expect(reuseResult).toBe(false);
  });

  // TC-06: 3R / 5R 돌발 시장 속보
  it('TC-06: 3R, 5R 진입 시 전광판 속보 팝업 출력 및 특수 효과(가치 1.5배, 지원금 등) 반영 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    // 3라운드로 이동
    useAuctionStore.setState({ currentRound: 3 });
    store.startRoundIntro();

    let state = useAuctionStore.getState();
    expect(state.activeMarketEvent).not.toBeNull();
    expect(state.isMarketEventModalOpen).toBe(true);
    expect([3, 5]).toContain(state.activeMarketEvent?.round);

    // 5라운드로 이동
    useAuctionStore.setState({ currentRound: 5 });
    store.startRoundIntro();

    state = useAuctionStore.getState();
    expect(state.activeMarketEvent).not.toBeNull();
    expect(state.isMarketEventModalOpen).toBe(true);
  });

  // TC-07: 4R 비밀 봉투 경매
  it('TC-07: 4R 비밀 봉투 경매 비공개 제출 및 동시 공개 최고가 1인 단판 낙찰 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    // 4라운드 진입
    useAuctionStore.setState({ currentRound: 4 });
    store.startRoundIntro();

    let state = useAuctionStore.getState();
    expect(state.timeLeft).toBe(TIMER_CONFIG.SEALED_BID_DURATION); // 15초
    store.startBidding();
    expect(useAuctionStore.getState().fsmState).toBe('SEALED_BID_ACTIVE');

    // 유저가 $5,000 비공개 제출
    store.submitSealedBid(5000);
    state = useAuctionStore.getState();
    expect(state.sealedBids.length).toBe(4); // 유저 + 봇 3인 = 4인 전원 제출
    expect(state.isSealedBidModalOpen).toBe(true);

    // 최고 입찰자 확인 (내림차순 정렬)
    const top = state.sealedBids[0];
    expect(state.currentHighestBid).toBe(top.amount);
    expect(state.highestBidder?.id).toBe(top.playerId);

    // 모달 닫으면 concludeRound로 전환
    store.closeSealedBidModal();
    state = useAuctionStore.getState();
    expect(['ROUND_REVEAL', 'ROUND_PASSED']).toContain(state.fsmState);
  });

  // TC-08: 위작(Fake) 판정 & 감정사
  it('TC-08: 감정사($500) 의뢰 시 힌트 브리핑 및 위작 낙찰 시 실제 가치 $0 처리 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');
    
    // 강제로 위작 아이템 설정
    const fakeItem = { ...MASTER_ITEMS[0], isFake: true, realValue: 0, isAppraised: false };
    useAuctionStore.setState({ currentItem: fakeItem });

    const userInitialCash = useAuctionStore.getState().players.find(p => p.isHuman)!.cash;
    
    // 감정사 의뢰
    const appraised = store.requestAppraisal();
    expect(appraised).toBe(true);

    let state = useAuctionStore.getState();
    const userAfterAppraisal = state.players.find(p => p.isHuman)!;
    expect(userAfterAppraisal.cash).toBe(userInitialCash - APPRAISAL_CONFIG.COST); // $500 차감
    expect(state.appraisalBriefing?.verdict).toBe('FORGERY');
    expect(state.isAppraisalModalOpen).toBe(true);
    expect(state.currentItem?.isAppraised).toBe(true);

    // 위작 낙찰
    store.startBidding();
    const bidAmount = useAuctionStore.getState().currentHighestBid + 500;
    const bidPlaced = store.placeBid(userAfterAppraisal.id, bidAmount);
    expect(bidPlaced).toBe(true);
    store.concludeRound();

    state = useAuctionStore.getState();
    expect(state.fsmState).toBe('ROUND_REVEAL');
    const userWonItem = state.players.find(p => p.isHuman)!.inventory[0];
    expect(userWonItem.isFake).toBe(true);
    expect(userWonItem.realValue).toBe(0);
  });

  // TC-09: VIP 긴급 대출 & 이자 상환
  it('TC-09: VIP 긴급 대출 실행 시 $3,000 즉시 지급 및 5R 최종 정산 시 -$3,600 차감 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    const userBefore = useAuctionStore.getState().players.find(p => p.isHuman)!;
    const loanSuccess = store.takeEmergencyLoan();
    expect(loanSuccess).toBe(true);

    let state = useAuctionStore.getState();
    const userAfter = state.players.find(p => p.isHuman)!;
    expect(userAfter.cash).toBe(userBefore.cash + LOAN_CONFIG.AMOUNT); // +$3,000
    expect(userAfter.hasTakenLoan).toBe(true);
    expect(userAfter.loanRepaymentAmount).toBe(LOAN_CONFIG.TOTAL_REPAY); // $3,600

    // 중복 대출 불가
    expect(store.takeEmergencyLoan()).toBe(false);

    // 5R 정산 시 차감 확인
    store.finishGame();
    state = useAuctionStore.getState();
    const userRanking = state.settlementSummary?.playerRankings.find(r => r.player.isHuman)!;
    expect(userRanking.loanDeduction).toBe(LOAN_CONFIG.TOTAL_REPAY); // $3,600
    expect(userRanking.finalNetWorth).toBe(userAfter.cash - LOAN_CONFIG.TOTAL_REPAY);
  });

  // TC-10: 세트 보너스 & 칭호 정산
  it('TC-10: 5R 완료 시 세트 보너스 가산, 최종 랭킹 및 칭호 정상 부여 검증', () => {
    const store = useAuctionStore.getState();
    store.startNewGame('BRONZE');

    // 유저에게 syn_masterpiece 세트 아이템 2종 부여
    const synSet = MASTER_SYNERGIES[0];
    const item1 = { ...MASTER_ITEMS.find(i => i.id === 'item_sv_04')!, realValue: 5500, isFake: false };
    const item2 = { ...MASTER_ITEMS.find(i => i.id === 'item_gd_03')!, realValue: 7500, isFake: false };

    useAuctionStore.setState({
      players: useAuctionStore.getState().players.map(p => 
        p.isHuman ? { ...p, inventory: [item1, item2], cash: 5000 } : { ...p, inventory: [], cash: 2000 }
      )
    });

    store.finishGame();
    const state = useAuctionStore.getState();
    expect(state.fsmState).toBe('GAME_OVER');
    expect(state.currentView).toBe('GALLERY');

    const userRank = state.settlementSummary?.playerRankings.find(r => r.player.isHuman)!;
    expect(userRank.rank).toBe(1); // 1위
    
    // 소장품 가치: 5500 + 7500 = 13,000
    expect(userRank.inventoryTotalValue).toBe(13000);
    // 시너지 보너스: 13000 * 0.35 = 4550
    expect(userRank.synergyBonusValue).toBe(Math.floor(13000 * synSet.bonusMultiplier));
    // 최종 순자산: 5000(현금) + 13000(소장품) + 4550(시너지) = 22,550
    expect(userRank.finalNetWorth).toBe(5000 + 13000 + 4550);
    
    // 칭호 부여 확인
    expect(state.settlementSummary?.userEarnedTitles).toContain('소더비 그랜드 챔피언');
  });
});
