# 시스템 아키텍처 — 현재 계약

> **상태:** ACTIVE  
> **기술 소유:** DEV  
> **제품 정책 승인:** PM  
> **기준일:** 2026-11-08  
> **적용 버전:** v2.3.1  
> **상세 원문:** [`../root/archive/v2.3.1/STAB-001.md`](../root/archive/v2.3.1/STAB-001.md)

## 1. 목적

이 문서는 현재 구현된 시스템의 모듈 경계, 상태 전이, 정산·저장 불변식을 요약한다. 구현 세부와 과거 설계 이력은 `STAB-001` 원문과 Git 이력을 따른다. 제품 요구사항은 [`PRD.md`](./PRD.md), 현재 검증 상태는 [`PROJECT_STATE.md`](./PROJECT_STATE.md)를 따른다.

## 2. 모듈 경계

```text
UI
 ├─ Auction commands ─> Auction FSM / round timers
 └─ Career queries  ──> Career domain

Auction FSM
 └─ one CareerSettlementCommand ─> Career settlement service

Career settlement service (single writer)
 ├─ economy / vault / achievement / ticket / statistics reducers
 └─ one JSON replacement ─> SIMPLE_AUCTION_CAREER_V2

Codex / Result UI
 └─ read-only projection of committed career profile
```

- UI 컴포넌트는 커리어 LocalStorage를 직접 쓰지 않는다.
- 경매 스토어는 라운드 휘발 상태를 소유하고, 종료 결과를 커리어 정산 서비스에 한 번 전달한다.
- 커리어 정산 서비스는 자금·보관함·업적·티켓·통계를 하나의 순수 계산 결과로 만든 뒤 한 번 저장한다.
- 도감·결과 화면은 저장된 커리어 프로필을 읽기 전용으로 투영한다.

## 3. 런타임 책임

| 모듈 | 책임 | 하지 않는 일 |
| :--- | :--- | :--- |
| UI 컴포넌트 | 명령 전달, 상태 표시, 모달 포커스·복귀 | LocalStorage 직접 쓰기, 정산 재계산 |
| `useAuctionStore` | 라운드 FSM, 타이머, 입찰·낙찰·유찰 상태 | 커리어 프로필 직접 저장 |
| `useCareerStore` | 커리어 프로필 조회, 정산 명령 진입점 | 경매 라운드 상태 소유 |
| `StorageService` | 단일 커리어 저장 키 읽기·쓰기, 마이그레이션 | UI 상태·타이머 관리 |
| `aiBotService` | 공개 정보 기반 봇 입찰·구매 판단 | `realValue`, `isFake` 직접 참조 |
| `contrabandService` | `curseCode`별 효과 계산 | 표시 문자열 파싱 |

## 4. 식별자와 멱등성

- `sessionId`: 룸 입장 1회당 하나. 입장료·티켓 차감과 함께 저장한다.
- `roundId`: 세션 내 각 라운드당 하나. 이전 라운드의 지연 콜백을 차단한다.
- `roundResolutionId`: 비밀경매·더치·경찰 결과를 정확히 한 번 확정한다.
- `raidId`: 경찰 급습 1회당 하나. 탈출·뇌물·체포 중 첫 유효 명령만 결과를 확정한다.
- 모든 타이머·지연 콜백은 캡처한 `sessionId`·`roundId`·`roundResolutionId`·`raidId`와 현재 값을 다시 비교한다.
- 모달 닫기, 로비 복귀, 컴포넌트 언마운트, 경찰 급습, 라운드 종료는 해당 모듈이 소유한 타이머를 정리한다.
- 같은 명령의 재호출은 `ALREADY_APPLIED`, 다른 세션의 오래된 명령은 `STALE_SESSION`으로 거부한다.

## 5. 경매 계약

### 5.1 잉글리시 호가

- 현재 최고가보다 높은 입찰만 허용한다.
- 잔액보다 높은 입찰을 거부한다.
- 종료 직전 입찰은 앤티 스나이핑 규칙으로 시간을 연장한다.
- 최고 입찰자가 없으면 유찰한다.
- 라운드 종료 결과는 `roundResolutionId`당 한 번만 정산한다.

### 5.2 4R 비밀 봉투

```text
SEALED_BID_ACTIVE
  -- submit(amount) | timeout --> SEALED_BID_FINALIZING
SEALED_BID_FINALIZING
  -- submissions frozen ------> SEALED_BID_REVEALED
SEALED_BID_REVEALED
  -- close reveal ------------> ROUND_SETTLING
ROUND_SETTLING
  -- settlement committed ----> ROUND_REVEAL / NEXT_ROUND_CHECK
```

- 제한시간은 15초다.
- 미입력·0·음수·잔액 초과·비정상 숫자는 `0(FOLD)`으로 정규화한다.
- 플레이어 제출 1개와 봇 제출 3개를 `FINALIZING`에서 한 번 생성하고 동결한다.
- 공개 모달은 동결된 스냅샷만 읽는다. 공개 중 타이머 틱·재제출·봇 재생성·결과 재정렬을 무시한다.
- 모달 닫기는 `roundResolutionId`당 한 번만 라운드 정산을 호출한다.

### 5.3 더치 역경매

- 가격은 시작가에서 바닥가까지 시간 기반으로 하락한다. 기본 틱은 500ms다.
- 구매자·잔액·현재 상태를 검증한 뒤에만 클레임 락을 비교 후 교체한다.
- 실패한 구매 시도는 틱 엔진을 멈추지 않는다.
- 락 성공자는 가격·구매자·`roundResolutionId`를 동결하고 틱과 예약 콜백을 중지한다.
- 바닥가에 처음 도달하면 바닥가를 한 번 게시하고 `500ms` 최종 구매 창을 연다. 유효 클레임이 없을 때만 유찰한다.
- AI의 인지 가치는 `(estimatedMin + estimatedMax) / 2`, 룸별 오차, 페르소나, 공개 시장 이벤트만 사용한다. `realValue`, `isFake`, 비공개 정보는 사용하지 않는다.

### 5.4 경찰 급습

```text
IDLE -> RAIDED -> RESOLVING -> ESCAPED | BRIBED_AND_WON | ARRESTED
```

- 암시장 라운드에서 기본 15% 확률로 발생한다.
- 플레이어는 5초 안에 탈출 또는 뇌물을 선택한다.
- 뇌물 총비용은 `$5,000 + currentItem.startingBid`다. 잔액이 총비용과 정확히 같으면 허용한다.
- 탈출은 현재 라운드의 미확정 입찰·아이템을 폐기하고, 급습 이전 확정 거래만 부분 정산한다.
- 체포는 세션 현금을 0으로 저장하고, 이번 세션 획득 아이템을 폐기한다. 기존 영구 보관함·업적은 유지한다.
- 결과 저장이 성공하기 전에는 로비로 이동하지 않는다.

## 6. 커리어 정산

### 6.1 정산 순서

1. 입장 직전 `careerCash_before`를 읽는다.
2. `sessionCash_start = careerCash_before - entryFee`를 계산하고 프로필에 같은 값을 저장한다.
3. 경매 세션은 `sessionCash_start`를 시작 현금으로 사용한다.
4. 정상 종료 시 `endingCash = player.cash - loanRepayment`를 계산한 뒤 종료 시 발동하는 저주를 한 번 반영한다.
5. `careerCash_after = endingCash_after_debuff`로 교체한다. 기존 `careerCash`와 더하지 않는다.
6. 진품 아이템과 상태를 보관함에 합친 뒤 `careerNetWorth_after = careerCash_after + vaultTotalValue_after`로 재계산한다.
7. 파산·룸 게이팅·승급 판정은 같은 `careerCash_after`와 `careerNetWorth_after`만 사용한다.

### 6.2 결과별 커밋

| 결과 | 현금 | 이번 세션 아이템 | 게임 수·승리 | 티켓·정상 완주 |
| :--- | :--- | :--- | :--- | :--- |
| `NORMAL` | 최종 세션 잔액으로 교체 | 진품만 커밋 | 게임 수 +1, 1위면 승리 +1 | 티켓 규칙 적용 |
| `ESCAPED` | 탈출 직전 확정 잔액으로 교체 | 급습 전 확정 아이템만 커밋 | 게임 수 +1, 승리 +0 | 지급 없음 |
| `ARRESTED` | 0으로 교체 | 이번 세션 아이템 전부 폐기 | 게임 수 +1, 승리 +0 | 지급 없음 |
| `ABANDONED` | 마지막 저장된 입장 후 커리어 현금 유지 | 커밋 없음 | 증가 없음 | 지급 없음 |

### 6.3 티켓

- `NORMAL`에서 골드·다이아몬드 룸을 정상 완주하면 순위와 관계없이 티켓 1장을 지급한다.
- `ach-blind-master` 최초 해금 시 티켓 1장을 지급한다. 같은 정산에서 룸 완주 조건도 만족하면 두 출처가 독립적이므로 총 2장이다.
- 브론즈·실버·암시장, `ESCAPED`, `ARRESTED`, `ABANDONED`에는 룸 완주 티켓이 없다.
- 순자산 $100,000 미만에서 티켓으로 암시장에 입장하면 입장료와 티켓 1장을 같은 저장에서 차감한다.

## 7. 저장 계약

- 저장 키: `SIMPLE_AUCTION_CAREER_V2`
- 저장 버전: `2.3.1`
- `activeSession`: 최대 하나. 활성 세션이 있으면 새 룸 입장을 거부한다.
- `lastSettlementReceipt`: 마지막 정산의 `sessionId`, 결과, 종료 현금·순자산, 적용 시각을 보관한다.
- `careerNetWorth`는 `careerCash + 보관함 평가액`이다.
- `vaultItemIds`는 유효한 마스터 ID의 중복 없는 목록이다.
- `blackVipTicketCount`와 통계 카운터는 0 이상의 정수다.
- LocalStorage 한 키의 JSON 교체를 현재 런타임의 원자적 저장 경계로 사용한다. 실제 DB 트랜잭션 또는 서버 원장으로 표현하지 않는다.
- v2.3.0 데이터는 현금·순자산·보관함·업적·티켓·통계를 보존하며 v2.3.1로 승격한다. 손상된 필수 필드는 안전 초기 상태로 복구하고 진단 로그를 남긴다.

## 8. 대체된 과거 계약

| 과거 계약 | 현재 계약 |
| :--- | :--- |
| 더치 검증 전 `lock()` | 구매자·잔액·상태 검증 후 락 |
| `item.realValue` 기반 AI WTP | 공개 감정 범위 중간값 기반 WTP |
| 바닥가 즉시 유찰 | 바닥가 게시 후 500ms 최종 구매 창 |
| 4단계 룸 | 암시장 포함 5단계 룸 |
| 전체 24종 | 일반 24종 + 암시장 6종 = 30종 |
| `careerCash += finalCash` | `careerCash = finalizedSessionCash` |
| LocalStorage 2.0.0 | LocalStorage 2.3.1 + `activeSession` + 정산 영수증 |

## 9. 실패 처리

- LocalStorage 저장 실패를 성공으로 간주하지 않는다. UI는 결과 전이를 보류하고 같은 식별자로 재시도할 수 있어야 한다.
- 손상 데이터는 안전 초기화하되 진단 로그를 남긴다. 마이그레이션 가능한 v2.3.0 데이터는 초기화하지 않고 v2.3.1로 승격한다.
- 저장 실패 강제 주입과 손상 데이터 전체 조합은 아직 독립 검증 범위가 아니다. 현재 상태는 `PROJECT_STATE.md`를 따른다.

## 10. Phase 3 서버 권위 경계

Phase 3 실시간 멀티플레이는 다음 계약이 승인되기 전 구현하지 않는다.

- 서버 권위형 FSM과 입찰·자금 원장
- 서버 시계와 중복 입찰 방지
- 재접속·재동기화 계약
- 결정론적 이벤트 로그 또는 재현 가능한 RNG 정책
- 다중 탭·다중 클라이언트 동시성

현재 LocalStorage 기반 구조를 서버 권위 구조로 표현하지 않는다. 관련 사전 작업은 `ARCH-PVP-001`이며 `REL-001` 승인 전 착수하지 않는다.
