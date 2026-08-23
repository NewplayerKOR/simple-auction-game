export const CURRENT_STORAGE_VERSION = '2.3.1';

export const BLACK_MARKET_CONFIG = {
  BRIBE_COST: 5000,           // 경찰 서장 매수 뇌물액 ($5,000)
  RAID_CHANCE: 0.15,          // 암시장 기본 경찰 급습 확률 (15%)
  ESCAPE_TIME: 5,             // 급습 시 탈출 제한시간 (5초)
  MIN_NET_WORTH: 100000,      // 암시장 입장 최소 순자산 ($100,000)
  ENTRY_FEE: 10000,           // 암시장 입장료 ($10,000)
};

export const BANKRUPTCY_CONFIG = {
  CASH_THRESHOLD: 500,        // 가용 현금 < $500
  NET_WORTH_THRESHOLD: 1000,   // 순자산 < $1,000
  SEED_RECOVERY_CASH: 5000,    // 파산 구제 시 재지급 자본금 ($5,000)
};

export const RESTORATION_CONFIG = {
  CONDITION_VALUE_RATIOS: {
    PRISTINE: 1.0,  // 완벽 보존 (100%)
    DUSTY: 0.8,     // 세척 필요 (80%)
    DAMAGED: 0.5,   // 전문 복원 필요 (50%)
    RUINED: 0.2     // 복원 실패 영구 훼손 (20%)
  },
  OUTCOME_PROBABILITIES: {
    SUCCESS: 0.70,        // 70% 확률: PRISTINE(100%) 복구 성공
    JACKPOT: 0.10,        // 10% 확률: 숨겨진 서명/보석 발견 (가치 2배 잭팟!)
    FAILED_RUINED: 0.20   // 20% 확률: 복원 실패 유물 파손 (RUINED 20% 전락)
  }
};

export const BOT_FORGERY_REACTIONS: Record<string, string[]> = {
  DOGE: [
    '아아악!! 가짜라고?! 내 쌩돈 다 날아갔잖아!! 사기꾼들아!! 🤬',
    '이거 완전 러그풀(Rug-pull)이잖아!! 내 돈 돌려내!! 💀',
    '한강 물 온도 몇 도냐?! 인생 한 방에 골로 갔네!! 💥'
  ],
  WARREN: [
    '허허... 원칙을 벗어난 탐욕의 대가가 이리도 쓰라릴 줄이야... 👴💧',
    '철저한 실사 없는 투자는 투기가 됨을 뼈저리게 반성하네...',
    '내 투자 인생 최악의 오점이군. 시장의 쓴맛을 보았어.'
  ],
  PICASSO: [
    '아아아악! 이따위 조잡한 모작에 내 영혼과 전 재산을 바치다니!! 🎨💔',
    '위작이라니!! 예술의 신이시여 저를 버리시나이까?! (오열)',
    '이 가증스러운 캔버스를 당장 내 눈앞에서 찢어버려라!! 😭'
  ]
};

export const LOAN_CONFIG = {
  AMOUNT: 3000,          // 대출 원금 ($3,000)
  INTEREST_RATE: 0.20,   // 이자율 20%
  TOTAL_REPAY: 3600,     // 최종 정산 차감액 ($3,600)
  MAX_LOANS_PER_GAME: 1  // 게임당 1회 한정
};

export const APPRAISAL_CONFIG = {
  COST: 500,             // 감정사 의뢰 비용 ($500)
  FORGERY_RATE: 0.18     // 위작 출품 기본 확률 (18%)
};

export const TIMER_CONFIG = {
  ENGLISH_AUCTION_DURATION: 10,  // 1, 2, 3, 5R 기본 타이머 10초
  ANTI_SNIPING_RESET: 5,         // 마감 3초 미만 입찰 시 5초로 재설정
  ANTI_SNIPING_TRIGGER_TIME: 3,  // 앤티 스나이핑 트리거 기준 초
  SEALED_BID_DURATION: 15,       // 4R 비밀 봉투 입력 제한시간 15초
  SPEED_HAMMER_DURATION: 2,      // 스피드 해머 발동 시 잔여 시간
};

export const BID_INCREMENT_OPTIONS = [100, 500, 1000, 3000];


