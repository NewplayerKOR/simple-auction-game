# 🗄 데이터 모델 및 마스터 데이터 정의서 (Data Schema)

> **문서 버전:** v2.3.1 (Stabilization Target)  
> **상태:** APPROVED_FOR_IMPLEMENTATION  
> **소유 역할:** ARCH_DATA  
> **분류:** `domain-data`  
> **작성자:** DB/Data Lead & PM  
> **마이그레이션 이력:** 📜 [SCHEMA_MIGRATIONS.md](./SCHEMA_MIGRATIONS.md) 참조  
> **최종 상태 검토일:** 2026-08-21  

---

> [!CAUTION]
> 이 문서는 목표 도메인 모델을 설명하며 현재 TypeScript 구현과 일부 필드가 다를 수 있다. 실제 구현 완료 여부는 코드와 테스트로 확인하고, 불일치는 `STAB-001` 또는 별도 TASK로 해소한다. 현재 마스터 아이템 권위 수량은 `DEC-005`에 따라 총 30종이다.

## 1. 도메인 모델 인터페이스 (v2.3.0)

```typescript
export type ItemCategory = 'PAINTING' | 'ANTIQUE' | 'JEWELRY';
export type RoomTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' | 'BLACK_MARKET';
export type AuctionMode = 'ENGLISH' | 'DUTCH';
export type BotPersonality = 'WARREN' | 'DOGE' | 'PICASSO';
export type ItemCondition = 'PRISTINE' | 'DUSTY' | 'DAMAGED' | 'RUINED';

export interface Item {
  id: string;
  tier: RoomTier;
  name: string;
  category: ItemCategory;
  condition: ItemCondition;
  conditionMultiplier: number;
  estimatedMin: number;
  estimatedMax: number;
  realValue: number;
  startingBid: number;
  dutchStartPrice: number;
  dutchFloorPrice: number;
  dutchDropRatePerSec: number;
  description: string;
  imageUrl: string;
  synergyPairId?: string;
  isFake?: boolean;
  isAppraised?: boolean;
  appraisalCost: number;
  restorationCost: number;
  isContraband?: boolean;      // [신규] 암시장 밀수품 여부
  curseDebuff?: string;        // [신규] 금기된 유물의 디버프 (예: "매 게임 종료 시 관리비 -$1,500")
}

export interface PoliceRaidState {
  isActive: boolean;
  timeLeftToEscape: number;    // 탈출 제한시간 (5초)
  bribeCost: number;           // 경찰 매수 뇌물 비용 ($5,000)
  status: 'IDLE' | 'RAIDED' | 'ESCAPED' | 'BRIBED_AND_WON' | 'ARRESTED';
}

export interface PersistentCareerProfile {
  storageVersion: string;          // "2.3.0"
  careerCash: number;              // 현재 보유 현금 ($)
  careerNetWorth: number;          // 총 순자산
  vaultItemIds: string[];          // 소장 유물 ID 목록
  unlockedAchievementIds: string[];
  highestRoomTierUnlocked: RoomTier;
  blackVipTicketCount: number;     // [신규] 자정의 암시장 입장 티켓 보유량
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses?: number;              // 과거 문서 호환 필드. 현재 통계 권위에는 필수 아님
  isBankrupt: boolean;
  bankruptcyCount: number;
  lastUpdatedTimestamp: number;
}
```

---

## 2. 🕵️‍♂️ 자정의 비밀 암시장(BLACK_MARKET) 전용 밀수품 6종 데이터셋

| ID | 아이템명 | 카테고리 | 감정 범위 | 실제 가치 | 페널티 디버프 (저주) |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `item_bm_01` | 저주받은 투탕카멘의 단검 | ANTIQUE | $80,000 ~ $180,000 | **$250,000** | 매 게임 종료 시 불길한 기운으로 현금 -$1,000 소모 |
| `item_bm_02` | 도굴된 아즈텍 해골 가면 | ANTIQUE | $100,000 ~ $220,000 | **$310,000** | 봇들의 적대감 증가 (더치 역경매에서 봇 반응속도 빨라짐) |
| `item_bm_03` | 루브르 도난 명화 '도난당한 성모' | PAINTING | $150,000 ~ $350,000 | **$450,000** | 경찰 급습 확률 2배 증가 (30%) |
| `item_bm_04` | 나치 비밀 벙커의 황금 액자 | PAINTING | $120,000 ~ $280,000 | **$380,000** | 카테고리 시세 폭락 시 가치 감소폭 1.5배 |
| `item_bm_05` | 피의 다이아몬드 '블러드 오르로프' | JEWELRY | $200,000 ~ $450,000 | **$600,000** | 긴급 대출 이자율이 20% ➔ 30%로 증가 |
| `item_bm_06` | 암살자의 독약 반지 | JEWELRY | $140,000 ~ $300,000 | **$420,000** | 복원 공방 실패 확률 10% 증가 |

---

## 3. 🚨 4R 비밀 봉투 경매 타임아웃 안전 룰 (No Freeze Guarantee)

- **타임아웃(15초 만료) 시 불변 규칙:**
  - 유저의 입찰 금액이 없거나(미입력) 잔고 부족으로 제출하지 못한 경우 ➔ `humanBid = 0 (자동 포기)`으로 즉시 확정.
  - 무한 로딩 없이 즉시 봇 3인의 입찰가를 화면에 100% 공개하고, 봇 중 최고 입찰자에게 낙찰 또는 전원 0원 시 유찰 처리로 즉시 전이.

---

## 4. v2.3.1 안정화 목표 스키마

> 이 절은 `STAB-001` WP-01~06의 구현 목표다. 현재 코드에 필드가 있다는 뜻이 아니다.

### 4.1 커리어 세션과 정산 영수증

```typescript
export type CareerSessionOutcome = 'NORMAL' | 'ESCAPED' | 'ARRESTED' | 'ABANDONED';

export interface ActiveCareerSession {
  sessionId: string;
  tier: RoomTier;
  entryFee: number;
  sessionCashStart: number;
  ticketConsumed: 0 | 1;
  status: 'ACTIVE';
}

export interface CareerSettlementReceipt {
  sessionId: string;
  outcome: CareerSessionOutcome;
  careerCashAfter: number;
  careerNetWorthAfter: number;
  appliedAt: number;
}

export interface PersistentCareerProfileV231 extends Omit<PersistentCareerProfile, 'storageVersion'> {
  storageVersion: '2.3.1';
  activeSession?: ActiveCareerSession;
  lastSettlementReceipt?: CareerSettlementReceipt;
}
```

#### 불변식

- `activeSession`은 최대 하나다. 활성 세션이 있으면 새 룸 입장을 거부한다.
- 입장료·티켓 차감과 `activeSession` 생성은 같은 프로필 저장에 포함한다.
- 정산 성공 시 `activeSession`은 제거되고 같은 `sessionId`의 영수증이 생성된다.
- `careerNetWorth = careerCash + hydrate(vaultItemIds, vaultItemStates)의 평가액`이다.
- `vaultItemIds`는 유효한 마스터 ID의 중복 없는 목록이다.
- `blackVipTicketCount`, 통계 카운터는 0 이상의 정수다.

### 4.2 라운드 해석 상태

```typescript
export type SealedBidPhase =
  | 'ACTIVE'
  | 'FINALIZING'
  | 'REVEALED'
  | 'SETTLING'
  | 'SETTLED';

export interface SealedBidResolution {
  roundResolutionId: string;
  phase: SealedBidPhase;
  submissions: SealedBidSubmission[];
  participantOrder: string[];
}

export type DutchClaimStatus = 'OPEN' | 'CLAIMED' | 'FLOOR_HOLD' | 'PASSED';

export interface DutchAuctionStateV231 extends DutchAuctionState {
  sessionId: string;
  roundId: string;
  roundResolutionId?: string;
  claimStatus: DutchClaimStatus;
  floorHoldUntil?: number;
}
```

- `submissions`는 `FINALIZING`에서 한 번 생성된 뒤 변경하지 않는다.
- 더치 `CLAIMED`와 `PASSED`는 동일 라운드에서 동시에 성립할 수 없다.

### 4.3 경찰 급습 상태

```typescript
export interface PoliceRaidStateV231 {
  raidId: string | null;
  isActive: boolean;
  timeLeft: number;
  bribeFee: 5000;
  itemPrice: number;
  totalCost: number;
  status: 'IDLE' | 'RAIDED' | 'RESOLVING' | 'ESCAPED' | 'BRIBED_AND_WON' | 'ARRESTED';
}
```

- `totalCost = bribeFee + itemPrice`, `itemPrice = currentItem.startingBid`다.
- `RAIDED`에서 하나의 결과만 `RESOLVING`으로 전이할 수 있다.
- 체포 정산은 현금 0과 기존 보관함 기반 순자산을 같은 저장에 기록한다.

### 4.4 밀수품 실행 코드

```typescript
export type ContrabandCurseCode =
  | 'END_GAME_CASH_FEE'
  | 'DUTCH_BOT_LATENCY_20'
  | 'POLICE_RAID_CHANCE_30'
  | 'DUMP_LOSS_X1_5'
  | 'LOAN_INTEREST_30'
  | 'RESTORE_FAIL_PLUS_10P';

export interface ContrabandItem extends Item {
  isContraband: true;
  curseCode: ContrabandCurseCode;
  curseDebuff: string; // 표시 전용. 실행 로직은 curseCode를 사용한다.
}
```

| 아이템 ID | `curseCode` |
| :--- | :--- |
| `item_bm_01` | `END_GAME_CASH_FEE` |
| `item_bm_02` | `DUTCH_BOT_LATENCY_20` |
| `item_bm_03` | `POLICE_RAID_CHANCE_30` |
| `item_bm_04` | `DUMP_LOSS_X1_5` |
| `item_bm_05` | `LOAN_INTEREST_30` |
| `item_bm_06` | `RESTORE_FAIL_PLUS_10P` |

### 4.5 데이터 유효성

- `MASTER_ITEMS`는 총 30개이며 룸별 6개, ID 중복 0이어야 한다.
- 암시장 6개는 `isContraband: true`, 유일한 `curseCode`, 비어 있지 않은 `curseDebuff`를 가져야 한다.
- 저장 로더는 v2.3.0의 누락 선택 필드에 안전 기본값을 채우고 v2.3.1로 저장한다.
- 알 수 없는 아이템·업적 ID는 하이드레이션에서 무시하되 원본 손상 진단을 남긴다.
