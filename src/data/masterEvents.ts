import { MarketEvent } from '../types';

export const MASTER_EVENTS: MarketEvent[] = [
  {
    id: 'event_art_boom',
    round: 3,
    title: '📰 속보: 글로벌 명화 경매 열풍 급등',
    headline: '세계적인 거장들의 회화 작품 수요 폭발!',
    description: '이번 게임에서 모든 명화(PAINTING) 작품의 최종 환산 가치가 1.5배(50% 상승) 증가합니다.',
    imageUrl: '/assets/images/events/event_art_boom.webp',
    effectType: 'CATEGORY_MULTIPLIER',
    targetCategory: 'PAINTING',
    multiplier: 1.5
  },
  {
    id: 'event_antique_fever',
    round: 3,
    title: '📰 속보: 고대 문명 유물 특별 재평가',
    headline: '대영 박물관의 고고학적 재발견 발표!',
    description: '이번 게임에서 모든 고미술(ANTIQUE) 유물의 최종 환산 가치가 1.5배(50% 상승) 증가합니다.',
    imageUrl: '/assets/images/events/event_antique_fever.webp',
    effectType: 'CATEGORY_MULTIPLIER',
    targetCategory: 'ANTIQUE',
    multiplier: 1.5
  },
  {
    id: 'event_sponsor_grant',
    round: 5,
    title: '📰 속보: 소더비 익명 재벌의 파격 후원금',
    headline: '결승전을 앞두고 전원에게 긴급 보조금 지급!',
    description: '모든 참가자(유저 및 AI 봇)에게 현금 $1,500가 즉시 지급됩니다.',
    imageUrl: '/assets/images/events/event_sponsor_grant.webp',
    effectType: 'CASH_GRANT',
    cashAmount: 1500
  },
  {
    id: 'event_jewelry_boom',
    round: 5,
    title: '📰 속보: 왕실 보석 자산 가치 폭등',
    headline: '희귀 다이아몬드 & 사파이어 시세 역대 최고가 경신!',
    description: '이번 게임에서 모든 보석(JEWELRY) 자산의 최종 환산 가치가 1.5배(50% 상승) 증가합니다.',
    imageUrl: '/assets/images/events/event_jewelry_boom.webp',
    effectType: 'CATEGORY_MULTIPLIER',
    targetCategory: 'JEWELRY',
    multiplier: 1.5
  }
];
