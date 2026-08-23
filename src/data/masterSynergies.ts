import { SynergySet } from '../types';

export const MASTER_SYNERGIES: SynergySet[] = [
  {
    id: 'syn_masterpiece',
    name: '르네상스 & 인상주의 거장전',
    requiredItemIds: ['item_sv_04', 'item_gd_03'],
    bonusMultiplier: 0.35, // +35% 가치 가산
    description: '별이 빛나는 밤 모작과 모나리자의 비밀 스케치를 함께 소장하여 역사적 미술관 완성 (+35% 보너스)'
  },
  {
    id: 'syn_pharaoh',
    name: '파라오의 영원한 무덤',
    requiredItemIds: ['item_sv_02', 'item_gd_02'],
    bonusMultiplier: 0.30, // +30% 가치 가산
    description: '이집트 풍뎅이 황금 부적과 파라오의 순금 데스 마스크를 한자리에 모아 고대 제국의 신비를 복원 (+30% 보너스)'
  },
  {
    id: 'syn_royal',
    name: '대영제국 대관식 세트',
    requiredItemIds: ['item_gd_05', 'item_gd_06'],
    bonusMultiplier: 0.40, // +40% 가치 가산
    description: '블루 사파이어 로열 티아라와 영국 국왕의 다이아몬드 지팡이를 조합하여 황실의 절대 권위를 완성 (+40% 보너스)'
  }
];


