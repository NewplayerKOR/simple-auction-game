import { RoomTier, Item, MarketEvent, Player } from '../types';
import { ROOM_TIERS_MASTER } from '../data/roomTiers';
import { MASTER_BOTS } from '../data/masterBots';
import { BOT_FORGERY_REACTIONS } from '../data/constants';

export interface BotDecision {
  shouldBid: boolean;
  bidAmount: number;
  dialogue?: string;
  delayMs: number;
}

export const AiBotService = {
  /**
   * 룸 티어에 맞는 AI 봇 3인 동적 생성 및 자금/공격성 할당
   */
  spawnTierBots(tier: RoomTier): Player[] {
    const config = ROOM_TIERS_MASTER[tier];
    const [minCash, maxCash] = config.botStartingCashRange;

    return MASTER_BOTS.map((template) => {
      const startingCash = Math.floor(
        minCash + Math.random() * (maxCash - minCash)
      );

      return {
        ...template,
        cash: startingCash,
        inventory: [],
        chanceCards: [],
        hasTakenLoan: false,
        loanRepaymentAmount: 0,
        personaAggressiveness: config.botAggressiveness
      };
    });
  },

  /**
   * 잉글리시 호가 경매 봇 지능형 입찰 및 조기 포기(Fold) 판단 (DEV-306)
   */
  evaluateBid(
    bot: Player,
    currentItem: Item,
    currentHighestBid: number,
    highestBidderId: string | null,
    tier: RoomTier,
    marketEvent: MarketEvent | null
  ): BotDecision {
    // 본인이 이미 최고 입찰자이면 추가 입찰 안함
    if (highestBidderId === bot.id) {
      return { shouldBid: false, bidAmount: 0, delayMs: 0 };
    }

    const tierConfig = ROOM_TIERS_MASTER[tier];
    const estAvg = (currentItem.estimatedMin + currentItem.estimatedMax) / 2;

    // 시장 이벤트 승수 반영
    let eventMultiplier = 1.0;
    if (marketEvent && marketEvent.effectType === 'CATEGORY_MULTIPLIER' && marketEvent.targetCategory === currentItem.category) {
      eventMultiplier = marketEvent.multiplier || 1.5;
    }

    let maxWillingToPay = estAvg * eventMultiplier * tierConfig.botAggressiveness;
    let incrementStep = Math.max(100, Math.round(currentItem.startingBid * 0.2));
    let baseDelay = 1200;

    // 성향별 특화 WTP 및 조기 포기(Early Fold) 분기
    switch (bot.persona) {
      case 'WARREN': {
        // 가치투자 신중형: 철저한 안전마진 (추정 최소가 * 1.05 초과 시 즉시 Fold)
        const safetyCeiling = currentItem.estimatedMin * 1.08 * eventMultiplier;
        if (currentHighestBid >= safetyCeiling) {
          // 안전마진 소멸로 즉각 포기
          return { shouldBid: false, bidAmount: 0, delayMs: 0 };
        }

        maxWillingToPay = safetyCeiling * tierConfig.botAggressiveness;
        if (bot.favoriteCategory === currentItem.category) {
          maxWillingToPay *= 1.1;
        }
        incrementStep = Math.random() > 0.5 ? Math.round(currentItem.startingBid * 0.2) : Math.round(currentItem.startingBid * 0.3);
        baseDelay = 1400 + Math.random() * 1000;
        break;
      }

      case 'DOGE': {
        // 저돌형 하이롤러: 초반 급격한 호가 펌핑 후, 상대가 계속 따라오면 40% 확률로 기습 Fold (블러핑 트랩)
        if (currentHighestBid >= estAvg * 0.85 && Math.random() < 0.40) {
          // 비싼 값에 유저에게 떠넘기고 발 빼기
          return { shouldBid: false, bidAmount: 0, delayMs: 0 };
        }

        maxWillingToPay = estAvg * 1.35 * eventMultiplier * tierConfig.botAggressiveness;
        if (bot.favoriteCategory === currentItem.category) {
          maxWillingToPay *= 1.25;
        }
        incrementStep = Math.round(currentItem.startingBid * 0.5);
        baseDelay = 600 + Math.random() * 800; // 스나이핑 빠른 템포
        break;
      }

      case 'PICASSO': {
        // 예술 집착 컬렉터: PAINTING이 아닐 경우 60~75% 선에서 75% 확률로 쿨하게 조기 포기
        if (currentItem.category !== 'PAINTING' && !currentItem.synergyPairId) {
          if (currentHighestBid >= estAvg * 0.65 && Math.random() < 0.75) {
            return { shouldBid: false, bidAmount: 0, delayMs: 0 };
          }
          maxWillingToPay = estAvg * 0.80 * eventMultiplier * tierConfig.botAggressiveness;
          incrementStep = Math.round(currentItem.startingBid * 0.2);
          baseDelay = 1600 + Math.random() * 1000;
        } else {
          // 회화일 경우 집착적으로 추격
          maxWillingToPay = estAvg * 1.55 * eventMultiplier * tierConfig.botAggressiveness;
          incrementStep = Math.round(currentItem.startingBid * 0.4);
          baseDelay = 800 + Math.random() * 800;
        }
        break;
      }

      default:
        maxWillingToPay = estAvg * tierConfig.botAggressiveness;
        break;
    }

    // 다음 필요 최소 입찰가
    const nextBid = currentHighestBid + incrementStep;

    // 자금 한도 및 최대 지불 용의 비교
    if (bot.cash >= nextBid && nextBid <= maxWillingToPay) {
      const dialogues = bot.dialogues?.bidPlaced || ['더 올려보도록 하지.'];
      const chosenDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];

      return {
        shouldBid: true,
        bidAmount: nextBid,
        dialogue: chosenDialogue,
        delayMs: baseDelay,
      };
    }

    return { shouldBid: false, bidAmount: 0, delayMs: 0 };
  },

  /**
   * 4R 비밀 봉투 비공개 입찰가 산출
   */
  calculateSealedBid(bot: Player, currentItem: Item, tier: RoomTier): number {
    const tierConfig = ROOM_TIERS_MASTER[tier];
    const estAvg = (currentItem.estimatedMin + currentItem.estimatedMax) / 2;
    let factor = 1.0;

    if (bot.persona === 'DOGE') {
      factor = 1.20 + Math.random() * 0.25; // 120% ~ 145%
    } else if (bot.persona === 'WARREN') {
      factor = 0.82 + Math.random() * 0.15; // 82% ~ 97%
    } else if (bot.persona === 'PICASSO') {
      factor = currentItem.category === 'PAINTING' ? 1.35 : 0.80;
    }

    let bid = Math.floor((estAvg * factor * tierConfig.botAggressiveness) / 100) * 100;
    bid = Math.max(currentItem.startingBid, Math.min(bot.cash, bid));
    return bid;
  },

  /**
   * 더치 역경매 봇 WTP 계산 및 구매 선착순 판정
   */
  evaluateDutchBots(
    currentPrice: number,
    item: Item,
    bots: Player[],
    tier: RoomTier,
    onBotClaim: (botId: string, price: number) => void,
    latencyMultiplier = 1
  ) {
    const tierConfig = ROOM_TIERS_MASTER[tier];

    for (const bot of bots) {
      // 1. 공개된 감정 범위의 중간값만 사용 (realValue/isFake 금지)
      const errorRate = (Math.random() - 0.5) * (tier === 'DIAMOND' ? 0.06 : 0.16);
      const publicEstimatedValue = (item.estimatedMin + item.estimatedMax) / 2;
      const estimatedValue = publicEstimatedValue * (1 + errorRate);

      // 2. 페르소나별 목표 마진
      let targetMargin = 0.8;
      if (bot.persona === 'WARREN') {
        targetMargin = 0.68 + Math.random() * 0.08; // 68% ~ 76% (가치투자 할인율)
      } else if (bot.persona === 'DOGE') {
        targetMargin = 0.92 + Math.random() * 0.18; // 92% ~ 110% (충동 선점)
      } else if (bot.persona === 'PICASSO') {
        targetMargin = (item.category === 'PAINTING' || bot.favoriteCategory === item.category)
          ? 0.95 + Math.random() * 0.10
          : 0.78 + Math.random() * 0.08;
      }

      // 3. 최종 WTP 산출
      const rawWTP = estimatedValue * targetMargin * tierConfig.botAggressiveness;
      const finalWTP = Math.min(rawWTP, bot.cash);

      // 가격이 WTP 이하로 떨어졌고 잔액이 충분한 경우
      if (currentPrice <= finalWTP && bot.cash >= currentPrice) {
        // 인간형 반응 지연 (200ms ~ 700ms)
        const latencyMs = Math.floor((Math.floor(Math.random() * 500) + 200) * latencyMultiplier);
        setTimeout(() => {
          onBotClaim(bot.id, currentPrice);
        }, latencyMs);
        break; // 최초 충족 봇 1인 예약
      }
    }
  },

  /**
   * 상황별 리액션 대사 추출 (DEV-307: 위작 피격 리액션 대사 매핑)
   */
  getReactionDialogue(
    bot: Player,
    event: 'ROUND_START' | 'WON' | 'LOST' | 'PASSED' | 'FORGERY'
  ): string {
    if (event === 'FORGERY') {
      const personaKey = bot.persona || 'DOGE';
      const reactionList = BOT_FORGERY_REACTIONS[personaKey] || BOT_FORGERY_REACTIONS.DOGE;
      return reactionList[Math.floor(Math.random() * reactionList.length)];
    }

    const d = bot.dialogues;
    if (!d) return '...';

    let list: string[] | undefined;
    switch (event) {
      case 'ROUND_START': list = d.roundStart; break;
      case 'WON': list = d.itemWon; break;
      case 'LOST': list = d.itemLost; break;
      case 'PASSED': list = d.itemPassed; break;
    }

    if (!list || list.length === 0) return '...';
    return list[Math.floor(Math.random() * list.length)];
  }
};

