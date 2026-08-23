import { create } from 'zustand';
import {
  PersistentCareerProfile,
  RoomTier,
  Item,
  Achievement,
  CategoryMarketRates,
  ItemCondition,
  RestorationResult,
  ItemCategory,
  CareerSettlementCommand,
  CareerSettlementReceipt,
} from '../types';
import { ROOM_TIERS_MASTER, ROOM_TIER_ORDER } from '../data/roomTiers';
import { MASTER_ITEMS } from '../data/masterItems';
import { MASTER_ACHIEVEMENTS } from '../data/masterAchievements';
import { BANKRUPTCY_CONFIG, RESTORATION_CONFIG } from '../data/constants';
import {
  applyDumpLossCurse,
  applyEndGameCashCurse,
  getOwnedCurseCodes,
  getRestorationProbabilities,
} from '../services/contrabandService';

export const STORAGE_KEY_V2 = 'SIMPLE_AUCTION_CAREER_V2';

export const INITIAL_CAREER_PROFILE: PersistentCareerProfile = {
  storageVersion: '2.3.1',
  careerCash: 5000,
  careerNetWorth: 5000,
  vaultItemIds: [],
  vaultItemStates: {},
  unlockedAchievementIds: [],
  highestRoomTierUnlocked: 'BRONZE',
  blackVipTicketCount: 0,
  totalGamesPlayed: 0,
  totalWins: 0,
  isBankrupt: false,
  bankruptcyCount: 0,
  lastUpdatedTimestamp: Date.now()
};

const createRuntimeId = (prefix: string): string => {
  const randomId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
};

const toNonNegativeInteger = (value: unknown, fallback = 0): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.floor(numeric) : fallback;
};

const toFiniteNumber = (value: unknown, fallback: number): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export const INITIAL_MARKET_RATES: CategoryMarketRates = {
  lastUpdatedGame: 0,
  rates: {
    PAINTING: { multiplier: 1.0, trend: 'STABLE', newsHeadline: '📰 [회화 안정] 뉴욕/런던 옥션 하우스의 명화 거래량이 안정세를 유지 중입니다.' },
    ANTIQUE: { multiplier: 1.0, trend: 'STABLE', newsHeadline: '📰 [골동품 보합] 고미술 협회 정기 감정가가 전월 대비 보합세를 기록했습니다.' },
    JEWELRY: { multiplier: 1.0, trend: 'STABLE', newsHeadline: '📰 [보석 견조] 왕실 경매 프리미엄이 유지되며 보석 시세가 견조합니다.' },
  }
};

const MARKET_HEADLINES: Record<ItemCategory, { PUMP: string[]; DUMP: string[]; STABLE: string[] }> = {
  PAINTING: {
    PUMP: [
      '📰 [시장 대폭등] 아랍 국부펀드의 회화 독점 매수! 회화 시세 폭등!',
      '📰 [명화 떡상] 파리 루브르 특별전 개막으로 유럽 명화 경매가 급등!'
    ],
    DUMP: [
      '📰 [회화 폭락] 유명 갤러리 연쇄 파산으로 미술품 경매가 급락!',
      '📰 [미술 시장 투매] 미술품 펀드 청산으로 회화 시세 일시적 덤핑!'
    ],
    STABLE: [
      '📰 [회화 안정] 뉴욕/런던 옥션 하우스의 명화 거래량이 안정세를 유지 중입니다.'
    ]
  },
  ANTIQUE: {
    PUMP: [
      '📰 [골동품 떡상] 실리콘밸리 억만장자들의 고미술 싹쓸이! 골동품 시세 폭등!',
      '📰 [황실 유물 랠리] 대영 박물관 미공개 컬렉션 화제로 고대 유물 가치 폭등!'
    ],
    DUMP: [
      '📰 [골동품 투매] 고고학계 발굴 과잉 공급으로 골동품 시세 폭락!',
      '📰 [골동품 관세 인상] 국가간 문화재 반출 규제로 골동품 거래가 하락!'
    ],
    STABLE: [
      '📰 [골동품 보합] 고미술 협회 정기 감정가가 전월 대비 보합세를 기록했습니다.'
    ]
  },
  JEWELRY: {
    PUMP: [
      '📰 [보석 랠리] 글로벌 안전자산 선호 심리로 희귀 보석 시세 초대박!',
      '📰 [다이아몬드 쇼티지] 남아공 핵심 광산 채굴 중단으로 최고급 보석 품귀!'
    ],
    DUMP: [
      '📰 [보석 급락] 인공 합성 다이아몬드 대량 유통으로 천연 보석 시세 하락!',
      '📰 [귀금속 조정] 금리 인상 여파로 명품 보석류 현금화 매물 출회!'
    ],
    STABLE: [
      '📰 [보석 견조] 왕실 경매 프리미엄이 유지되며 보석 시세가 견조합니다.'
    ]
  }
};

export const generateRandomMarketRates = (gameCount: number): CategoryMarketRates => {
  const categories: ItemCategory[] = ['PAINTING', 'ANTIQUE', 'JEWELRY'];
  const ratesObj = {} as CategoryMarketRates['rates'];

  categories.forEach((cat) => {
    // -60% (0.4x) ~ +250% (3.5x)
    const rawMultiplier = Math.random() * 3.1 + 0.4;
    const multiplier = Math.round(rawMultiplier * 10) / 10;
    const trend = multiplier >= 1.5 ? 'PUMP' : multiplier <= 0.6 ? 'DUMP' : 'STABLE';
    const headlines = MARKET_HEADLINES[cat][trend];
    const newsHeadline = headlines[Math.floor(Math.random() * headlines.length)];

    ratesObj[cat] = {
      multiplier,
      trend,
      newsHeadline: `${newsHeadline} (${multiplier >= 1 ? `+${Math.round((multiplier - 1) * 100)}%` : `-${Math.round((1 - multiplier) * 100)}%`})`
    };
  });

  return {
    lastUpdatedGame: gameCount,
    rates: ratesObj
  };
};

export interface RoomGatingStatus {
  tier: RoomTier;
  isUnlocked: boolean;
  canAffordFee: boolean;
  isPlayable: boolean;
  netWorthDeficit: number;
  feeDeficit: number;
}

export const checkIsBankrupt = (cash: number, netWorth: number): boolean => {
  return cash < BANKRUPTCY_CONFIG.CASH_THRESHOLD && netWorth < BANKRUPTCY_CONFIG.NET_WORTH_THRESHOLD;
};

export const evaluateRoomGating = (
  tier: RoomTier,
  profile: PersistentCareerProfile
): RoomGatingStatus => {
  const config = ROOM_TIERS_MASTER[tier];
  let isUnlocked = profile.careerNetWorth >= config.minNetWorthRequired;
  if (tier === 'BLACK_MARKET') {
    isUnlocked = profile.careerNetWorth >= config.minNetWorthRequired || (profile.blackVipTicketCount || 0) >= 1;
  }
  const canAffordFee = profile.careerCash >= config.entryFee;

  return {
    tier,
    isUnlocked,
    canAffordFee,
    isPlayable: isUnlocked && canAffordFee && !profile.isBankrupt,
    netWorthDeficit: Math.max(0, config.minNetWorthRequired - profile.careerNetWorth),
    feeDeficit: Math.max(0, config.entryFee - profile.careerCash)
  };
};

export const loadProfileFromStorage = (abandonUnrecoverableSession = true): PersistentCareerProfile => {
  if (typeof localStorage === 'undefined') return { ...INITIAL_CAREER_PROFILE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2);
    if (!raw) return { ...INITIAL_CAREER_PROFILE };

    const parsed = JSON.parse(raw);
    const cash = toFiniteNumber(parsed.careerCash, 5000);
    const netWorth = toFiniteNumber(parsed.careerNetWorth, 5000);
    const isBankrupt = Boolean(parsed.isBankrupt ?? checkIsBankrupt(cash, netWorth));
    const validItemIds = new Set(MASTER_ITEMS.map((item) => item.id));
    const parsedItemIds: unknown[] = Array.isArray(parsed.vaultItemIds) ? parsed.vaultItemIds : [];
    const vaultItemIds: string[] = [...new Set<string>(parsedItemIds.filter(
      (id: unknown): id is string => typeof id === 'string' && validItemIds.has(id)
    ))];
    if (vaultItemIds.length !== parsedItemIds.length) {
      console.warn('[CareerStore] Unknown or duplicate vault item ids were ignored during migration.');
    }

    const baseProfile: PersistentCareerProfile = {
      storageVersion: '2.3.1',
      careerCash: cash,
      careerNetWorth: netWorth,
      vaultItemIds,
      vaultItemStates: parsed.vaultItemStates || {},
      unlockedAchievementIds: Array.isArray(parsed.unlockedAchievementIds) ? parsed.unlockedAchievementIds : [],
      highestRoomTierUnlocked: parsed.highestRoomTierUnlocked || 'BRONZE',
      blackVipTicketCount: toNonNegativeInteger(parsed.blackVipTicketCount),
      totalGamesPlayed: toNonNegativeInteger(parsed.totalGamesPlayed),
      totalWins: toNonNegativeInteger(parsed.totalWins),
      isBankrupt,
      bankruptcyCount: toNonNegativeInteger(parsed.bankruptcyCount),
      lastUpdatedTimestamp: toFiniteNumber(parsed.lastUpdatedTimestamp, Date.now()),
      lastSettlementReceipt: parsed.lastSettlementReceipt,
      activeSession: !abandonUnrecoverableSession && parsed.activeSession?.status === 'ACTIVE'
        ? parsed.activeSession
        : undefined,
    };

    if (abandonUnrecoverableSession && parsed.activeSession?.status === 'ACTIVE' && typeof parsed.activeSession.sessionId === 'string') {
      baseProfile.lastSettlementReceipt = {
        sessionId: parsed.activeSession.sessionId,
        outcome: 'ABANDONED',
        careerCashAfter: cash,
        careerNetWorthAfter: netWorth,
        appliedAt: Date.now(),
      };
    }

    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(baseProfile));
    return baseProfile;
  } catch (e) {
    console.warn('[CareerStore] Failed to load profile. Using initial.', e);
    return { ...INITIAL_CAREER_PROFILE };
  }
};

const saveProfileToStorage = (profile: PersistentCareerProfile) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(profile));
  } catch (e) {
    console.error('[CareerStore] Failed to save profile to localStorage.', e);
  }
};

const computeVaultTotalValue = (
  vaultItemIds: string[],
  vaultStates: Record<string, { condition: ItemCondition; isJackpot?: boolean }>,
  acquiredItems: Item[] = []
): number => {
  return vaultItemIds.reduce((sum, id) => {
    const master = MASTER_ITEMS.find((m) => m.id === id) || acquiredItems.find((a) => a.id === id);
    if (!master) return sum;

    const state = vaultStates[id];
    const condition = state?.condition || master.condition || 'PRISTINE';
    const isJackpot = state?.isJackpot || false;

    const ratio = isJackpot ? 2.0 : (RESTORATION_CONFIG.CONDITION_VALUE_RATIOS[condition] ?? 1.0);
    return sum + Math.round(master.realValue * ratio);
  }, 0);
};

interface CareerStoreState {
  profile: PersistentCareerProfile;
  marketRates: CategoryMarketRates;
  lastPromotedTier: RoomTier | null;

  // Actions
  enterRoom: (tier: RoomTier) => boolean;
  commitGameResult: (command: CareerSettlementCommand) => {
    status: 'APPLIED' | 'ALREADY_APPLIED' | 'STALE_SESSION' | 'INVALID';
    newNetWorth: number;
    promotedTier: RoomTier | null;
    isBankrupt: boolean;
  };
  declareBankruptcy: () => void;
  unlockAchievements: (achievementIds: string[]) => void;
  unlockItems: (itemIds: string[]) => string[];
  grantBlackVipTicket: (count?: number) => void;
  resetCareer: () => void;
  clearPromotionNotice: () => void;

  // v2.2.0 Systems
  rollNewMarketRates: () => CategoryMarketRates;
  attemptRestoration: (itemId: string) => RestorationResult;
  sellConsignmentItem: (itemId: string) => { soldItem: Item; payout: number };

  // Selectors
  getHydratedVaultItems: () => Item[];
  getHydratedAchievements: () => { achievement: Achievement; isUnlocked: boolean }[];
  getGatingStatus: (tier: RoomTier) => RoomGatingStatus;
}

export const useCareerStore = create<CareerStoreState>((set, get) => ({
  profile: loadProfileFromStorage(),
  marketRates: INITIAL_MARKET_RATES,
  lastPromotedTier: null,

  enterRoom: (tier: RoomTier): boolean => {
    const { profile } = get();
    if (profile.activeSession) return false;
    const gating = evaluateRoomGating(tier, profile);

    if (!gating.isPlayable) {
      return false;
    }

    const config = ROOM_TIERS_MASTER[tier];
    if (!Number.isFinite(config.entryFee) || config.entryFee < 0) return false;

    const updatedCash = profile.careerCash - config.entryFee;
    const isNowBankrupt = checkIsBankrupt(updatedCash, profile.careerNetWorth - config.entryFee);

    // 암시장 입장 시 티켓 소모 (순자산 10만 미만일 때 티켓 사용)
    let updatedTickets = profile.blackVipTicketCount || 0;
    if (tier === 'BLACK_MARKET' && profile.careerNetWorth < config.minNetWorthRequired && updatedTickets > 0) {
      updatedTickets -= 1;
    }

    const updatedProfile: PersistentCareerProfile = {
      ...profile,
      careerCash: updatedCash,
      careerNetWorth: profile.careerNetWorth - config.entryFee,
      blackVipTicketCount: updatedTickets,
      activeSession: {
        sessionId: createRuntimeId('session'),
        tier,
        entryFee: config.entryFee,
        sessionCashStart: updatedCash,
        ticketConsumed: updatedTickets < (profile.blackVipTicketCount || 0) ? 1 : 0,
        status: 'ACTIVE',
      },
      isBankrupt: isNowBankrupt,
      lastUpdatedTimestamp: Date.now()
    };

    saveProfileToStorage(updatedProfile);
    set({ profile: updatedProfile });
    return true;
  },

  commitGameResult: (command: CareerSettlementCommand) => {
    const { profile, rollNewMarketRates } = get();

    const fallbackResult = (status: 'ALREADY_APPLIED' | 'STALE_SESSION' | 'INVALID') => ({
      status,
      newNetWorth: profile.careerNetWorth,
      promotedTier: null,
      isBankrupt: profile.isBankrupt,
    });

    if (profile.lastSettlementReceipt?.sessionId === command.sessionId && !profile.activeSession) {
      return fallbackResult('ALREADY_APPLIED');
    }
    if (!profile.activeSession || profile.activeSession.sessionId !== command.sessionId) {
      return fallbackResult('STALE_SESSION');
    }
    if (!Number.isFinite(command.endingCash) || !Array.isArray(command.acquiredItems)) {
      return fallbackResult('INVALID');
    }

    const commitsSessionProgress = command.outcome !== 'ABANDONED';
    const acquiredItems = command.outcome === 'ARRESTED' || command.outcome === 'ABANDONED'
      ? []
      : command.acquiredItems;
    const isWinner = command.outcome === 'NORMAL' && command.isWinner;

    // 2. 신규 획득 유물 ID 누적 & 초기 상태 등록
    const currentVaultSet = new Set(profile.vaultItemIds);
    const validItemIds = new Set(MASTER_ITEMS.map((item) => item.id));
    const updatedStates = { ...(profile.vaultItemStates || {}) };

    acquiredItems.forEach((item) => {
      // 위작이 아닌 진품만 영구 보관함에 가치 보존
      if (!item.isFake && validItemIds.has(item.id)) {
        currentVaultSet.add(item.id);
        if (!updatedStates[item.id]) {
          updatedStates[item.id] = {
            condition: item.condition || 'PRISTINE',
            isJackpot: false
          };
        }
      }
    });
    const updatedVaultItemIds = Array.from(currentVaultSet);

    let newCash = command.outcome === 'ARRESTED'
      ? 0
      : command.outcome === 'ABANDONED'
        ? profile.careerCash
        : command.endingCash;
    if (command.outcome === 'NORMAL' || command.outcome === 'ESCAPED') {
      newCash = applyEndGameCashCurse(newCash, getOwnedCurseCodes(profile.vaultItemIds, acquiredItems));
    }

    // 3. 소장 유물 실제 가치 총합 계산 (상태 및 잭팟 계수 반영)
    const vaultTotalValue = computeVaultTotalValue(updatedVaultItemIds, updatedStates, acquiredItems);

    // 4. 총 순자산 (가용 현금 + 보관함 유물 가치)
    const newNetWorth = newCash + vaultTotalValue;

    // 5. 파산 여부 엄격 판정
    const isBankrupt = checkIsBankrupt(newCash, newNetWorth);

    // 6. 룸 티어 승급/강등 판정
    let calculatedHighestTier: RoomTier = 'BRONZE';
    if (newNetWorth >= ROOM_TIERS_MASTER.DIAMOND.minNetWorthRequired) {
      calculatedHighestTier = 'DIAMOND';
    } else if (newNetWorth >= ROOM_TIERS_MASTER.GOLD.minNetWorthRequired) {
      calculatedHighestTier = 'GOLD';
    } else if (newNetWorth >= ROOM_TIERS_MASTER.SILVER.minNetWorthRequired) {
      calculatedHighestTier = 'SILVER';
    }

    const prevTierIndex = ROOM_TIER_ORDER.indexOf(profile.highestRoomTierUnlocked);
    const newTierIndex = ROOM_TIER_ORDER.indexOf(calculatedHighestTier);

    let promotedTier: RoomTier | null = null;
    if (newTierIndex > prevTierIndex && !isBankrupt) {
      promotedTier = calculatedHighestTier;
    }

    // 7. 암시장 VIP 티켓 보상: 골드/다이아 정상 완주 및 blind-master 최초 해금
    let updatedTickets = profile.blackVipTicketCount || 0;
    if (command.outcome === 'NORMAL' && (profile.activeSession.tier === 'GOLD' || profile.activeSession.tier === 'DIAMOND')) {
      updatedTickets += 1;
    }

    // 8. 업적 자동 점검
    const currentAchSet = new Set(profile.unlockedAchievementIds);
    const hadBlindMaster = currentAchSet.has('ach-blind-master');
    if (commitsSessionProgress) {
      command.unlockedAchievementIds.forEach((id) => currentAchSet.add(id));
    }
    if (isWinner) currentAchSet.add('ach-first-win');
    if (acquiredItems.some((i) => i.isFake === false && i.isAppraised)) {
      currentAchSet.add('ach-forgery-hunter');
    }
    if (newNetWorth >= 100000) currentAchSet.add('ach-iron-vault');
    if (updatedVaultItemIds.length >= 12) currentAchSet.add('ach-museum-complete');
    if (command.outcome === 'NORMAL' && !hadBlindMaster && currentAchSet.has('ach-blind-master')) {
      updatedTickets += 1;
    }

    const appliedAt = Date.now();
    const receipt: CareerSettlementReceipt = {
      sessionId: command.sessionId,
      outcome: command.outcome,
      careerCashAfter: newCash,
      careerNetWorthAfter: newNetWorth,
      appliedAt,
    };

    const updatedProfile: PersistentCareerProfile = {
      ...profile,
      careerCash: newCash,
      careerNetWorth: newNetWorth,
      vaultItemIds: updatedVaultItemIds,
      vaultItemStates: updatedStates,
      unlockedAchievementIds: Array.from(currentAchSet),
      highestRoomTierUnlocked: isBankrupt ? 'BRONZE' : (newTierIndex > prevTierIndex ? calculatedHighestTier : profile.highestRoomTierUnlocked),
      blackVipTicketCount: updatedTickets,
      totalGamesPlayed: profile.totalGamesPlayed + (commitsSessionProgress ? 1 : 0),
      totalWins: profile.totalWins + (isWinner ? 1 : 0),
      isBankrupt,
      activeSession: undefined,
      lastSettlementReceipt: receipt,
      lastUpdatedTimestamp: appliedAt,
    };

    saveProfileToStorage(updatedProfile);

    // 새 게임 종료 시 카테고리 극심 시세 변동 롤링
    if (commitsSessionProgress) rollNewMarketRates();

    set({ profile: updatedProfile, lastPromotedTier: promotedTier });

    return { status: 'APPLIED' as const, newNetWorth, promotedTier, isBankrupt };
  },

  grantBlackVipTicket: (count = 1) => {
    const { profile } = get();
    const updated = {
      ...profile,
      blackVipTicketCount: (profile.blackVipTicketCount || 0) + count,
      lastUpdatedTimestamp: Date.now()
    };
    saveProfileToStorage(updated);
    set({ profile: updated });
  },

  rollNewMarketRates: (): CategoryMarketRates => {
    const { profile } = get();
    const newRates = generateRandomMarketRates(profile.totalGamesPlayed + 1);
    set({ marketRates: newRates });
    return newRates;
  },

  attemptRestoration: (itemId: string): RestorationResult => {
    const { profile } = get();
    const item = MASTER_ITEMS.find((m) => m.id === itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    if (!profile.vaultItemIds.includes(itemId)) {
      throw new Error(`Item ${itemId} is not in user vault`);
    }

    const currentStates = { ...(profile.vaultItemStates || {}) };
    const currentItemState = currentStates[itemId] || { condition: item.condition || 'PRISTINE', isJackpot: false };
    const prevCondition = currentItemState.condition;

    const cost = item.restorationCost || 500;
    if (profile.careerCash < cost) {
      throw new Error(`Insufficient cash for restoration. Needed: $${cost}, available: $${profile.careerCash}`);
    }

    const restorationProbabilities = getRestorationProbabilities(getOwnedCurseCodes(profile.vaultItemIds));
    const roll = Math.random();
    let outcome: RestorationResult['outcome'] = 'SUCCESS';
    let newCondition: ItemCondition = 'PRISTINE';
    let isJackpot = false;
    let message = '';
    let valueChangeMultiplier = 1.0;

    if (roll < restorationProbabilities.success) {
      // 70% 성공
      outcome = 'SUCCESS';
      newCondition = 'PRISTINE';
      isJackpot = false;
      valueChangeMultiplier = 1.0;
      message = '✨ 복원 성공! 유물이 완벽한 원형(PRISTINE)으로 되살아났습니다!';
    } else if (roll < restorationProbabilities.success + restorationProbabilities.jackpot) {
      // 10% 잭팟 (가치 2배 폭등)
      outcome = 'JACKPOT';
      newCondition = 'PRISTINE';
      isJackpot = true;
      valueChangeMultiplier = 2.0;
      message = '💎 대박 잭팟! 복원 도중 거장의 숨겨진 진품 서명이 발견되어 가치가 2배로 폭등했습니다!';
    } else {
      // 20% 파손
      outcome = 'FAILED_RUINED';
      newCondition = 'RUINED';
      isJackpot = false;
      valueChangeMultiplier = 0.2;
      message = '💥 복원 실패! 약품 반응 실수로 유물이 영구 훼손(RUINED)되어 가치가 20%로 폭락했습니다!';
    }

    currentStates[itemId] = {
      condition: newCondition,
      isJackpot
    };

    const newCash = profile.careerCash - cost;
    const vaultTotalValue = computeVaultTotalValue(profile.vaultItemIds, currentStates);
    const newNetWorth = newCash + vaultTotalValue;

    const updatedProfile: PersistentCareerProfile = {
      ...profile,
      careerCash: newCash,
      careerNetWorth: newNetWorth,
      vaultItemStates: currentStates,
      lastUpdatedTimestamp: Date.now()
    };

    saveProfileToStorage(updatedProfile);
    set({ profile: updatedProfile });

    return {
      outcome,
      previousCondition: prevCondition,
      newCondition,
      valueChangeMultiplier,
      message
    };
  },

  sellConsignmentItem: (itemId: string): { soldItem: Item; payout: number } => {
    const { profile, marketRates } = get();
    const item = MASTER_ITEMS.find((m) => m.id === itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found in catalog`);
    }

    if (!profile.vaultItemIds.includes(itemId)) {
      throw new Error(`Item ${itemId} is not in user vault`);
    }

    const itemState = profile.vaultItemStates?.[itemId];
    const condition = itemState?.condition || item.condition || 'PRISTINE';
    const isJackpot = itemState?.isJackpot || false;

    const conditionMultiplier = isJackpot ? 2.0 : (RESTORATION_CONFIG.CONDITION_VALUE_RATIOS[condition] ?? 1.0);
    const categoryMarket = marketRates.rates[item.category];
    const baseMarketRate = categoryMarket?.multiplier ?? 1.0;
    const marketRate = categoryMarket?.trend === 'DUMP'
      ? applyDumpLossCurse(baseMarketRate, getOwnedCurseCodes(profile.vaultItemIds))
      : baseMarketRate;

    // 최종 위탁 판매 수령액
    const payout = Math.round(item.realValue * conditionMultiplier * marketRate);

    // 보관함에서 제거
    const updatedVaultItemIds = profile.vaultItemIds.filter((id) => id !== itemId);
    const updatedStates = { ...(profile.vaultItemStates || {}) };
    delete updatedStates[itemId];

    const newCash = profile.careerCash + payout;
    const vaultTotalValue = computeVaultTotalValue(updatedVaultItemIds, updatedStates);
    const newNetWorth = newCash + vaultTotalValue;

    const updatedProfile: PersistentCareerProfile = {
      ...profile,
      careerCash: newCash,
      careerNetWorth: newNetWorth,
      vaultItemIds: updatedVaultItemIds,
      vaultItemStates: updatedStates,
      lastUpdatedTimestamp: Date.now()
    };

    saveProfileToStorage(updatedProfile);
    set({ profile: updatedProfile });

    return {
      soldItem: { ...item, realValue: payout },
      payout
    };
  },

  declareBankruptcy: () => {
    const { profile } = get();
    const seedCash = BANKRUPTCY_CONFIG.SEED_RECOVERY_CASH;

    const recoveredProfile: PersistentCareerProfile = {
      ...profile,
      careerCash: seedCash,
      careerNetWorth: seedCash,
      vaultItemIds: [], // 청산
      vaultItemStates: {},
      highestRoomTierUnlocked: 'BRONZE',
      isBankrupt: false,
      bankruptcyCount: (profile.bankruptcyCount || 0) + 1,
      lastUpdatedTimestamp: Date.now()
    };

    saveProfileToStorage(recoveredProfile);
    set({ profile: recoveredProfile, lastPromotedTier: null });
  },

  unlockAchievements: (achievementIds: string[]) => {
    const { profile } = get();
    const achSet = new Set(profile.unlockedAchievementIds);
    achievementIds.forEach((id) => achSet.add(id));

    const updatedProfile: PersistentCareerProfile = {
      ...profile,
      unlockedAchievementIds: Array.from(achSet),
      lastUpdatedTimestamp: Date.now()
    };

    saveProfileToStorage(updatedProfile);
    set({ profile: updatedProfile });
  },

  unlockItems: (itemIds: string[]) => {
    const { profile } = get();
    const validIds = new Set(MASTER_ITEMS.map((item) => item.id));
    const vaultSet = new Set(profile.vaultItemIds);
    const newUnlocked: string[] = [];
    itemIds.forEach((id) => {
      if (validIds.has(id) && !vaultSet.has(id)) {
        vaultSet.add(id);
        newUnlocked.push(id);
      }
    });
    if (newUnlocked.length === 0) return [];

    const updatedProfile: PersistentCareerProfile = {
      ...profile,
      vaultItemIds: [...vaultSet],
      lastUpdatedTimestamp: Date.now(),
    };
    saveProfileToStorage(updatedProfile);
    set({ profile: updatedProfile });
    return newUnlocked;
  },

  resetCareer: () => {
    const resetProfile = { ...INITIAL_CAREER_PROFILE, lastUpdatedTimestamp: Date.now() };
    saveProfileToStorage(resetProfile);
    set({ profile: resetProfile, lastPromotedTier: null });
  },

  clearPromotionNotice: () => {
    set({ lastPromotedTier: null });
  },

  getHydratedVaultItems: (): Item[] => {
    const { profile } = get();
    const vaultSet = new Set(profile.vaultItemIds);
    return MASTER_ITEMS.filter((item) => vaultSet.has(item.id)).map((item) => {
      const state = profile.vaultItemStates?.[item.id];
      const condition = state?.condition || item.condition || 'PRISTINE';
      const isJackpot = state?.isJackpot || false;
      const ratio = isJackpot ? 2.0 : (RESTORATION_CONFIG.CONDITION_VALUE_RATIOS[condition] ?? 1.0);

      return {
        ...item,
        condition,
        conditionMultiplier: ratio,
        isJackpot,
        realValue: Math.round(item.realValue * ratio)
      };
    });
  },

  getHydratedAchievements: () => {
    const { profile } = get();
    const achSet = new Set(profile.unlockedAchievementIds);
    return MASTER_ACHIEVEMENTS.map((ach) => ({
      achievement: ach,
      isUnlocked: achSet.has(ach.id)
    }));
  },

  getGatingStatus: (tier: RoomTier) => {
    const { profile } = get();
    return evaluateRoomGating(tier, profile);
  }
}));


