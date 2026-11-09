export type ItemCategory = 'PAINTING' | 'ANTIQUE' | 'JEWELRY';
export type BotPersonality = 'WARREN' | 'DOGE' | 'PICASSO';
export type RoomTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' | 'BLACK_MARKET';
export type AuctionMode = 'ENGLISH' | 'DUTCH';
export type ChanceCardType = 'MAGNIFIER' | 'SPEED_HAMMER' | 'INSURANCE';
export type AuctionRoundType = 'ENGLISH' | 'SEALED_BID' | 'DUTCH';
export type ItemCondition = 'PRISTINE' | 'DUSTY' | 'DAMAGED' | 'RUINED';

export type ContrabandCurseCode =
  | 'END_GAME_CASH_FEE'
  | 'DUTCH_BOT_LATENCY_20'
  | 'POLICE_RAID_CHANCE_30'
  | 'DUMP_LOSS_X1_5'
  | 'LOAN_INTEREST_30'
  | 'RESTORE_FAIL_PLUS_10P';

export type CareerSessionOutcome = 'NORMAL' | 'ESCAPED' | 'ARRESTED' | 'ABANDONED';

export interface ActiveCareerSession {
  sessionId: string;
  tier: RoomTier;
  entryFee: number;
  sessionCashStart: number;
  ticketConsumed: 0 | 1;
  status: 'ACTIVE';
}

export interface CareerSettlementCommand {
  sessionId: string;
  outcome: CareerSessionOutcome;
  endingCash: number;
  acquiredItems: Item[];
  isWinner: boolean;
  unlockedAchievementIds: string[];
}

export interface CareerSettlementReceipt {
  sessionId: string;
  outcome: CareerSessionOutcome;
  careerCashAfter: number;
  careerNetWorthAfter: number;
  appliedAt: number;
}

export interface PoliceRaidState {
  raidId: string | null;
  isActive: boolean;
  timeLeft: number;          // 탈출 제한시간 (기본 5초)
  bribeFee: number;          // 뇌물 비용 (기본 $5,000)
  itemPrice: number;
  totalCost: number;
  status: 'IDLE' | 'RAIDED' | 'RESOLVING' | 'ESCAPED' | 'BRIBED_AND_WON' | 'ARRESTED';
}

export interface CategoryMarketRates {
  lastUpdatedGame: number;
  rates: Record<ItemCategory, {
    multiplier: number;        // e.g. 0.4x (-60%) ~ 3.5x (+250%)
    trend: 'PUMP' | 'DUMP' | 'STABLE';
    newsHeadline: string;
  }>;
}

export interface RestorationResult {
  outcome: 'SUCCESS' | 'JACKPOT' | 'FAILED_RUINED';
  previousCondition: ItemCondition;
  newCondition: ItemCondition;
  valueChangeMultiplier: number;
  message: string;
}

export type AuctionFSMState =
  | 'IDLE'                 // 게임 시작 전
  | 'ROUND_INTRO'          // 라운드 소개 (아이템 정보 브리핑, 감정사/돋보기 가능)
  | 'BIDDING_ACTIVE'       // 잉글리시 실시간 호가 진행 중
  | 'SEALED_BID_ACTIVE'    // 4R 비밀 봉투 비공개 제출 진행 중
  | 'SEALED_BID_FINALIZING'
  | 'SEALED_BID_REVEALED'
  | 'ROUND_SETTLING'
  | 'DUTCH_INTRO'          // 더치 역경매 3초 브리핑
  | 'DUTCH_DROPPING'       // 더치 역경매 실시간 가격 하락 틱 진행 중
  | 'DUTCH_CLAIMED'        // 더치 역경매 선착순 낙찰 성공
  | 'DUTCH_FLOOR_PASSED'   // 더치 역경매 바닥가 유찰
  | 'ROUND_REVEAL'         // 낙찰 완료 및 히든 가치/위작 여부 공개
  | 'ROUND_PASSED'         // 유찰 (폐기)
  | 'FINAL_SETTLEMENT'     // 5R 종료 후 최종 대출 상환 및 시너지 정산
  | 'GAME_OVER';           // 시상식 및 엔딩 전시관

export interface RoomTierConfig {
  id: RoomTier;
  name: string;
  subtitle: string;
  minNetWorthRequired: number; // 입장 최소 순자산 ($)
  entryFee: number;            // 입장 보증금/티켓 비용 ($)
  roundsPerGame: number;       // 기본 5라운드
  botStartingCashRange: [number, number]; // 봇 시작 자금 범위
  botAggressiveness: number;   // 봇 지능 및 입찰 난이도 가중치
  description: string;
  badge: string;
}

export interface ChanceCard {
  id: string;
  type: ChanceCardType;
  name: string;
  description: string;
  icon: string;
  imageUrl?: string;
  isUsed: boolean;
}

export interface Item {
  id: string;
  tier: RoomTier;            // [필수] 소속 룸 티어 (중복 출품 0%)
  name: string;
  category: ItemCategory;
  condition?: ItemCondition; // 유물 보존 상태 (기본: PRISTINE)
  conditionMultiplier?: number; // 상태별 가치 인정률 (1.0 | 0.8 | 0.5 | 0.2)
  restorationCost?: number;  // 복원 비용
  isJackpot?: boolean;       // 잭팟 2배 서명 발견 여부
  isContraband?: boolean;    // [신규] 암시장 금기 밀수품 여부
  curseCode?: ContrabandCurseCode; // 실행 로직 식별자. curseDebuff 문자열은 표시 전용
  curseDebuff?: string;      // [신규] 금기 유물 저주 디버프 설명
  estimatedMin: number;      // 감정 최소 추정가 ($)
  estimatedMax: number;      // 감정 최대 추정가 ($)
  realValue: number;         // 실제 시장 가치 ($) (위작일 경우 $0)
  startingBid: number;       // 경매 시작 호가 ($)
  dutchStartPrice: number;   // 더치 역경매 시작 최고가 ($)
  dutchFloorPrice: number;   // 더치 역경매 최저 바닥가 ($)
  dutchDropRatePerSec: number; // 더치 역경매 초당 하락액 ($)
  description: string;
  imageUrl: string;
  synergyPairId?: string;    // 특수 시너지 세트 ID
  synergyPairName?: string;  // 시너지 세트 표시명
  isFake?: boolean;          // 위작 여부 (출품 시 15~20% 확률)
  isAppraised?: boolean;     // 감정 완료 여부
  appraisalCost: number;     // 감정 비용 (기본 $500)
  historicalLore?: string;   // 도감용 역사 배경 설명
}

export interface DutchAuctionState {
  sessionId: string;
  roundId: string;
  roundResolutionId: string | null;
  claimStatus: 'OPEN' | 'CLAIMED' | 'FLOOR_HOLD' | 'PASSED';
  floorHoldUntil?: number;
  currentPrice: number;
  startPrice: number;
  floorPrice: number;
  dropAmountPerTick: number; // 0.5초당 하락액
  isClaimed: boolean;
  claimedByPlayerId: string | null;
  claimedPrice: number | null;
}

export interface BotDialogue {
  roundStart?: string[];
  bidPlaced?: string[];
  itemWon?: string[];
  itemLost?: string[];
  itemPassed?: string[];
  forgeryReaction?: string[];
}

export interface Player {
  id: string;
  name: string;
  isHuman: boolean;
  avatar: string;
  cash: number;              // 보유 현금 ($)
  inventory: Item[];         // 낙찰 아이템 목록
  chanceCards: ChanceCard[]; // 1회용 찬스 카드
  hasTakenLoan: boolean;     // 긴급 대출 $3,000 실행 여부
  loanRepaymentAmount: number; // 최종 정산 시 상환액 ($3,600)
  persona?: BotPersonality;
  personaTitle?: string;
  favoriteCategory?: ItemCategory;
  dialogues?: BotDialogue;
  lastDialogue?: string;     // 최근 출력 대사
  lastBidAmount?: number;
  personaAggressiveness?: number;
}

export interface SealedBidSubmission {
  playerId: string;
  playerName: string;
  amount: number;
  isHuman: boolean;
  avatar: string;
}

export interface SealedBidResolution {
  roundResolutionId: string;
  phase: 'ACTIVE' | 'FINALIZING' | 'REVEALED' | 'SETTLING' | 'SETTLED';
  submissions: SealedBidSubmission[];
  participantOrder: string[];
}

export interface MarketEvent {
  id: string;
  round: number; // 3 또는 5
  title: string;
  headline: string;
  description: string;
  imageUrl?: string;
  effectType: 'CATEGORY_MULTIPLIER' | 'CASH_GRANT' | 'TAX_AUDIT' | 'STARTING_BID_DISCOUNT';
  targetCategory?: ItemCategory;
  multiplier?: number;
  cashAmount?: number;
}

export interface SynergySet {
  id: string;
  name: string;
  requiredItemIds: string[];
  bonusMultiplier: number; // e.g. 1.3 (+30%)
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  badge: string;
  badgeImageUrl?: string;
  description: string;
  unlockedAt?: number;
}

/**
 * [영구 커리어 자산 모델 - V2.3.1]
 */
export interface PersistentCareerProfile {
  storageVersion: '2.3.1';
  careerCash: number;              // 현재 가용 현금 ($) (신규 유저 기본: $5,000)
  careerNetWorth: number;          // 총 순자산 (가용 현금 + 보관함 유물 실제 가치 총합)
  vaultItemIds: string[];          // 수집 완료된 영구 유물 ID 목록 (Normalized)
  vaultItemStates?: Record<string, { condition: ItemCondition; isJackpot?: boolean }>; // 복원/잭팟 상태 저장
  unlockedAchievementIds: string[];// 달성한 업적 ID들 (Normalized)
  highestRoomTierUnlocked: RoomTier;
  blackVipTicketCount?: number;    // [신규] 자정의 암시장 VIP 티켓 보유 수량
  totalGamesPlayed: number;
  totalWins: number;
  isBankrupt: boolean;             // 파산 여부 (현금 < $500 && 순자산 < $1,000)
  bankruptcyCount: number;         // 누적 파산 신청 횟수
  activeSession?: ActiveCareerSession;
  lastSettlementReceipt?: CareerSettlementReceipt;
  marketRates?: CategoryMarketRates; // QD-07: 새로고침으로 시세를 회피하지 못하도록 프로필에 함께 저장
  lastUpdatedTimestamp: number;
}

export interface FinalSettlementSummary {
  playerRankings: {
    rank: number;
    player: Player;
    cash: number;
    inventoryTotalValue: number;
    synergyBonusValue: number;
    loanDeduction: number;
    finalNetWorth: number;
  }[];
  userEarnedTitles: string[];
  newlyUnlockedItemIds: string[];
  newlyUnlockedAchievementIds: string[];
  promotedTier?: RoomTier | null;
}

export type UserStorageState = PersistentCareerProfile;
