import { assetUrl } from '../services/assetService';
import { create } from 'zustand';
import {
  AuctionFSMState,
  AuctionMode,
  DutchAuctionState,
  FinalSettlementSummary,
  Item,
  MarketEvent,
  Player,
  PoliceRaidState,
  RoomTier,
  SealedBidResolution,
  SealedBidSubmission,
} from '../types';
import { createTierItemQueue } from '../data/masterItems';
import { MASTER_EVENTS } from '../data/masterEvents';
import { generateRandomChanceCards } from '../data/chanceCards';
import { BLACK_MARKET_CONFIG, LOAN_CONFIG, TIMER_CONFIG } from '../data/constants';
import { AudioService } from '../services/audioService';
import { AiBotService } from '../services/aiBotService';
import { DutchTickEngine } from '../services/dutchTickEngine';
import { useCareerStore } from './useCareerStore';
import {
  getDutchBotLatencyMultiplier,
  getLoanRepaymentAmount,
  getOwnedCurseCodes,
  getPoliceRaidChance,
} from '../services/contrabandService';
import {
  calculateSynergyBonus,
  getAdjustedItemValue,
  getAppraisalCost,
  getSessionItemValue,
} from '../services/itemValueService';

interface AppraisalBriefing {
  itemName: string;
  isFake: boolean;
  confidenceText: string;
  verdict: 'AUTHENTIC' | 'FORGERY';
}

interface AuctionStoreState {
  // 뷰 전환
  currentView: 'LOBBY' | 'AUCTION' | 'GALLERY';
  setView: (view: 'LOBBY' | 'AUCTION' | 'GALLERY') => void;

  // 게임 세팅 및 FSM 진행 상태
  currentTier: RoomTier;
  auctionMode: AuctionMode;
  fsmState: AuctionFSMState;
  currentRound: number; // 1 ~ 5
  totalRounds: number;

  // 라운드 데이터
  auctionQueue: Item[]; // 이번 게임에 출품되는 해당 티어 전용 5개 아이템
  currentItem: Item | null;
  players: Player[];

  // 잉글리시 입찰 및 타이머
  currentHighestBid: number;
  highestBidder: Player | null;
  timeLeft: number;
  timerDeadline: number | null; // QD-25: 백그라운드 탭에서도 실제 경과 시간으로 보정
  accumulatedIncrement: number; // 스택형 호가 추가 누적액
  baseIncrement: number;

  // 더치 역경매 상태
  dutchState: DutchAuctionState;
  tickEngine: DutchTickEngine;

  // 특수 시스템 상태 & 모달
  sealedBids: SealedBidSubmission[];
  sealedBidResolution: SealedBidResolution | null;
  isSealedBidModalOpen: boolean;
  earnedAchievementIds: string[];
  activeMarketEvent: MarketEvent | null;
  isMarketEventModalOpen: boolean;
  appraisalBriefing: AppraisalBriefing | null;
  isAppraisalModalOpen: boolean;
  isMagnifierActive: boolean;
  isInsuranceActive: boolean;
  isSpeedHammerActive: boolean;
  insuranceRefundAmount: number | null;

  // 경찰 급습 (Police Raid) 상태 & 모달
  policeRaidState: PoliceRaidState;
  isPoliceRaidModalOpen: boolean;

  // 최종 결과
  settlementSummary: FinalSettlementSummary | null;

  // 액션
  startNewGame: (tier?: RoomTier, mode?: AuctionMode) => void;
  addIncrement: (amount: number) => void;
  resetIncrement: () => void;
  placeBid: (playerId: string, amount: number) => boolean;
  requestAppraisal: () => boolean;
  closeAppraisalModal: () => void;
  closeMarketEventModal: () => void;
  takeEmergencyLoan: () => boolean;
  useChanceCard: (cardId: string) => boolean;
  submitSealedBid: (amount: number) => void;
  closeSealedBidModal: () => void;

  // 경찰 급습 액션
  triggerPoliceRaid: () => void;
  escapePoliceRaid: () => void;
  bribePoliceRaid: () => boolean;
  handleArrested: () => void;
  tickPoliceRaidTimer: () => void;

  // 더치 액션
  startDutchRound: () => void;
  claimDutchAuction: (buyerId: string) => boolean;
  passDutchAuction: () => void;

  // FSM 라운드 제어
  startRoundIntro: () => void;
  startBidding: () => void;
  tickTimer: () => void;
  triggerBotBidsTick: () => void;
  concludeRound: () => void;
  nextRound: () => void;
  finishGame: () => void;
  returnToLobby: () => void;
}

const defaultDutchState: DutchAuctionState = {
  sessionId: '',
  roundId: '',
  roundResolutionId: null,
  claimStatus: 'OPEN',
  currentPrice: 0,
  startPrice: 0,
  floorPrice: 0,
  dropAmountPerTick: 0,
  isClaimed: false,
  claimedByPlayerId: null,
  claimedPrice: null,
};

const createRuntimeId = (prefix: string): string => {
  const randomId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
};

const createPoliceRaidState = (item: Item | null = null): PoliceRaidState => {
  const itemPrice = item?.startingBid || 0;
  return {
    raidId: null,
    isActive: false,
    timeLeft: BLACK_MARKET_CONFIG.ESCAPE_TIME,
    bribeFee: BLACK_MARKET_CONFIG.BRIBE_COST,
    itemPrice,
    totalCost: BLACK_MARKET_CONFIG.BRIBE_COST + itemPrice,
    status: 'IDLE',
  };
};

export const useAuctionStore = create<AuctionStoreState>((set, get) => {
  const tickEngine = new DutchTickEngine();

  return {
    currentView: 'LOBBY',
    setView: (view) => set({ currentView: view }),

    currentTier: 'BRONZE',
    auctionMode: 'ENGLISH',
    fsmState: 'IDLE',
    currentRound: 1,
    totalRounds: 5,

    auctionQueue: [],
    currentItem: null,
    players: [],

    currentHighestBid: 0,
    highestBidder: null,
    timeLeft: TIMER_CONFIG.ENGLISH_AUCTION_DURATION,
    timerDeadline: null,
    accumulatedIncrement: 0,
    baseIncrement: 500,

    dutchState: { ...defaultDutchState },
    tickEngine,

    sealedBids: [],
    sealedBidResolution: null,
    isSealedBidModalOpen: false,
    earnedAchievementIds: [],
    activeMarketEvent: null,
    isMarketEventModalOpen: false,
    appraisalBriefing: null,
    isAppraisalModalOpen: false,
    isMagnifierActive: false,
    isInsuranceActive: false,
    isSpeedHammerActive: false,
    insuranceRefundAmount: null,
    settlementSummary: null,

    policeRaidState: createPoliceRaidState(),
    isPoliceRaidModalOpen: false,

    /**
     * 신규 게임 세션 초기화 및 시작
     */
    startNewGame: (selectedTier, selectedMode) => {
      const tier = selectedTier || get().currentTier;
      const mode = selectedMode || get().auctionMode;

      let careerProfile = useCareerStore.getState().profile;
      if (!careerProfile.activeSession) {
        if (!useCareerStore.getState().enterRoom(tier)) return;
        careerProfile = useCareerStore.getState().profile;
      }
      if (!careerProfile.activeSession || careerProfile.activeSession.tier !== tier) return;

      // 1. 해당 룸 티어 전용 5종 유물 비복원 추출 (중복 출품 0%)
      const preparedItems = createTierItemQueue(tier);

      // 2. 유저 커리어 프로필 가용 자금 연동
      const humanPlayer: Player = {
        id: 'player_user',
        name: '나 (컬렉터)',
        isHuman: true,
        avatar: assetUrl('/assets/images/avatars/avatar_user.webp'),
        cash: careerProfile.activeSession.sessionCashStart,
        inventory: [],
        chanceCards: generateRandomChanceCards(),
        hasTakenLoan: false,
        loanRepaymentAmount: 0,
      };

      // 3. 룸 티어에 맞는 봇 3인 동적 스폰
      const botPlayers = AiBotService.spawnTierBots(tier);
      const allPlayers = [humanPlayer, ...botPlayers];
      const firstItem = preparedItems[0] || null;

      AudioService.playBGM('AUCTION');

      set({
        currentTier: tier,
        auctionMode: mode,
        currentView: 'AUCTION',
        fsmState: 'ROUND_INTRO',
        currentRound: 1,
        auctionQueue: preparedItems,
        currentItem: firstItem,
        players: allPlayers,
        currentHighestBid: firstItem ? firstItem.startingBid : 0,
        highestBidder: null,
        timeLeft: TIMER_CONFIG.ENGLISH_AUCTION_DURATION,
        timerDeadline: null,
        accumulatedIncrement: 0,
        baseIncrement: Math.max(100, Math.round((firstItem?.startingBid || 1000) * 0.1)),
        dutchState: firstItem
          ? {
              sessionId: careerProfile.activeSession.sessionId,
              roundId: 'round-1',
              roundResolutionId: null,
              claimStatus: 'OPEN',
              currentPrice: firstItem.dutchStartPrice,
              startPrice: firstItem.dutchStartPrice,
              floorPrice: firstItem.dutchFloorPrice,
              dropAmountPerTick: Math.round(firstItem.dutchDropRatePerSec * 0.5),
              isClaimed: false,
              claimedByPlayerId: null,
              claimedPrice: null,
            }
          : { ...defaultDutchState },
        sealedBids: [],
        sealedBidResolution: null,
        isSealedBidModalOpen: false,
        earnedAchievementIds: [],
        activeMarketEvent: null,
        isMarketEventModalOpen: false,
        appraisalBriefing: null,
        isAppraisalModalOpen: false,
        isMagnifierActive: false,
        isInsuranceActive: false,
        isSpeedHammerActive: false,
        insuranceRefundAmount: null,
        policeRaidState: createPoliceRaidState(firstItem),
        isPoliceRaidModalOpen: false,
        settlementSummary: null,
      });
    },

    /**
     * 스택형 호가 누적
     */
    addIncrement: (amount) => {
      AudioService.playChipClick();
      set((state) => ({
        accumulatedIncrement: state.accumulatedIncrement + amount,
      }));
    },

    /**
     * 스택형 호가 초기화
     */
    resetIncrement: () => {
      AudioService.playChipClick();
      set({ accumulatedIncrement: 0 });
    },

    /**
     * 잉글리시 호가 경매 입찰 실행
     */
    placeBid: (playerId, amount) => {
      const { players, currentHighestBid, fsmState, timeLeft, policeRaidState, isSpeedHammerActive } = get();
      if (fsmState !== 'BIDDING_ACTIVE') return false;
      if (policeRaidState.status === 'RAIDED') return false;
      // QD-15: NaN·Infinity·음수·소수 호가를 거부한다.
      if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= currentHighestBid) return false;

      const bidder = players.find((p) => p.id === playerId);
      if (!bidder || bidder.cash < amount) return false;

      // Anti-sniping: 3초 미만일 때 입찰하면 5초로 연장
      let newTimeLeft = timeLeft;
      if (timeLeft <= TIMER_CONFIG.ANTI_SNIPING_TRIGGER_TIME) {
        newTimeLeft = TIMER_CONFIG.ANTI_SNIPING_RESET;
      }
      // QD-24: 스피드 해머는 본인 입찰 시점에 타이머를 2초로 강제 단축한다.
      if (bidder.isHuman && isSpeedHammerActive) {
        newTimeLeft = Math.min(newTimeLeft, TIMER_CONFIG.SPEED_HAMMER_DURATION);
      }
      const newDeadline = Date.now() + newTimeLeft * 1000;

      AudioService.playBidBell();

      const updatedPlayers = players.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            lastBidAmount: amount,
            lastDialogue: p.isHuman
              ? undefined
              : (p.dialogues?.bidPlaced?.[Math.floor(Math.random() * (p.dialogues.bidPlaced?.length || 1))] || '한 번 더 올린다!'),
          };
        }
        return p;
      });

      set({
        players: updatedPlayers,
        currentHighestBid: amount,
        highestBidder: bidder,
        timeLeft: newTimeLeft,
        timerDeadline: newDeadline,
        accumulatedIncrement: 0,
      });

      return true;
    },

    /**
     * 감정사 의뢰 ($500 지불 후 진품/위작 정밀 브리핑)
     */
    requestAppraisal: () => {
      const state = get();
      const { currentItem, players } = state;
      const user = players.find((p) => p.isHuman);
      const appraisalCost = getAppraisalCost(currentItem);
      // QD-03: 최고 입찰자라면 낙찰 예약액을 제외한 가용 현금으로만 지출을 허용한다.
      const committedBid = state.fsmState === 'BIDDING_ACTIVE' && state.highestBidder?.id === user?.id
        ? state.currentHighestBid
        : 0;
      const canSpendInState = state.fsmState === 'ROUND_INTRO'
        || state.fsmState === 'BIDDING_ACTIVE'
        || state.fsmState === 'SEALED_BID_ACTIVE'
        || state.fsmState === 'DUTCH_DROPPING';
      if (!user || !currentItem || !canSpendInState || user.cash - committedBid < appraisalCost || currentItem.isAppraised) {
        return false;
      }

      AudioService.playCardUse();

      const updatedPlayers = players.map((p) =>
        p.isHuman ? { ...p, cash: p.cash - appraisalCost } : p
      );

      const updatedItem: Item = {
        ...currentItem,
        isAppraised: true,
      };

      const briefing: AppraisalBriefing = {
        itemName: currentItem.name,
        isFake: !!currentItem.isFake,
        confidenceText: currentItem.isFake
          ? '⚠️ 감정원 정밀 분석 결과, 캔버스의 안료와 서명이 위조된 [정교한 위작]입니다!'
          : '✅ 감정원 정밀 분석 결과, 당대 기법 및 출처가 완벽히 일치하는 [100% 진품]입니다.',
        verdict: currentItem.isFake ? 'FORGERY' : 'AUTHENTIC',
      };

      set({
        players: updatedPlayers,
        currentItem: updatedItem,
        appraisalBriefing: briefing,
        isAppraisalModalOpen: true,
      });

      return true;
    },

    closeAppraisalModal: () => set({ isAppraisalModalOpen: false }),
    closeMarketEventModal: () => set({ isMarketEventModalOpen: false }),

    /**
     * VIP 긴급 대출 ($3,000 즉시 지급, 최종 정산 -$3,600)
     */
    takeEmergencyLoan: () => {
      const { players } = get();
      const user = players.find((p) => p.isHuman);
      if (!user || user.hasTakenLoan) return false;
      const careerProfile = useCareerStore.getState().profile;
      const repaymentAmount = getLoanRepaymentAmount(getOwnedCurseCodes(careerProfile.vaultItemIds, user.inventory));

      AudioService.playJackpot();

      const updatedPlayers = players.map((p) =>
        p.isHuman
          ? {
              ...p,
              cash: p.cash + LOAN_CONFIG.AMOUNT,
              hasTakenLoan: true,
              loanRepaymentAmount: repaymentAmount,
            }
          : p
      );

      set({ players: updatedPlayers });
      return true;
    },

    /**
     * 찬스 카드 사용 (돋보기, 스피드해머, 안심보험)
     */
    useChanceCard: (cardId) => {
      const { players, currentItem, fsmState } = get();
      const user = players.find((p) => p.isHuman);
      if (!user) return false;

      const card = user.chanceCards.find((c) => c.id === cardId && !c.isUsed);
      if (!card) return false;
      const canUseCardInState = fsmState === 'ROUND_INTRO'
        || fsmState === 'BIDDING_ACTIVE'
        || fsmState === 'SEALED_BID_ACTIVE'
        || fsmState === 'DUTCH_DROPPING';
      if (!canUseCardInState) return false;
      // 스피드 해머는 실제 입찰이 가능한 잉글리시 진행 중에만 사용한다.
      if (card.type === 'SPEED_HAMMER' && fsmState !== 'BIDDING_ACTIVE') return false;

      AudioService.playCardUse();

      const updatedCards = user.chanceCards.map((c) =>
        c.id === cardId ? { ...c, isUsed: true } : c
      );

      const updatedPlayers = players.map((p) =>
        p.isHuman ? { ...p, chanceCards: updatedCards } : p
      );

      if (card.type === 'MAGNIFIER') {
        if (currentItem) {
          const estMin = currentItem.isFake ? currentItem.estimatedMin : Math.floor(currentItem.realValue * 0.9);
          const estMax = currentItem.isFake ? Math.floor(currentItem.estimatedMin * 1.1) : Math.ceil(currentItem.realValue * 1.1);
          const updatedItem: Item = {
            ...currentItem,
            isAppraised: true,
            estimatedMin: estMin,
            estimatedMax: estMax,
          };
          set({
            players: updatedPlayers,
            isMagnifierActive: true,
            currentItem: updatedItem,
            appraisalBriefing: {
              itemName: currentItem.name,
              isFake: !!currentItem.isFake,
              confidenceText: currentItem.isFake
                ? '돋보기 판별: ⚠️ 붉은빛 음영이 드러납니다! 확실한 위작입니다!'
                : '돋보기 판별: ✨ 황금빛 아우라가 확인되었습니다! 진품 확정!',
              verdict: currentItem.isFake ? 'FORGERY' : 'AUTHENTIC',
            },
            isAppraisalModalOpen: true,
          });
        }
      } else if (card.type === 'SPEED_HAMMER') {
        const nextTimeLeft = Math.min(get().timeLeft, TIMER_CONFIG.SPEED_HAMMER_DURATION);
        set({
          players: updatedPlayers,
          isSpeedHammerActive: true,
          timeLeft: nextTimeLeft,
          timerDeadline: Date.now() + nextTimeLeft * 1000,
        });
      } else if (card.type === 'INSURANCE') {
        set({
          players: updatedPlayers,
          isInsuranceActive: true,
        });
      }

      return true;
    },

    /**
     * 4R 비밀 봉투 비공개 입찰 제출 (Zero-Freeze Guarantee)
     */
    submitSealedBid: (amount) => {
      const { players, currentItem, currentTier, fsmState, sealedBidResolution, policeRaidState } = get();
      if (fsmState !== 'SEALED_BID_ACTIVE' || sealedBidResolution?.phase !== 'ACTIVE') return;
      if (policeRaidState.status === 'RAIDED') return;
      const user = players.find((p) => p.isHuman);
      if (!user || !currentItem) return;

      const validAmount = Number.isFinite(amount) && user.cash >= amount && amount > 0 ? Math.floor(amount) : 0;
      AudioService.playChipClick();

      set({
        fsmState: 'SEALED_BID_FINALIZING',
        timeLeft: 0,
        sealedBidResolution: { ...sealedBidResolution, phase: 'FINALIZING' },
      });

      const userSubmission: SealedBidSubmission = {
        playerId: user.id,
        playerName: user.name,
        amount: validAmount,
        isHuman: true,
        avatar: user.avatar,
      };

      const botSubmissions: SealedBidSubmission[] = players
        .filter((p) => !p.isHuman)
        .map((bot) => ({
          playerId: bot.id,
          playerName: bot.name,
          amount: AiBotService.calculateSealedBid(bot, currentItem, currentTier),
          isHuman: false,
          avatar: bot.avatar,
        }));

      const participantOrder = sealedBidResolution.participantOrder;
      const participantIndex = new Map(participantOrder.map((id, index) => [id, index]));
      const allSubmissions = [userSubmission, ...botSubmissions].sort((a, b) =>
        b.amount - a.amount || (participantIndex.get(a.playerId) || 0) - (participantIndex.get(b.playerId) || 0)
      );
      const topBidder = allSubmissions[0];
      const winningPlayer = topBidder && topBidder.amount > 0 ? players.find((p) => p.id === topBidder.playerId) || null : null;

      const secondBid = allSubmissions[1]?.amount ?? 0;
      const earnedAchievementIds = [...get().earnedAchievementIds];
      if (winningPlayer?.isHuman && topBidder.amount - secondBid <= 100 && !earnedAchievementIds.includes('ach-blind-master')) {
        earnedAchievementIds.push('ach-blind-master');
      }

      set({
        sealedBids: allSubmissions,
        currentHighestBid: topBidder ? topBidder.amount : 0,
        highestBidder: winningPlayer,
        isSealedBidModalOpen: true,
        fsmState: 'SEALED_BID_REVEALED',
        earnedAchievementIds,
        sealedBidResolution: {
          ...sealedBidResolution,
          phase: 'REVEALED',
          submissions: allSubmissions,
        },
      });
    },

    closeSealedBidModal: () => {
      const resolution = get().sealedBidResolution;
      if (!resolution || resolution.phase !== 'REVEALED') return;
      set({
        isSealedBidModalOpen: false,
        fsmState: 'ROUND_SETTLING',
        sealedBidResolution: { ...resolution, phase: 'SETTLING' },
      });
      get().concludeRound();
    },

    /**
     * 경찰 급습 액션 (DEV-316)
     */
    triggerPoliceRaid: () => {
      const { policeRaidState, currentItem, tickEngine } = get();
      if (policeRaidState.status === 'RAIDED' || !currentItem) return;
      tickEngine.stop();
      AudioService.playNewsAlert();
      const itemPrice = currentItem.startingBid;
      set({
        policeRaidState: {
          raidId: createRuntimeId('raid'),
          isActive: true,
          timeLeft: BLACK_MARKET_CONFIG.ESCAPE_TIME,
          bribeFee: BLACK_MARKET_CONFIG.BRIBE_COST,
          itemPrice,
          totalCost: BLACK_MARKET_CONFIG.BRIBE_COST + itemPrice,
          status: 'RAIDED',
        },
        isPoliceRaidModalOpen: true,
      });
    },

    escapePoliceRaid: () => {
      const { policeRaidState, players, tickEngine } = get();
      if (policeRaidState.status !== 'RAIDED' || !policeRaidState.raidId) return;
      const user = players.find((player) => player.isHuman);
      const session = useCareerStore.getState().profile.activeSession;
      if (!user || !session) return;

      tickEngine.stop();
      set({ policeRaidState: { ...policeRaidState, isActive: false, status: 'RESOLVING' } });
      // DEC-009: 탈출도 NORMAL과 같은 긴급 대출 상환 순서를 적용한다.
      const loanRepayment = user.hasTakenLoan ? user.loanRepaymentAmount : 0;
      const result = useCareerStore.getState().commitGameResult({
        sessionId: session.sessionId,
        outcome: 'ESCAPED',
        endingCash: user.cash - loanRepayment,
        acquiredItems: user.inventory,
        isWinner: false,
        unlockedAchievementIds: [],
      });
      if (result.status === 'APPLIED' || result.status === 'ALREADY_APPLIED') {
        set({
          policeRaidState: { ...policeRaidState, isActive: false, status: 'ESCAPED' },
          isPoliceRaidModalOpen: false,
          currentView: 'LOBBY',
          fsmState: 'IDLE',
          timerDeadline: null,
          isSpeedHammerActive: false,
        });
      } else {
        set({ policeRaidState });
      }
    },

    bribePoliceRaid: () => {
      const { players, currentItem, policeRaidState } = get();
      const user = players.find((p) => p.isHuman);
      if (!user || !currentItem || policeRaidState.status !== 'RAIDED' || user.cash < policeRaidState.totalCost) return false;

      AudioService.playChipClick();

      set({
        highestBidder: user,
        currentHighestBid: policeRaidState.totalCost,
        policeRaidState: { ...policeRaidState, isActive: false, status: 'BRIBED_AND_WON' },
        isPoliceRaidModalOpen: false,
      });

      // 즉시 낙찰 및 Reveal 단계로 전이 (concludeRound에서 뇌물액 차감 및 인벤토리 지급)
      get().concludeRound();
      return true;
    },

    handleArrested: () => {
      const { policeRaidState, tickEngine } = get();
      if (policeRaidState.status !== 'RAIDED' || !policeRaidState.raidId) return;
      const session = useCareerStore.getState().profile.activeSession;
      if (!session) return;
      tickEngine.stop();
      AudioService.playLoss();
      set({ policeRaidState: { ...policeRaidState, isActive: false, status: 'RESOLVING' } });
      const result = useCareerStore.getState().commitGameResult({
        sessionId: session.sessionId,
        outcome: 'ARRESTED',
        endingCash: 0,
        acquiredItems: [],
        isWinner: false,
        unlockedAchievementIds: [],
      });
      if (result.status === 'APPLIED' || result.status === 'ALREADY_APPLIED') {
        set({
          players: get().players.map((p) => (p.isHuman ? { ...p, cash: 0, inventory: [] } : p)),
          policeRaidState: { ...policeRaidState, isActive: false, status: 'ARRESTED' },
          isPoliceRaidModalOpen: false,
          currentView: 'LOBBY',
          fsmState: 'IDLE',
          timerDeadline: null,
          isSpeedHammerActive: false,
        });
      } else {
        set({ policeRaidState });
      }
    },

    tickPoliceRaidTimer: () => {
      const { policeRaidState } = get();
      if (!policeRaidState.isActive || policeRaidState.status !== 'RAIDED') return;

      if (policeRaidState.timeLeft > 1) {
        AudioService.playTick(true);
        set({
          policeRaidState: {
            ...policeRaidState,
            timeLeft: policeRaidState.timeLeft - 1,
          },
        });
      } else {
        get().handleArrested();
      }
    },

    /**
     * 더치 역경매 틱 루프 시작
     */
    startDutchRound: () => {
      const { currentItem, tickEngine, currentTier, currentRound, policeRaidState } = get();
      const careerProfile = useCareerStore.getState().profile;
      const sessionId = careerProfile.activeSession?.sessionId;
      if (!currentItem || !sessionId || policeRaidState.status === 'RAIDED') return;
      const roundId = `round-${currentRound}`;
      const roundResolutionId = createRuntimeId(`dutch-${roundId}`);
      const userInventory = get().players.find((player) => player.isHuman)?.inventory || [];
      const latencyMultiplier = getDutchBotLatencyMultiplier(getOwnedCurseCodes(careerProfile.vaultItemIds, userInventory));

      set({
        fsmState: 'DUTCH_DROPPING',
        dutchState: {
          sessionId,
          roundId,
          roundResolutionId,
          claimStatus: 'OPEN',
          currentPrice: currentItem.dutchStartPrice,
          startPrice: currentItem.dutchStartPrice,
          floorPrice: currentItem.dutchFloorPrice,
          dropAmountPerTick: Math.round(currentItem.dutchDropRatePerSec * 0.5),
          isClaimed: false,
          claimedByPlayerId: null,
          claimedPrice: null,
        },
      });

      tickEngine.start(
        currentItem.dutchStartPrice,
        currentItem.dutchFloorPrice,
        currentItem.dutchDropRatePerSec,
        (price) => {
          set((state) => ({
            dutchState: { ...state.dutchState, currentPrice: price },
          }));

          // 봇 WTP 평가 및 선착순 청구 트리거
          const { players, currentItem: item, dutchState } = get();
          if (item && dutchState.claimStatus === 'OPEN' && dutchState.sessionId === sessionId && dutchState.roundId === roundId) {
            const bots = players.filter((p) => !p.isHuman);
            AiBotService.evaluateDutchBots(
              price,
              item,
              bots,
              currentTier,
              (botId) => {
                const current = get().dutchState;
                if (current.sessionId === sessionId && current.roundId === roundId && current.roundResolutionId === roundResolutionId) {
                  get().claimDutchAuction(botId);
                }
              },
              latencyMultiplier
            );
          }
        },
        () => {
          // 바닥가 도달 시 유찰 처리
          get().passDutchAuction();
        }
      );
    },

    /**
     * 더치 역경매 선착순 낙찰 처리 (원자적 락)
     */
    claimDutchAuction: (buyerId: string) => {
      const { dutchState, tickEngine, players, currentItem, fsmState, policeRaidState } = get();

      if (
        fsmState !== 'DUTCH_DROPPING' ||
        (dutchState.claimStatus !== 'OPEN' && dutchState.claimStatus !== 'FLOOR_HOLD') ||
        dutchState.isClaimed ||
        !currentItem ||
        policeRaidState.status === 'RAIDED'
      ) {
        return false;
      }

      const buyer = players.find((p) => p.id === buyerId);
      const purchasePrice = dutchState.currentPrice;

      if (!buyer || buyer.cash < purchasePrice) {
        return false;
      }
      if (!tickEngine.lock()) return false;

      AudioService.playGavelStrike();

      set({
        dutchState: {
          ...dutchState,
          claimStatus: 'CLAIMED',
          isClaimed: true,
          claimedByPlayerId: buyerId,
          claimedPrice: purchasePrice,
        },
        currentHighestBid: purchasePrice,
        highestBidder: buyer,
        fsmState: 'DUTCH_CLAIMED',
      });

      // 1.5초 후 Reveal 상태로 라운드 종료
      const expectedResolutionId = dutchState.roundResolutionId;
      setTimeout(() => {
        const current = get().dutchState;
        if (current.roundResolutionId === expectedResolutionId && current.claimStatus === 'CLAIMED') {
          get().concludeRound();
        }
      }, 1500);

      return true;
    },

    /**
     * 더치 역경매 바닥가 유찰 처리
     */
    passDutchAuction: () => {
      const { dutchState } = get();
      if (dutchState.claimStatus !== 'OPEN' || dutchState.isClaimed) return;

      const expectedResolutionId = dutchState.roundResolutionId;
      const floorHoldUntil = Date.now() + 500;
      set({ dutchState: { ...dutchState, claimStatus: 'FLOOR_HOLD', floorHoldUntil } });

      setTimeout(() => {
        const current = get().dutchState;
        if (current.roundResolutionId !== expectedResolutionId || current.claimStatus !== 'FLOOR_HOLD') return;
        get().tickEngine.lock();
        AudioService.playDiscard();
        set({
          fsmState: 'DUTCH_FLOOR_PASSED',
          highestBidder: null,
          dutchState: { ...current, claimStatus: 'PASSED' },
        });
        setTimeout(() => {
          const settled = get().dutchState;
          if (settled.roundResolutionId === expectedResolutionId && settled.claimStatus === 'PASSED') {
            get().concludeRound();
          }
        }, 1800);
      }, 500);
    },

    /**
     * 라운드 인트로 시작 (아이템 소개 & 3R/5R 돌발 이벤트 체크)
     */
    startRoundIntro: () => {
      const { currentRound, auctionQueue, players, auctionMode } = get();
      const item = auctionQueue[currentRound - 1] || null;
      const isRound4 = currentRound === 4;

      // 3R 또는 5R 돌발 시장 뉴스 발생 체크
      let marketEvent: MarketEvent | null = null;
      let eventModalOpen = false;
      let updatedPlayers = players;

      if (currentRound === 3 || currentRound === 5) {
        const candidates = MASTER_EVENTS.filter((e) => e.round === currentRound);
        if (candidates.length > 0) {
          marketEvent = candidates[Math.floor(Math.random() * candidates.length)];
          eventModalOpen = true;
          AudioService.playNewsAlert();

          if (marketEvent.effectType === 'CASH_GRANT' && marketEvent.cashAmount) {
            const grant = marketEvent.cashAmount;
            updatedPlayers = players.map((p) => ({ ...p, cash: p.cash + grant }));
          }
        }
      }

      // 자정의 암시장 경찰 급습(Police Raid) 체크 (기본 15%, 도난명화 item_bm_03 보유 시 30%)
      let isRaidTriggered = false;
      if (get().currentTier === 'BLACK_MARKET') {
        const careerProfile = useCareerStore.getState().profile;
        const userInventory = players.find((player) => player.isHuman)?.inventory || [];
        const raidChance = getPoliceRaidChance(getOwnedCurseCodes(careerProfile.vaultItemIds, userInventory));
        if (Math.random() < raidChance) {
          isRaidTriggered = true;
        }
      }

      // 봇들의 라운드 시작 대사 갱신
      updatedPlayers = updatedPlayers.map((p) => {
        if (p.isHuman) return p;
        return {
          ...p,
          lastDialogue: AiBotService.getReactionDialogue(p, 'ROUND_START'),
        };
      });

      AudioService.playBGM('AUCTION');

      set({
        currentItem: item,
        fsmState: auctionMode === 'DUTCH' ? 'DUTCH_INTRO' : 'ROUND_INTRO',
        players: updatedPlayers,
        currentHighestBid: item ? item.startingBid : 0,
        highestBidder: null,
        timeLeft: isRound4 ? TIMER_CONFIG.SEALED_BID_DURATION : TIMER_CONFIG.ENGLISH_AUCTION_DURATION,
        timerDeadline: null,
        accumulatedIncrement: 0,
        baseIncrement: Math.max(100, Math.round((item?.startingBid || 1000) * 0.1)),
        isMagnifierActive: false,
        isInsuranceActive: false,
        isSpeedHammerActive: false,
        insuranceRefundAmount: null,
        sealedBids: [],
        sealedBidResolution: null,
        isSealedBidModalOpen: false,
        activeMarketEvent: marketEvent,
        isMarketEventModalOpen: eventModalOpen,
        policeRaidState: isRaidTriggered
          ? {
              raidId: createRuntimeId('raid'),
              isActive: true,
              timeLeft: BLACK_MARKET_CONFIG.ESCAPE_TIME,
              bribeFee: BLACK_MARKET_CONFIG.BRIBE_COST,
              itemPrice: item?.startingBid || 0,
              totalCost: BLACK_MARKET_CONFIG.BRIBE_COST + (item?.startingBid || 0),
              status: 'RAIDED',
            }
          : createPoliceRaidState(item),
        isPoliceRaidModalOpen: isRaidTriggered,
        dutchState: item
          ? {
              sessionId: useCareerStore.getState().profile.activeSession?.sessionId || '',
              roundId: `round-${currentRound}`,
              roundResolutionId: null,
              claimStatus: 'OPEN',
              currentPrice: item.dutchStartPrice,
              startPrice: item.dutchStartPrice,
              floorPrice: item.dutchFloorPrice,
              dropAmountPerTick: Math.round(item.dutchDropRatePerSec * 0.5),
              isClaimed: false,
              claimedByPlayerId: null,
              claimedPrice: null,
            }
          : { ...defaultDutchState },
      });

      // 더치 모드인 경우 3초 인트로 후 자동 틱 시작
      if (auctionMode === 'DUTCH' && !isRaidTriggered) {
        setTimeout(() => {
          if (get().fsmState === 'DUTCH_INTRO') {
            get().startDutchRound();
          }
        }, 3000);
      }
    },

    /**
     * 잉글리시 호가 경매 입찰 진행 시작
     */
    startBidding: () => {
      const { currentRound, auctionMode, players, policeRaidState } = get();
      if (policeRaidState.status === 'RAIDED') return;
      if (auctionMode === 'DUTCH') {
        get().startDutchRound();
        return;
      }
      const isRound4 = currentRound === 4;
      const duration = isRound4 ? TIMER_CONFIG.SEALED_BID_DURATION : TIMER_CONFIG.ENGLISH_AUCTION_DURATION;
      set({
        fsmState: isRound4 ? 'SEALED_BID_ACTIVE' : 'BIDDING_ACTIVE',
        timeLeft: duration,
        timerDeadline: Date.now() + duration * 1000,
        isSpeedHammerActive: false,
        sealedBidResolution: isRound4
          ? {
              roundResolutionId: createRuntimeId(`sealed-round-${currentRound}`),
              phase: 'ACTIVE',
              submissions: [],
              participantOrder: players.map((player) => player.id),
            }
          : null,
      });
    },

    /**
     * 타이머 1초 틱 (잉글리시 & 비밀 경매 전용)
     */
    tickTimer: () => {
      const { timeLeft, timerDeadline, fsmState, policeRaidState } = get();
      if (policeRaidState.status === 'RAIDED') return;
      if (fsmState !== 'BIDDING_ACTIVE' && fsmState !== 'SEALED_BID_ACTIVE') return;

      // QD-25: 탭이 백그라운드로 밀려 인터벌이 지연되어도 deadline 기준으로 남은 시간을 보정한다.
      const deadlineRemaining = timerDeadline
        ? Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000))
        : timeLeft;
      const nextTimeLeft = Math.min(timeLeft - 1, deadlineRemaining);

      if (nextTimeLeft > 0) {
        if (nextTimeLeft <= 4 && nextTimeLeft > 1) {
          AudioService.playBGM('CLIMAX');
        }
        AudioService.playTick(nextTimeLeft <= 3);
        set({ timeLeft: nextTimeLeft });
        if (fsmState === 'BIDDING_ACTIVE') {
          get().triggerBotBidsTick();
        }
      } else {
        set({ timeLeft: 0, timerDeadline: null });
        if (timeLeft <= 4 && timeLeft > 1) {
          AudioService.playBGM('CLIMAX');
        }
        // 시간 만료: 4R 비밀 경매 시 유저 자동 0원(Fold) 처리 후 봇 입찰가 즉시 오픈
        if (fsmState === 'SEALED_BID_ACTIVE') {
          const { currentItem, players } = get();
          const user = players.find((p) => p.isHuman);
          if (user && currentItem) {
            get().submitSealedBid(0);
          } else {
            get().concludeRound();
          }
        } else {
          get().concludeRound();
        }
      }
    },

    /**
     * 잉글리시 봇 실시간 입찰 판단
     */
    triggerBotBidsTick: () => {
      const { players, currentItem, currentHighestBid, highestBidder, currentTier, activeMarketEvent, fsmState } = get();
      if (fsmState !== 'BIDDING_ACTIVE' || !currentItem) return;

      const botPlayers = players.filter((p) => !p.isHuman);
      const shuffledBots = [...botPlayers].sort(() => 0.5 - Math.random());

      for (const bot of shuffledBots) {
        const decision = AiBotService.evaluateBid(
          bot,
          currentItem,
          currentHighestBid,
          highestBidder?.id || null,
          currentTier,
          activeMarketEvent
        );

        if (decision.shouldBid) {
          setTimeout(() => {
            const currentStore = get();
            if (currentStore.fsmState !== 'BIDDING_ACTIVE' || currentStore.policeRaidState.status === 'RAIDED') return;
            if (decision.bidAmount > currentStore.currentHighestBid) {
              get().placeBid(bot.id, decision.bidAmount);
            }
          }, decision.delayMs);
          break;
        }
      }
    },

    /**
     * 라운드 종료 (낙찰 or 유찰 판정 및 가치 Reveal)
     */
    concludeRound: () => {
      const {
        highestBidder,
        currentItem,
        currentHighestBid,
        players,
        isInsuranceActive,
        tickEngine,
        fsmState,
        policeRaidState,
        sealedBidResolution,
      } = get();
      const canSettle = fsmState === 'BIDDING_ACTIVE'
        || fsmState === 'ROUND_SETTLING'
        || fsmState === 'DUTCH_CLAIMED'
        || fsmState === 'DUTCH_FLOOR_PASSED'
        || policeRaidState.status === 'BRIBED_AND_WON';
      if (!canSettle) return;
      tickEngine.stop();
      AudioService.playGavelStrike();

      if (highestBidder && currentItem) {
        let refund = 0;
        if (highestBidder.isHuman && isInsuranceActive) {
          // 보험 손실액도 보존 상태가 반영된 조정 가치를 기준으로 계산한다. (DEC-011)
          const loss = Math.max(0, currentHighestBid - getAdjustedItemValue(currentItem));
          if (loss > 0) {
            refund = loss;
          }
        }

        const updatedPlayers = players.map((p) => {
          if (p.id === highestBidder.id) {
            return {
              ...p,
              cash: p.cash - currentHighestBid + refund,
              inventory: [...p.inventory, currentItem],
              lastDialogue: p.isHuman
                ? undefined
                : currentItem.isFake
                ? AiBotService.getReactionDialogue(p, 'FORGERY')
                : AiBotService.getReactionDialogue(p, 'WON'),
            };
          }
          return {
            ...p,
            lastDialogue: p.isHuman
              ? undefined
              : currentItem.isFake
              ? '저걸 속아서 사다니... 다행이다!'
              : AiBotService.getReactionDialogue(p, 'LOST'),
          };
        });

        if (currentItem.isFake) {
          AudioService.playLoss();
        } else {
          AudioService.playJackpot();
        }

        set({
          players: updatedPlayers,
          fsmState: 'ROUND_REVEAL',
          insuranceRefundAmount: refund > 0 ? refund : null,
          sealedBidResolution: sealedBidResolution
            ? { ...sealedBidResolution, phase: 'SETTLED' }
            : null,
        });
      } else {
        AudioService.playDiscard();
        const updatedPlayers = players.map((p) => ({
          ...p,
          lastDialogue: p.isHuman ? undefined : AiBotService.getReactionDialogue(p, 'PASSED'),
        }));
        set({
          players: updatedPlayers,
          fsmState: 'ROUND_PASSED',
          sealedBidResolution: sealedBidResolution
            ? { ...sealedBidResolution, phase: 'SETTLED' }
            : null,
        });
      }
    },

    /**
     * 다음 라운드로 진행
     */
    nextRound: () => {
      const { currentRound, totalRounds, fsmState } = get();
      // QD-26: 결과 공개 상태에서만 진행해 중복 클릭으로 라운드를 건너뛰지 않게 한다.
      if (fsmState !== 'ROUND_REVEAL' && fsmState !== 'ROUND_PASSED') return;
      if (currentRound >= totalRounds) {
        get().finishGame();
      } else {
        set({ currentRound: currentRound + 1 });
        get().startRoundIntro();
      }
    },

    /**
     * 게임 종료 및 5R 최종 정산 & 커리어 자산 영구 반영
     */
    finishGame: () => {
      const { players, activeMarketEvent, fsmState, earnedAchievementIds } = get();
      if (fsmState === 'GAME_OVER') return;
      const previousProfile = useCareerStore.getState().profile;
      const activeSession = previousProfile.activeSession;
      if (!activeSession) return;
      AudioService.playBGM('VICTORY');

      const rankings = players
        .map((p) => {
          // DEC-011: 보존 상태·잭팟·시장 이벤트를 반영한 단일 평가 계약
          const inventoryVal = p.inventory.reduce(
            (sum, item) => sum + getSessionItemValue(item, activeMarketEvent),
            0
          );
          // 위작은 시너지 세트 조건과 보너스에서 제외한다. (QD-30)
          const synergyBonus = calculateSynergyBonus(p.inventory, activeMarketEvent);

          const loanDeduction = p.hasTakenLoan ? p.loanRepaymentAmount : 0;
          const finalNetWorth = p.cash + inventoryVal + synergyBonus - loanDeduction;

          return {
            player: p,
            cash: p.cash,
            inventoryTotalValue: inventoryVal,
            synergyBonusValue: synergyBonus,
            loanDeduction,
            finalNetWorth,
            rank: 1,
          };
        })
        .sort((a, b) => b.finalNetWorth - a.finalNetWorth)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));

      const userEntry = rankings.find((r) => r.player.isHuman);
      const userWon = userEntry?.rank === 1;
      const userAcquiredItems = userEntry?.player.inventory || [];

      // 업적 달성 검사
      const unlockedAchievements: string[] = [...earnedAchievementIds];
      if (userWon) {
        if (!unlockedAchievements.includes('ach-first-win')) unlockedAchievements.push('ach-first-win');
        if (userEntry?.player.hasTakenLoan) {
          if (!unlockedAchievements.includes('ach-leverage-king')) unlockedAchievements.push('ach-leverage-king');
        }
      }
      // QD-18: 진품만 낙찰받아 '승리'한 경우에만 베테랑 감정사 업적을 부여한다.
      if (userWon && userAcquiredItems.length > 0 && userAcquiredItems.every((i) => !i.isFake)) {
        if (!unlockedAchievements.includes('ach-forgery-hunter')) unlockedAchievements.push('ach-forgery-hunter');
      }

      // 커리어 스토어에 영구 커밋 (판당 현금 수익 + 소장 유물 + 승급 판정)
      const settlement = useCareerStore.getState().commitGameResult({
        sessionId: activeSession.sessionId,
        outcome: 'NORMAL',
        endingCash: (userEntry?.cash || 0) - (userEntry?.loanDeduction || 0),
        acquiredItems: userAcquiredItems,
        isWinner: userWon,
        unlockedAchievementIds: unlockedAchievements,
      });
      if (settlement.status !== 'APPLIED' && settlement.status !== 'ALREADY_APPLIED') return;
      const { promotedTier } = settlement;

      // QD-19: 결과 화면에는 이번 정산에서 실제로 새로 해금된 항목만 표시한다.
      const committedProfile = useCareerStore.getState().profile;
      const previousItemIds = new Set(previousProfile.vaultItemIds);
      const newlyUnlockedItemIds = committedProfile.vaultItemIds.filter((id) => !previousItemIds.has(id));
      const newlyUnlockedAchievementIds = settlement.newlyUnlockedAchievementIds;

      set({
        fsmState: 'GAME_OVER',
        currentView: 'GALLERY',
        settlementSummary: {
          playerRankings: rankings,
          userEarnedTitles: userWon ? ['소더비 그랜드 챔피언', '황금의 손'] : ['명예 수집가'],
          newlyUnlockedItemIds,
          newlyUnlockedAchievementIds,
          promotedTier,
        },
      });
    },

    returnToLobby: () => {
      get().tickEngine.stop();
      const profile = useCareerStore.getState().profile;
      if (profile.activeSession) {
        const settlement = useCareerStore.getState().commitGameResult({
          sessionId: profile.activeSession.sessionId,
          outcome: 'ABANDONED',
          endingCash: profile.careerCash,
          acquiredItems: [],
          isWinner: false,
          unlockedAchievementIds: [],
        });
        // 저장 실패 시 세션을 잃지 않도록 로비 전환을 보류한다. (QD-02)
        if (settlement.status === 'SAVE_FAILED') return;
      }
      AudioService.playBGM('LOBBY');
      set({
        currentView: 'LOBBY',
        fsmState: 'IDLE',
        currentRound: 1,
        currentItem: null,
        highestBidder: null,
        currentHighestBid: 0,
        timerDeadline: null,
        settlementSummary: null,
        isSealedBidModalOpen: false,
        sealedBidResolution: null,
        isMarketEventModalOpen: false,
        isAppraisalModalOpen: false,
        isSpeedHammerActive: false,
        dutchState: { ...defaultDutchState },
        policeRaidState: createPoliceRaidState(),
        isPoliceRaidModalOpen: false,
      });
    },
  };
});
