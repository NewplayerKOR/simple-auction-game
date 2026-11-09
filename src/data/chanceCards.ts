import { assetUrl } from '../services/assetService';
import { ChanceCard, ChanceCardType } from '../types';

export const CHANCE_CARDS_MASTER: Record<ChanceCardType, Omit<ChanceCard, 'isUsed'>> = {
  MAGNIFIER: {
    id: 'card_magnifier',
    type: 'MAGNIFIER',
    name: '정밀 감정 돋보기',
    description: '이번 라운드 출품작의 감정 범위를 80% 압축하고 위작 여부를 즉시 100% 감정합니다.',
    icon: '🔍',
    imageUrl: assetUrl('/assets/images/cards/card_magnifier.webp')
  },
  SPEED_HAMMER: {
    id: 'card_speed_hammer',
    type: 'SPEED_HAMMER',
    name: '스피드 해머',
    description: '사용 후 본인 입찰 시 타이머를 2초로 강제 단축해 봇의 추가 응찰을 저지합니다.',
    icon: '⚡',
    imageUrl: assetUrl('/assets/images/cards/card_speed_hammer.webp')
  },
  INSURANCE: {
    id: 'card_insurance',
    type: 'INSURANCE',
    name: '낙찰 안심 보험',
    description: '낙찰 물품이 손실(낙찰가 > 실제가치)이거나 위작($0)일 경우 손실액을 100% 환급받습니다.',
    icon: '🛡️',
    imageUrl: assetUrl('/assets/images/cards/card_insurance.webp')
  }
};

/**
 * 게임 시작 시 3종 카드 중 무작위 2종을 지급하는 유틸리티
 */
export const generateRandomChanceCards = (): ChanceCard[] => {
  const allCards = Object.values(CHANCE_CARDS_MASTER);
  const shuffled = [...allCards].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2).map((card, idx) => ({
    ...card,
    id: `${card.id}_${Date.now()}_${idx}`,
    isUsed: false
  }));
};
