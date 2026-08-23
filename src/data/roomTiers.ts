import { RoomTier, RoomTierConfig } from '../types';

export const ROOM_TIERS_MASTER: Record<RoomTier, RoomTierConfig> = {
  BRONZE: {
    id: 'BRONZE',
    name: '🥉 브론즈 앤티크 벼룩시장',
    subtitle: '골동품 수집가들의 입문 경매장',
    minNetWorthRequired: 0,          // 누구나 입장 가능
    entryFee: 0,
    roundsPerGame: 5,
    botStartingCashRange: [4000, 6000],
    botAggressiveness: 0.8,
    description: '소박하지만 숨겨진 가치를 품은 초기 유물들이 출품됩니다. 기초 자금을 불리기에 적합합니다.',
    badge: '🥉'
  },
  SILVER: {
    id: 'SILVER',
    name: '🥈 실버 런던 아트 갤러리',
    subtitle: '유명 화랑과 딜러들의 살롱 경매',
    minNetWorthRequired: 15000,      // 순자산 ,000 이상
    entryFee: 1000,
    roundsPerGame: 5,
    botStartingCashRange: [15000, 25000],
    botAggressiveness: 1.0,
    description: '인상파 회화와 왕실 장신구가 거래되는 본격적인 컬렉터들의 전장입니다.',
    badge: '🥈'
  },
  GOLD: {
    id: 'GOLD',
    name: '🥇 골드 로열 소더비',
    subtitle: '국제 메이저 귀족 경매장',
    minNetWorthRequired: 60000,      // 순자산 ,000 이상
    entryFee: 5000,
    roundsPerGame: 5,
    botStartingCashRange: [60000, 100000],
    botAggressiveness: 1.2,
    description: '국보급 유물과 천문학적 가치의 보석이 쏟아져 나오는 큰손들의 하이롤러 경매입니다.',
    badge: '🥇'
  },
  DIAMOND: {
    id: 'DIAMOND',
    name: '💎 다이아몬드 비밀 클럽 (VIP)',
    subtitle: '전설의 억만장자 지하 옥션',
    minNetWorthRequired: 200000,     // 순자산 $200,000 이상
    entryFee: 20000,
    roundsPerGame: 5,
    botStartingCashRange: [200000, 400000],
    botAggressiveness: 1.5,
    description: '세계 역사를 바꾼 신화적 보물들이 단독 출품되는 최고 권위의 비밀 경매입니다.',
    badge: '💎'
  },
  BLACK_MARKET: {
    id: 'BLACK_MARKET',
    name: '🕵️‍♂️ 자정의 비밀 암시장',
    subtitle: '금기된 밀수품과 경찰 급습이 도사리는 어둠의 경매',
    minNetWorthRequired: 100000,     // 순자산 $100,000 이상 또는 블랙 VIP 티켓
    entryFee: 10000,
    roundsPerGame: 5,
    botStartingCashRange: [150000, 450000],
    botAggressiveness: 1.45,
    description: '천문학적 가치와 불길한 저주를 품은 금기 밀수품들이 암암리에 거래됩니다. 불시의 경찰 급습을 조심하십시오.',
    badge: '🕵️‍♂️'
  }
};

export const ROOM_TIER_ORDER: RoomTier[] = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND', 'BLACK_MARKET'];
