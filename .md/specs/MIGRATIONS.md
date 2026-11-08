# 📜 데이터베이스 스키마 및 마스터 데이터 마이그레이션 이력 (Schema Migrations)

> **관리 원칙:** Flyway-style 문서 버전 로그  
> **상태:** DOCUMENTATION_ONLY (실제 DB 없음)  
> **기술 소유:** DEV  
> **최종 상태 검토일:** 2026-11-08  
> **관련 문서:** [DATA_SCHEMA.md](./DATA_SCHEMA.md)  

---

> [!IMPORTANT]
> 이 프로젝트에는 현재 실제 DB나 실행 가능한 Flyway 마이그레이션이 없다. 아래 `Documented`는 TypeScript·LocalStorage 도메인 변경을 문서에 기록했다는 의미이며 런타임 DB 적용 증거가 아니다.

## 📊 마이그레이션 요약 표 (Migration History)

| 버전 (Version) | 마이그레이션 명 (Description) | 작성자 | 적용 일자 | 상태 |
| :--- | :--- | :--- | :--- | :---: |
| **`V1.0.0`** | `initial_domain_and_item_schema` | DB Lead | 2026-08-20 | Documented |
| **`V1.1.0`** | `add_hidden_values_synergy_and_bots` | DB Lead | 2026-08-20 | Documented |
| **`V1.2.0`** | `add_events_chance_cards_and_difficulty` | DB Lead | 2026-08-20 | Documented |
| **`V1.3.0`** | `add_forgery_sealed_bid_loan_and_codex` | DB Lead | 2026-08-20 | Documented |
| **`V2.0.0`** | `tiered_rooms_persistent_economy_and_dutch_auction` | DB Lead & PM | 2026-08-20 | Documented |
| **`V2.1.0`** | `strict_economy_loss_bankruptcy_and_responsive` | DB Lead & PM | 2026-08-20 | Documented |
| **`V2.2.0`** | `restoration_failure_extreme_market_and_smart_ai` | DB Lead & PM | 2026-08-20 | Documented |
| **`V2.3.0`** | `black_market_contraband_and_sealed_bid_fix` | DB Lead & PM | 2026-08-20 | Documented |
| **`V2.3.1`** | `stabilize_session_settlement_and_curse_contracts` | DEV | 2026-08-21 | Runtime Implemented / QA_VERIFIED (STAB-001) |

---

## 📝 상세 마이그레이션 로그 (Migration Details)

### 📌 `V2.3.0__black_market_contraband_and_sealed_bid_fix`
- **적용 일자:** 2026-08-20
- **변경 유형:** 신규 암시장 모드 추가 및 4R 비밀 경매 타임아웃 엣지케이스 무한로딩 방지 스키마 보완
- **주요 변경 내역 (Diff):**
  1. **4R 비밀 봉투 경매 타임아웃 안전 스키마 보완:**
     - 유저가 잔고 부족 또는 미입력 상태로 제한시간(15초) 만료 시, 유저 입찰을 `amount: 0 (Fold)`으로 자동 간주하고 대기 상태 없이 봇 제출 입찰가 즉시 오픈(`SIMULTANEOUS_REVEAL`) 및 낙찰 FSM 전이 보장.
  2. **비밀 암시장(`BLACK_MARKET`) 룸 티어 및 금기된 밀수품 6종 신설:**
     - `Item.isContraband?: boolean` (밀수품/금기 유물 여부)
     - `Item.curseDebuff?: string` (보유 시 매 판 현금 소모 등의 디버프)
     - `PoliceRaidEvent` 인터페이스: 경매 중 15% 확률로 경찰 급습 발생 ➔ 5초 탈출(무료 포기) 또는 뇌물($5,000) 납부 후 독점 낙찰.
  3. **암시장 입장 아이템 `blackVipTicketCount: number` 필드 추가:**
     - 골드/다이아 룸 승리 또는 업적 달성 시 지급되는 암시장 전용 초대장.

---

### 📌 `V2.3.1__stabilize_session_settlement_and_curse_contracts`

- **상태:** Runtime Implemented / QA_VERIFIED (STAB-001) — TypeScript·LocalStorage 런타임과 DEV 회귀 테스트에 반영되었고 독립 QA 증거가 있다. 실제 DB 마이그레이션은 아니다.
- **대상 TASK:** `STAB-001` WP-01~06, WP-08
- **적용 변경:**
  1. `storageVersion`을 `2.3.1`로 승격한다.
  2. `activeSession`과 `lastSettlementReceipt`를 추가하여 입장 차감과 종료 정산을 `sessionId`로 멱등 처리한다.
  3. 커리어 LocalStorage 쓰기를 단일 영속화 계층으로 통합한다.
  4. 밀수품 6종에 타입이 있는 `curseCode`를 추가한다.
  5. 비밀경매·더치·경찰 결과에 라운드/결과 식별자와 종료 상태를 추가한다.
- **v2.3.0 → v2.3.1 로드 규칙:**
  - 기존 현금, 순자산, 보관함 ID/상태, 업적, 최고 룸, 티켓, 통계를 보존한다.
  - 기존 데이터에는 `activeSession`과 `lastSettlementReceipt`가 없으므로 둘 다 `undefined`로 초기화한다.
  - 기존 암시장 아이템은 마스터 데이터의 ID→`curseCode` 매핑으로 하이드레이션하며 저장된 표시 문자열을 실행하지 않는다.
  - 숫자 카운터는 유한한 0 이상 정수로 정규화한다. 손상 필수 필드는 안전 초기 상태로 복구하고 진단 로그를 남긴다.
- **롤백 한계:**
  - 실제 DB 마이그레이션이 아니므로 DDL 롤백은 없다.
  - v2.3.0 코드로 되돌릴 경우 알 수 없는 선택 필드는 JSON 파싱상 무시될 수 있지만, 역호환은 DEV 테스트 전까지 보장하지 않는다.
