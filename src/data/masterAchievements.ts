import { Achievement } from '../types';

export const MASTER_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-win',
    title: '경매장의 신예',
    badge: '🎖️',
    badgeImageUrl: '/assets/images/achievements/badge_ach_first_win.webp',
    description: '경매 게임에서 첫 1위를 달성하세요.'
  },
  {
    id: 'ach-forgery-hunter',
    title: '베테랑 감정사',
    badge: '🕵️‍♂️',
    badgeImageUrl: '/assets/images/achievements/badge_ach_forgery_hunter.webp',
    description: '위작(가짜) 아이템을 피해 진품만을 낙찰받아 승리하세요.'
  },
  {
    id: 'ach-blind-master',
    title: '심리전의 제왕',
    badge: '🤫',
    badgeImageUrl: '/assets/images/achievements/badge_ach_blind_master.webp',
    description: '4라운드 비밀 봉투 경매에서 봇들과 $100 이하의 아슬아슬한 차이로 낙찰받으세요.'
  },
  {
    id: 'ach-leverage-king',
    title: '레버리지의 귀재',
    badge: '🏦',
    badgeImageUrl: '/assets/images/achievements/badge_ach_leverage_king.webp',
    description: 'VIP 긴급 대출($3,000)을 받고 이자를 갚은 상태에서 최종 1위를 차지하세요.'
  },
  {
    id: 'ach-museum-complete',
    title: '소더비 마스터 컬렉터',
    badge: '🏛️',
    badgeImageUrl: '/assets/images/achievements/badge_ach_museum_complete.webp',
    description: '영구 도감에서 12종의 모든 역사적 아이템을 최소 1회 이상 수집하세요.'
  },
  {
    id: 'ach-iron-vault',
    title: '철벽의 자산가',
    badge: '🛡️',
    badgeImageUrl: '/assets/images/achievements/badge_ach_iron_vault.webp',
    description: '단 한 푼의 손실도 없이 순자산 $25,000 이상을 기록하세요.'
  }
];
