# Phase 01 완료 기록 — v2.3.1 안정화 및 문서 체계 이관

> **Phase:** 01  
> **기간:** 2026-08-21 ~ 2026-11-09
> **상태:** `STAB-001` DONE, `STAB-002`·`PERF-ASSET-001`·`A11Y-001` DEV_COMPLETE, `QA-INFRA-001`·`REPO-001` DONE, `DOC-002` DONE, v2.3.1 `RELEASE_CANDIDATE`
> **보관일:** 2026-11-09

## 1. 완료 TASK 목록

| TASK | 완료일 | 담당 | 결과 | 원문 |
| :--- | :--- | :--- | :--- | :--- |
| `REPO-001` | 2026-11-09 | QA_DEVOPS | Node 26·CI/CD·배포 위생, 추적 산출물 분리, audit 0, 루트·하위 경로 검증 | 이 문서 10절 |
| `A11Y-001` | 2026-11-09 | DEV | 핵심 흐름 접근성·실수 방지 UX, axe serious·critical 0, Lighthouse 접근성 1.00. 독립 QA 대기 | 이 문서 9절 |
| `PERF-ASSET-001` | 2026-11-09 | DEV | 이미지·폰트·번들 예산 최적화, public 75.14 MB → 1.85 MB, Lighthouse 0.96~1.00. 독립 QA 대기 | 이 문서 8절 |
| `QA-INFRA-001` | 2026-11-09 | QA_DEVOPS | 테스트 포함 타입 검사, Vitest 121개, Playwright 11개, 커버리지·CI 기반 | 이 문서 7절 |
| `STAB-002` | 2026-11-09 | DEV | v2.3.1 P1 데이터·경제·표시 정합 안정화, 자체 검증 완료. 독립 QA 대기 | 이 문서 6절 |
| `STAB-001` | 2026-08-21 | QA | v2.3.1 경제·FSM·암시장 계약 안정화, QA 최종 `DONE` | [`v2.3.1/STAB-001.md`](./v2.3.1/STAB-001.md) |
| `DOC-002` | 2026-11-08 | PM | 구 `docs/`를 `.md/`로 이관하고 `docs/` 삭제 | 이 문서 3절 |

## 2. STAB-001 요약

- **목표:** Phase 2.5 완료 선언과 실제 구현 사이의 경제·비밀경매·암시장 계약 불일치를 해소하고 재현 가능한 QA 증거로 승인한다.
- **범위:** WP-01 경제 정산, WP-02 비밀경매 단일 확정, WP-03 경찰 결과 영속화, WP-04 밀수품 6종 저주, WP-05 티켓 보상, WP-06 더치 공정성·락, WP-07 독립 QA, WP-08 버전·30종 표기.
- **결과:** DEV 구현과 자체 검증, QA 독립 회귀, 사용자 경찰 S4 확인을 거쳐 `DONE`.
- **주요 증거:**
  - `QA-413` 표적 20/20 반복 통과
  - 전체 회귀 10/10 반복 통과
  - 최종 17개 파일 83개 테스트 통과 기록
  - 브론즈 잉글리시·더치 각각 5라운드 E2E
  - 비밀경매 수동·타임아웃 결과 5.5초 불변
  - 경찰 탈출·뇌물·체포 새로고침 S4 사용자 수동 확인
  - 모바일 `390x844` 도감 필터 수평 스크롤 통과
  - 30종 고유 이미지·`v2.3.1` 표기 확인
- **미검증:** 저장 실패 강제 주입, 손상 데이터 전체 조합, 전체 접근성, 다중 브라우저, 장기 랜덤·성능 반복.
- **원문:** [`v2.3.1/STAB-001.md`](./v2.3.1/STAB-001.md) — 구 `docs/tasks/active/STAB-001.md`에서 이관한 원문이며 본문의 `docs/...` 경로는 역사 경로다.

## 3. DOC-002 상세 — 구 docs → .md 이관

### 3.1 목표

구 `docs/`의 현재 상태·요구사항·결정·TASK·기술 명세를 `.md/` 체계로 이관하고, 이관 완료 후 `docs/`를 삭제한다. 구 문서의 결론을 그대로 복사하지 않고 `.md`의 AGENTS/TASKS/FEATURES/roles 구조에 맞게 재구성한다.

### 3.2 확인한 사실

- 구 `docs/`는 `PROJECT_STATE`, `PRD`, `DECISIONS`, `TASKS`, `STAB-001`, ARCH/DATA/DEV/QA/ART/SOUND 명세와 역할 문서를 포함했다.
- `docs/art/asset` 58개 파일은 `public/assets` 58개 파일과 SHA-256이 모두 일치했다. 런타임 에셋 손실 없이 `docs/art/asset`을 삭제할 수 있다.
- `package.json` 버전은 `2.3.1`이다.
- 현재 리비전에서 `npm.cmd test` 17개 파일 84개 테스트가 통과했고, `npm.cmd run build`가 통과했다.
- 구 `docs`의 최종 QA 기록은 83개 테스트 기준이며, 현재 실행은 84개다. 두 수치의 차이는 이관 시 함께 보존한다.

### 3.3 변경한 파일

**생성·갱신한 활성 문서**

- `.md/root/AGENTS.md`
- `.md/root/TASKS.md`
- `.md/root/FEATURES.md`
- `.md/specs/PROJECT_STATE.md`
- `.md/specs/PRD.md`
- `.md/specs/DECISIONS.md`
- `.md/specs/ARCHITECTURE.md`
- `.md/specs/DATA_SCHEMA.md`
- `.md/specs/MIGRATIONS.md`
- `.md/specs/DEV_GUIDELINE.md`
- `.md/specs/QA_TEST_PLAN.md`
- `.md/specs/ART_ASSET_SPEC.md`
- `.md/specs/SOUND_SPEC.md`
- `.md/specs/GLOSSARY.md`
- `.md/roles/PM.md`
- `.md/roles/DEV.md`
- `.md/roles/QA_DEVOPS.md`
- 루트 `AGENTS.md`, `README.md`

**보관 문서**

- `.md/root/archive/v2.3.1/STAB-001.md`
- `.md/root/archive/TASKS_PHASE_01.md`

**삭제 완료**

- `docs/` 전체 — 2026-11-08 삭제 완료
- `.md/root/TASK_TEMPLATE.md` — 2026-11-08 정정으로 삭제
- `.md/README.md` — 2026-11-08 정정으로 삭제

### 3.4 이관 매핑

| 구 docs | `.md` 목적지 |
| :--- | :--- |
| `PROJECT_STATE.md` | `.md/specs/PROJECT_STATE.md` |
| `common/PRD.md` | `.md/specs/PRD.md` |
| `common/DECISIONS.md` | `.md/specs/DECISIONS.md` |
| `common/TASKS.md` | `.md/root/TASKS.md`, `.md/root/archive/TASKS_PHASE_01.md` |
| `tasks/active/STAB-001.md` | `.md/root/archive/v2.3.1/STAB-001.md` |
| `arch/ARCHITECTURE_GUIDELINE.md` | `.md/specs/ARCHITECTURE.md`의 현재 계약 + `STAB-001` 원문 |
| `db/DATA_SCHEMA.md` | `.md/specs/DATA_SCHEMA.md` |
| `db/SCHEMA_MIGRATIONS.md` | `.md/specs/MIGRATIONS.md` |
| `dev/DEV_GUIDELINE.md` | `.md/specs/DEV_GUIDELINE.md` |
| `qa/QA_TEST_PLAN.md` | `.md/specs/QA_TEST_PLAN.md` |
| `art/ART_ASSET_SPEC.md` | `.md/specs/ART_ASSET_SPEC.md` |
| `sound/SOUND_SPEC.md` | `.md/specs/SOUND_SPEC.md` |
| `common/GLOSSARY.md` | `.md/specs/GLOSSARY.md` |
| `roles/PM.md`, `roles/DEV.md`, `roles/QA.md` | `.md/roles/PM.md`, `.md/roles/DEV.md`, `.md/roles/QA_DEVOPS.md` |
| `roles/ARCH_DATA.md` | `GOV-003`으로 역할 종료, 기술 명세는 `.md/specs/`와 DEV가 담당 |
| `tasks/TASK_TEMPLATE.md` | 별도 템플릿 없이 `.md/root/AGENTS.md`의 TASK 생성 기준과 `.md/root/TASKS.md`의 항목·작업 기록 형식으로 대체 |
| `README.md`, `common/DOCUMENTATION_GUIDE_AND_RULES.md`, `pm/PM_GUIDELINE.md` | `.md/root/AGENTS.md`로 대체 |
| `art/asset/*.webp` | `public/assets/images/`와 SHA-256 동일, 원본 디렉터리 삭제 |

### 3.5 실행한 명령과 결과

| 명령·확인 | 결과 |
| :--- | :--- |
| `npm.cmd test` | 17개 파일, 84개 테스트 통과 (Node v26.13.0, npm 11.20.0, Vitest 4.1.11) |
| `npm.cmd run build` | `tsc -b && vite build` 통과, JS 352.60 kB·CSS 49.84 kB |
| `docs/art/asset` ↔ `public/assets` SHA-256 비교 | 58/58 일치, 누락·불일치 0 |
| 문서 링크 검사 | `.md` 19개 + 루트 2개, 총 21개 Markdown 파일의 로컬 링크 검사 통과, 누락 0 |
| UTF-8 검사 | UTF-8 대체 문자(U+FFFD) 0 |
| 잔여 `docs/` 참조 검사 | 활성 문서의 `docs/` 언급은 삭제·이관 이력 문구만 남고, 존재하지 않는 `docs/` 링크 0 |

### 3.6 결정과 충돌

- `GOV-001`: `.md/`를 유일한 활성 문서 체계로 사용하고 `docs/`는 이관 후 삭제한다.
- `GOV-002`: `DONE`은 모든 역할군이 가능하다. `DEC-008`의 QA 전용 `DONE` 조항은 대체됐다.
- `GOV-003`: 활성 역할은 PM, DEV, QA_DEVOPS다. `DEC-006`의 `ARCH_DATA` 역할은 종료하고 기술 명세는 DEV, 제품 결정은 PM이 담당한다.
- `DOC-001`은 구 문서 체계의 자동 라우팅·현재 상태·결정 추적 개편 작업이었다. `DOC-002` 이관 완료로 목적이 대체되어 완료 TASK로 승격하지 않고 `SUPERSEDED`로 기록한다.
- `CONTRACT_CONFLICT`: 이관 후 활성 문서 간 충돌은 발견되지 않았다.

### 3.7 미검증 범위

- 문서 이관 자체의 독립 QA
- 이관 후 브라우저 E2E 재실행
- v2.3.1 `PM_RELEASE_APPROVED` 판정
- 저장 실패·손상 데이터·전체 접근성·다중 브라우저·장기 성능 반복

### 3.8 다음 시작 지점

PM이 `.md/root/TASKS.md`의 `REL-001`로 v2.3.1 릴리즈 승인 여부를 판정한다. 릴리즈 승인 전에는 Phase 3 `ARCH-PVP-001`을 착수하지 않는다.

### 3.9 2026-11-08 정정 — 사용자 피드백

- **사유:** 이관 문서가 많고 기존 `.md` 양식을 벗어났다는 사용자 피드백.
- **변경:** `PROJECT_STATE.md`, `PRD.md`, `DECISIONS.md`를 `.md/root/`에서 `.md/specs/`로 이동했다. `.md/root/TASK_TEMPLATE.md`와 `.md/README.md`를 삭제했다.
- **TASK 기록:** 별도 템플릿 없이 `.md/root/AGENTS.md`의 TASK 생성 기준과 `.md/root/TASKS.md`의 항목·작업 기록 형식을 사용한다.
- **문서 지도:** `.md/README.md`를 삭제하고 `.md/root/AGENTS.md`의 읽기 순서와 문서 관리 체계를 지도로 사용한다.
- **루트 구성:** `.md/root/`는 `AGENTS.md`, `TASKS.md`, `FEATURES.md`만 유지한다. 나머지 참고 문서는 `.md/specs/`에 둔다.
- **검증:** 변경 후 21개 Markdown 파일의 로컬 링크 검사 통과, UTF-8 대체 문자 0.

## 4. Historical Ticket Ranges

상세 증거 없이 번호 범위만 존재하는 과거 티켓은 공식 완료 기록으로 승격하지 않는다.

- Phase 1: `ARCH-101~103`, `DEV-201~211`, `QA-301~306`, `DB-401~404`, `ART-101~104`, `SND-101~103`
- Phase 2: `DEV-301~311`, `QA-401~411`, `DB-501~504`
- Phase 2.5: `DEV-314~316`, `QA-412~413`, `DB-505`

## 5. Phase 01 종료 상태

- `STAB-001`: DONE
- `STAB-002`: DEV_COMPLETE (독립 QA 대기)
- `QA-INFRA-001`: DONE
- `PERF-ASSET-001`: DEV_COMPLETE (독립 QA 대기)
- `A11Y-001`: DEV_COMPLETE (독립 QA 대기)
- `REPO-001`: DONE
- `DOC-002`: DONE
- v2.3.1: `RELEASE_CANDIDATE`
- Phase 3: `BLOCKED`
- 다음 판단: `REL-001`

---

## 6. STAB-002 상세 — v2.3.1 P1 데이터·경제·표시 정합 안정화

- [x] `STAB-002` **v2.3.1 P1 데이터·경제·표시 정합 안정화** — P1, Phase 01 — DEV_COMPLETE, 독립 QA_DEVOPS 검증 대기
  - 진행 순서: 1번째 (PM 결정 3건 완료. `QD-01`~`QD-09` 전체 착수 가능)
  - 목표: 분석에서 확인된 P1 결함 9건과 동일 파일의 P2 결함을 수정하고, 각 항목에 재현·회귀 테스트를 추가한다.
  - 담당: DEV(구현), QA_DEVOPS(독립 검증), PM(제품 정책 3건).
  - 선행·블로커:
    - `QD-04` 탈출 시 긴급 대출 상환: `DEC-009` APPROVED — `ESCAPED`도 `NORMAL`과 같은 상환 순서를 적용한다.
    - `QD-08` 감정 비용: `DEC-010` APPROVED — 아이템별 `appraisalCost`를 권위로 사용하고 상수는 fallback으로만 사용한다.
    - `QD-09` 보존 상태 평가: `DEC-011` APPROVED — 세션·보관함·위탁·결과 화면에 단일 평가 계약을 적용한다.
    - 위 3건은 해소됐다. `QD-01`~`QD-09` 전체를 순서대로 착수할 수 있다.
  - P1 범위:
    - 내부 순서: `QD-01` → `QD-02` → `QD-03` → `QD-05` → `QD-06` → `QD-07` → `QD-04` → `QD-08` → `QD-09`. 뒤 3건은 `DEC-009`~`DEC-011` 결정에 따라 착수한다.
    - [x] `QD-01` 저장 스키마 검증·복구: 룸 티어·보관 상태·업적 ID·수치 필드를 화이트리스트/정수 검증하고, 손상 JSON은 백업 후 안전 초기화한다. `ErrorBoundary` 추가. `PLATINUM` 주입 회귀 테스트 통과.
    - [x] `QD-02` 저장 실패 결과 전파: `saveProfileToStorage`가 성공 여부를 반환하고 `enterRoom`·`commitGameResult`·`finishGame`·`returnToLobby`·경찰 결과가 전이를 보류한다. 로드 시 `setItem` 실패는 초기값 대체를 유발하지 않는다.
    - [x] `QD-03` 입찰 후 지출 음수 잔액: 최고 입찰자의 낙찰 예약액을 제외한 가용 현금으로만 감정 지출을 허용하고, `placeBid`의 `NaN`·비유한·소수 값을 거부한다.
    - [x] `QD-04` 탈출 대출 상환: `ESCAPED`에도 `NORMAL`과 같은 상환 순서를 적용하고 `LOAN_INTEREST_30` 저주 3,900달러 경계를 테스트로 고정했다.
    - [x] `QD-05` 경찰 모달 실제가치 노출: `realValue` 표시를 제거하고 감정 전 추정 범위, 감정 후 진품·위작 판정만 표시한다.
    - [x] `QD-06` 위탁 가격 단일 계산: `calculateConsignmentPayout` 단일 함수를 UI 미리보기·store 정산·완료 메시지가 공유하고 보존 배수를 한 번만 적용한다.
    - [x] `QD-07` 시장 시세 영속화: `PersistentCareerProfile.marketRates`에 저장·복원하고 손상 시 재생성·0.4~3.5 보정, `MIGRATIONS.md` 기록을 추가했다.
    - [x] `QD-08` 감정 비용 정합: `currentItem.appraisalCost`를 권위로 사용하고 5개 룸 대표 아이템의 `cost - 1`·정확히 일치·중복 차감 경계를 테스트했다.
    - [x] `QD-09` 보존 상태 평가 정합: `getAdjustedItemValue`·`getSessionItemValue`·`calculateSynergyBonus`로 순위·시너지·보관함·위탁·결과 화면을 통일하고 잭팟 상태를 보존한다.
  - P2 동반 범위(같은 파일에서 우선 정리):
    - [x] `QD-15` `placeBid`의 `NaN`·비유한·소수 값 거부, `QD-16` 업적 분모 `MASTER_ACHIEVEMENTS.length` 사용, `QD-17` `ach-iron-vault` 설명·조건 일치, `QD-18` `ach-forgery-hunter` 승리 조건 확인, `QD-19` 결과 화면 신규 업적에서 기존 보유분 제외.
    - [x] `QD-20` 시장 이벤트 배너 하드코딩 제거, `QD-21` `baseIncrement` 라운드별 갱신, `QD-22` 비밀 봉투 0원 기권 입력·명시적 버튼, `QD-23` 비밀 봉투 입력값 초기화, `QD-24` 스피드 해머 설명·사용 조건 일치, `QD-25` 백그라운드 타이머 deadline 보정, `QD-26` `nextRound` 중복 클릭 가드, `QD-30` 위작 아이템 시너지 세트 제외.
    - [x] `QD-27` 다중 탭의 `activeSession` 덮어쓰기 방지와 명시적 미지원 안내, `QD-29` 결과 화면 신규 업적·아이템 표시 정리.
    - [ ] `QD-28` 시드 기반 RNG·세션 이벤트 로그 — 전 구간 RNG 교체와 이벤트 로그 계약이 필요해 후속 TASK 후보로 분리한다.
    - [x] `QD-31`~`QD-36` `vaultItemStates`·업적 ID·`careerNetWorth` 검증, 백업 키, 저장 실패·손상·이전 버전 테스트.
    - `QD-70`~`QD-72`의 대형 파일 분리·중복 ID 생성·dead `StorageService` 정리는 P1 수정 후 별도 후속 TASK 후보로 분리한다.
  - DoD:
    - P1 항목 각각에 재현 테스트 또는 예외 사유와 수정 후 회귀 테스트가 있다.
    - `npm.cmd test`, `npm.cmd run build` 통과. 테스트 타입 검사는 `QA-INFRA-001` 기준을 따른다.
    - 저장 실패 주입, 손상 프로필, 음수 잔액, `ESCAPED` 대출, 위탁 payout, 새로고침 시세, 감정 비용, condition 순위가 테스트로 고정된다.
    - PM 결정 3건은 `.md/specs/DECISIONS.md`에 `DEC-009`~`DEC-011`로 `APPROVED` 기록됐다.
    - 변경된 계약은 `DATA_SCHEMA`·`ARCHITECTURE`·`FEATURES` 링크에 반영된다.
  - DEV 검증 (2026-11-09):
    - `npm.cmd test`: 18개 파일 114개 테스트 통과, 10회 반복 모두 통과. `tests/stab-002.test.ts` 30개가 P1 9건과 동반 P2의 재현·회귀를 고정한다.
    - `npm.cmd run build`: `tsc -b && vite build` 통과 (JS 362.18 kB, CSS 50.20 kB).
    - 인앱 Browser: 로비 30종·업적 `0/6`·`v2.3.1`·다중 탭 안내, `PLATINUM` 손상 프로필의 `BRONZE` 복구·콘솔 오류 0건, `marketRates` 저장·복원, 브론즈 감정 비용 `$300` 표시 확인.
    - 미검증: 독립 QA_DEVOPS 재검증, 실제 2탭 동시성, `ErrorBoundary` 실제 렌더 오류 유도, 경찰 모달·위탁·비밀 봉투의 전 룸 브라우저 반복, 테스트 포함 전체 타입 검사.
  - 참고: `src/stores/useCareerStore.ts`, `src/stores/useAuctionStore.ts`, `src/services/itemValueService.ts`, `src/components/auction/PoliceRaidModal.tsx`, `src/components/consignment/ConsignmentModal.tsx`, `.md/specs/ARCHITECTURE.md`





### 2026-11-09 / DEV / STAB-002 구현·자체 검증

- 확인한 사실: 2026-11-09 분석의 P1 결함 9건과 동반 P2를 재현했고, 저장 스키마 무검증, 저장 실패 무시, 입찰 후 지출 음수, 탈출 대출 미상환, 경찰 모달 실제가치 노출, 위탁 이중 배수, 시세 미영속, 감정 상수 불일치, 보존 상태 평가 불일치를 확인했다.
- 변경한 파일: `src/services/itemValueService.ts`(신규), `src/components/common/ErrorBoundary.tsx`(신규), `src/stores/useCareerStore.ts`, `src/stores/useAuctionStore.ts`, `src/types/index.ts`, `src/main.tsx`, `src/App.tsx`, `src/components/auction/AuctionGameView.tsx`, `src/components/auction/PoliceRaidModal.tsx`, `src/components/consignment/ConsignmentModal.tsx`, `src/components/gallery/ResultGalleryView.tsx`, `src/components/common/Header.tsx`, `src/components/codex/CodexModal.tsx`, `src/components/lobby/LobbyView.tsx`, `src/data/chanceCards.ts`, `tests/stab-002.test.ts`(신규), `tests/qa-301.test.ts`, `.md/specs/ARCHITECTURE.md`, `.md/specs/DATA_SCHEMA.md`, `.md/specs/MIGRATIONS.md`, `.md/root/FEATURES.md`, `.md/specs/PROJECT_STATE.md`.
- 구현: 프로필 검증·백업·`ErrorBoundary`, 저장 실패 전파와 전이 보류, 낙찰 예약액 기반 감정 지출 제한, 탈출 대출 상환, 경찰 모달 실제가치 제거, 위탁 단일 payout 함수, `marketRates` 프로필 영속화, 아이템별 감정 비용, DEC-011 단일 평가 계약, 비밀 봉투 0원 기권·입력 초기화, 스피드 해머 조건, deadline 타이머, 중복 라운드 가드, 업적 조건·분모·신규 표시 정리.
- 실행한 명령: `npm.cmd test`, `npm.cmd run build`, 인앱 Browser 로비·손상 프로필 복구·감정 비용·콘솔 확인, 문서 UTF-8·링크 검사.
- 결과: 18개 파일 114개 테스트 통과(반복 실행 포함), 프로덕션 빌드 통과, 손상 `PLATINUM` 프로필이 `BRONZE`로 복구되고 콘솔 오류 0건, 시세 저장·복원과 감정 비용 `$300` UI 확인.
- 미검증 범위: 독립 QA_DEVOPS 재검증, 실제 2탭 동시성, `ErrorBoundary` 실제 오류 유도, 경찰 모달·위탁·비밀 봉투의 전 룸 브라우저 반복, 테스트 포함 전체 타입 검사(기존 12개 오류는 `QA-INFRA-001` 범위).
- 결함·충돌: `CONTRACT_CONFLICT` 없음. `QD-28`은 전 구간 RNG·이벤트 로그 계약이 필요해 후속 TASK 후보로 분리했다.
- 상태 변경: `STAB-002` `BACKLOG -> DONE(DEV_COMPLETE)` — 자체 검증 완료, 독립 QA_DEVOPS 대기. `REL-001`은 계속 보류.
- 다음 시작 지점: QA_DEVOPS가 `tests/stab-002.test.ts`와 브라우저 흐름을 독립 재현한다. 결함이 없으면 `QA-INFRA-001`·`PERF-ASSET-001`·`A11Y-001`·`REPO-001`·`DOC-003`·`QA-REBASE-001` 후 `REL-001`을 재판정한다.

---

## 7. QA-INFRA-001 상세 — 테스트 타입·브라우저 E2E·커버리지 기반

- [x] `QA-INFRA-001` **테스트 타입·브라우저 E2E·커버리지 기반** — P1, Phase 01 — DONE
  - 진행 순서: 2번째 (1번째와 병행 가능)
  - 목표: 현재 테스트를 타입 검사 대상에 포함하고, 핵심 사용자 흐름을 자동화해 수동 S4 의존을 줄인다.
  - 담당: QA_DEVOPS(주), DEV(테스트 fixture·빌드 연동).
  - 범위:
    - [x] 테스트 포함 `tsconfig`·`typecheck` 스크립트를 만들고 기존 테스트 타입 오류를 해소한다.
    - [x] Vitest + React Testing Library로 로비·도감·모달·저장 실패·손상 프로필·ErrorBoundary UI 테스트를 추가한다.
    - [x] Playwright E2E: 영어 5라운드, 더치 5라운드, 4R 제출·타임아웃, 경찰 탈출·뇌물·체포+새로고침, 30종 도감·필터, 모바일 390×844.
    - [x] axe 접근성 기저선, V8 커버리지 리포트, Vitest 10회 반복 안정성 확인.
    - [x] `QA-REBASE-001`에 넘길 TC↔테스트 파일 매핑 초안을 작성한다.
  - 선행: 없음. `STAB-002` 변경과 충돌하지 않게 조정한다.
  - DoD:
    - `npm run typecheck`가 테스트 포함 0 오류다.
    - `npm test` 10회 반복에서 실패 0건, skip·xfail 없음. 통과·실패·건너뜀 수를 기록한다.
    - Playwright·axe 시나리오가 로컬에서 통과하고, 동일 명령이 `.github/workflows/qa.yml`에 연결된다. 실제 원격 실행은 `REPO-001`에서 확인한다.
    - 커버리지 기준선과 `QA-REBASE-001` 매트릭스 초안이 문서에 연결된다.
  - 결과 (2026-11-09 / QA_DEVOPS):
    - `npm run typecheck`: 테스트 19개 파일 포함 0오류.
    - `npm test`: 19개 파일 121개 테스트 통과. 10회 반복 실패 0건, skip·xfail 0건.
    - `npm run test:e2e`: Playwright Chromium 11개 통과(16.8초). 영어·더치 5라운드, 비밀 봉투 수동 제출·타임아웃, 경찰 탈출·뇌물·체포+새로고침, 30종/6종 도감, 모바일 390×844, axe 기저선.
    - `npm run test:coverage`: 문장 74.6%(1087/1457), 분기 58.71%(859/1463), 함수 65.1%(209/321), 줄 76.73%(986/1285).
    - `npm run build`: `tsc -b && vite build` 통과(JS 362.18 kB, CSS 50.20 kB).
    - `npm ci --dry-run --legacy-peer-deps`: lockfile 일치.
  - axe 기저선: 로비·도감에 알려진 `button-name` critical 1건이 남아 있어 “새 critical 0건”으로 기록했다. `A11Y-001`에서 `button-name`을 해소하고 critical 0건으로 강화한다.
  - CI: `.github/workflows/qa.yml`에 Node 22, `npm ci --legacy-peer-deps`, typecheck, coverage, build, Playwright Chromium install, E2E, artifact 업로드를 구성했다. 실제 GitHub Actions 원격 실행은 미검증이며 `REPO-001`의 첫 PR에서 확인한다.
  - 미검증 범위: 원격 CI 실행, axe serious·critical 전체 0건(A11Y-001), 전체 접근성 수동 검증, 다중 브라우저·장기 랜덤 반복, 성능 예산(PERF-ASSET-001).
  - 참고: `package.json`, `tsconfig.test.json`, `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `vite.e2e.config.ts`, `.github/workflows/qa.yml`, `tests/ui/`, `tests/e2e/`, `.md/specs/QA_TRACEABILITY_DRAFT.md`

---

## 8. PERF-ASSET-001 상세 — 이미지·폰트·번들 성능 예산

- [x] `PERF-ASSET-001` **이미지·폰트·번들 성능 예산** — P1, Phase 01 — DEV_COMPLETE, 독립 QA_DEVOPS 재검증 대기
  - 진행 순서: 3번째 완료
  - 목표: 기존 75.14 MB 자산과 경매 진입 14.45 MB 전송을 릴리즈 가능한 예산으로 축소하고 회귀 측정을 자동화한다.
  - 담당: DEV(에셋 파이프라인·코드), QA_DEVOPS(예산·측정·회귀).
  - 범위:
    - [x] 자산 인벤토리: 참조 54개·파일 58개 확인, 미사용 4개(`item_04`, `item_08`, `item_11`, `item_12`) 제거. 실제 WebP 104개(원본 54 + 변형 47 + 배경 변형 포함)로 정리.
    - [x] 표시 크기별 리사이즈·압축: 아이템 512/256, 아바타 128/64, 업적 256/128, 카드 256/128, 이벤트 512/256, 배경 1280×720/960×540. 품질 기반 WebP를 적용하고 AVIF는 이번 범위에서 보류.
    - [x] `<img>` 공통 `AssetImage`에 `srcset`·`sizes`·below-fold `loading="lazy"`·`decoding="async"`·`width`·`height`·실패 fallback 적용. 첫 화면 핵심 이미지는 `eager`.
    - [x] 3개 배경의 모바일 대체·압축, Google Fonts 제거, Cinzel 라틴 서브셋 자체 호스팅·`font-display: swap`, 한국어 시스템 폰트 스택 적용.
    - [x] `AuctionGameView`·`CodexModal`·`ResultGalleryView`·로비 모달의 지연 로딩과 코드 스플리팅 적용.
  - 예산 확정: public 전체 ≤5 MB(실측 1.85 MB), 초기 로비 ≤500 KB(441.4 KiB), 경매 진입 추가 ≤1.5 MB(176.0 KiB). LCP 목표 2.5 s 이하(실측 모바일 0.8 s·데스크톱 0.4 s).
  - DoD: 30종 아이템·아바타·업적·이벤트·카드·배경 렌더 확인, 미사용 자산 0건, 초기·경매 전송량 예산 이내, Lighthouse 기준선과 자산 크기 회귀 검사 기록 — 충족.
  - DEV 검증 (2026-11-09):
    - `npm run check:assets`: public 1,846.5 KB, 이미지 104개 1,821.2 KB, 개별 300 KB 이하, 실제 WebP·참조·변형·레거시 제거 통과.
    - `npm.cmd test`: 20개 파일 126개 테스트 통과. `tests/perf-asset.test.ts` 5개 추가.
    - `npm.cmd run test:e2e`: Playwright Chromium 13개 통과. `tests/e2e/perf-assets.spec.ts` 2개가 로비·도감·업적·경매·이벤트·카드·결과 렌더와 404 0건을 확인.
    - `npm.cmd run typecheck`: 테스트 포함 0오류.
    - `npm.cmd run build`: `tsc -b && vite build` 통과. 메인 JS 266.04 kB, CSS 51.31 kB, 지연 청크 10개.
    - `npm run perf:transfer`: 로비 441.4 KiB/6 requests, 경매 진입 추가 176.0 KiB/7 requests.
    - Lighthouse: 모바일 Performance 0.96~1.00(4회)·FCP 0.8 s·LCP 0.8 s·TBT 20~230 ms·CLS 0·총 184 KiB, 데스크톱 Performance 1.00·FCP 0.2 s·LCP 0.4 s·TBT 0 ms·CLS 0·총 224 KiB.
  - 미검증: 독립 QA_DEVOPS 재검증, 실제 배포 CDN·압축·다중 기기·반복 Lighthouse, 전체 접근성, `npm audit` 개발 취약점 6건(`REPO-001`).
  - 참고: `public/assets`, `src/components/common/AssetImage.tsx`, `scripts/`, `tests/perf-asset.test.ts`, `tests/e2e/perf-assets.spec.ts`, `.md/specs/ART_ASSET_SPEC.md`

### 2026-11-09 / DEV / PERF-ASSET-001 구현·자체 검증

- 확인한 사실: `public/assets` 58개 75.14 MB 중 36개가 확장자만 `.webp`인 PNG였다. 런타임 참조는 54개였고 `item_04`·`item_08`·`item_11`·`item_12`는 미사용이었다. 초기 로비는 Google Fonts 외부 요청과 원본 배경·아바타를 사용했고, 모든 `<img>`가 단일 원본만 참조했다.
- 변경 파일: `public/assets/images/**`(최적화·변형·레거시 4개 삭제), `public/assets/fonts/cinzel-latin.woff2`(신규), `scripts/optimize-assets.mjs`(신규), `scripts/check-asset-budget.mjs`(신규), `scripts/measure-transfer.mjs`(신규), `src/components/common/AssetImage.tsx`(신규), `src/services/assetService.ts`(신규), `src/App.tsx`, `src/components/lobby/LobbyView.tsx`, `src/components/auction/*`, `src/components/common/Header.tsx`, `src/components/codex/CodexModal.tsx`, `src/components/consignment/ConsignmentModal.tsx`, `src/components/workshop/RestorationModal.tsx`, `src/components/gallery/ResultGalleryView.tsx`, `src/index.css`, `index.html`, `tailwind.config.js`, `package.json`, `tests/perf-asset.test.ts`(신규), `tests/e2e/perf-assets.spec.ts`(신규), `tests/ui/app-flow.test.tsx`(lazy 로딩 대기 보정), `.md/specs/ART_ASSET_SPEC.md`, `.md/specs/ARCHITECTURE.md`, `.md/specs/PROJECT_STATE.md`, `.md/root/FEATURES.md`.
- 실행한 명령: `npm.cmd run check:assets`, `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build`, `npm.cmd run test:e2e`, `npm.cmd run perf:transfer`, Lighthouse 13.6.0(Edge 157 headless) 모바일·데스크톱, 인앱 Browser 로비·경매·도감 확인.
- 결과: public 1.85 MB, 이미지 104개 1.82 MB, 로비 441.4 KiB, 경매 추가 176.0 KiB, Lighthouse 모바일 0.96~1.00·데스크톱 1.00, 메인 JS 266.04 kB·CSS 51.31 kB. Vitest 20개 파일 126개, Playwright 13개, typecheck 0오류, build 통과.
- 미검증 범위: 독립 QA_DEVOPS 재검증, 실제 배포 CDN·압축·다중 기기·반복 Lighthouse, 전체 접근성, `npm audit` 개발 취약점 6건(`REPO-001`).
- 결함·충돌: `CONTRACT_CONFLICT` 없음. AVIF는 생성·검증 도구와 브라우저 fallback 비용을 고려해 이번 범위에서 보류하고 WebP를 채택했다. 기존 PM 변경분 `.md/specs/DECISIONS.md`·`.md/specs/PRD.md`는 수정하지 않았다.
- 상태 변경: `PERF-ASSET-001` `BACKLOG -> DONE(DEV_COMPLETE)` — 자체 검증 완료, 독립 QA_DEVOPS 대기.
- 다음 시작 지점: QA_DEVOPS가 `npm run check:assets`·`npm run perf:transfer`·Lighthouse·E2E를 독립 재현한다. 결함이 없으면 `A11Y-001`과 `REPO-001`을 진행한다.

---

## 9. A11Y-001 상세 — 핵심 흐름 접근성·실수 방지 UX

- [x] `A11Y-001` **핵심 흐름 접근성·실수 방지 UX** — P1, Phase 01 — DEV_COMPLETE, 독립 QA_DEVOPS 재검증 대기
  - 진행 순서: 4번째 완료
  - 목표: 키보드·스크린리더로 로비→경매→결과→도감 흐름을 사용할 수 있게 하고, 실수로 세션·커리어를 잃지 않게 한다.
  - 담당: DEV(UI), QA_DEVOPS(axe·Lighthouse·키보드 검증).
  - 범위:
    - [x] `QD-10` 헤더 로고·홈의 즉시 `returnToLobby`를 확인 모달로 전환하고, 로비·도감 초기화에 확인 모달·아이콘 이름을 적용했다. 경매 중에는 `aria-haspopup="dialog"`로 확인이 필요함을 알린다.
    - [x] `QD-11` 모든 모달에 `role="dialog"`·`aria-modal`·`aria-labelledby`, 공통 포커스 트랩·초기 포커스·복귀·Escape 닫기를 적용했다. 필수 선택 모달(경찰 급습·비밀 봉투 공개 전)은 Escape 우회를 막았다.
    - [x] `QD-37`~`QD-43` 로비 룸 카드·시세 카드·복원·위탁 항목을 키보드 버튼으로 전환하고, 헤더 로고 포커스, `aria-live` 타이머·입찰가, `prefers-reduced-motion`, 색 대비, `gold-950` 클래스를 수정했다.
    - [x] `QD-44` `font-sans`를 시스템 폰트 스택으로 정리하고 Noto Sans KR·Pretendard 의존을 제거했다.
    - [x] `QD-45` 오디오 설정을 `SIMPLE_AUCTION_AUDIO_V1`에 저장·복원하고, `QD-46` 탭 숨김 시 BGM 타이머·AudioContext 중지 후 복귀 시 재개하도록 정리했다.
    - [x] `QD-47`~`QD-51` 모든 이미지의 크기 예약·fallback을 유지하고, 내부 `item_*` ID를 3자리 LOT 번호로 교체하며, 경매 포기·초기화·복원·위탁 매각에 확인 단계를 적용했다.
  - DoD: axe serious·critical 0건(로비·경매·도감·결과), Lighthouse 접근성 ≥0.95, 키보드 5라운드·모달 포커스 복귀, 아이콘 버튼 이름, 확인 없는 초기화·포기 불가, reduced-motion 필수 정보 표시 — 충족.
  - DEV 검증 (2026-11-09):
    - `npm.cmd test`: 21개 파일 134개 테스트 통과, 10회 반복 실패 0건. `tests/a11y-001.test.tsx` 8개 추가.
    - `npm.cmd run test:e2e`: Playwright Chromium 19개 통과. `tests/e2e/a11y-keyboard.spec.ts` 6개 추가.
    - axe: 로비·도감·경매·결과 serious·critical 0건. 사운드·초기화 확인·복원·위탁·확인 모달도 수동 점검 0건.
    - Lighthouse: 접근성 **1.00**, 성능 **1.00**, FCP 0.8 s·LCP 0.8 s·TBT 60 ms·CLS 0·총 186 KiB.
    - `npm.cmd run typecheck`: 테스트 포함 0오류.
    - `npm.cmd run build`: 통과. 메인 JS 273.75 kB, CSS 52.52 kB.
    - `npm run perf:transfer`: 로비 450.1 KiB, 경매 진입 추가 149.6 KiB — PERF 예산 이내 유지.
    - 키보드만으로 로비→브론즈 입장→입찰→4R 비밀 봉투→결과→도감 완주, 모달 Tab 순환·Escape·포커스 복귀, 확인 취소 시 세션 유지, reduced-motion 필수 정보, 오디오 설정 새로고침 복원 확인.
  - 미검증: 독립 QA_DEVOPS 재검증, 실제 스크린리더(NVDA·VoiceOver) 수동 검증, 다중 브라우저 키보드 반복, 전 룸·전 모달 브라우저 반복.
  - 참고: `src/hooks/useModalA11y.ts`, `src/components/common/ConfirmDialog.tsx`, `src/components/`, `src/stores/useAudioStore.ts`, `src/services/audioService.ts`, `tests/a11y-001.test.tsx`, `tests/e2e/a11y-keyboard.spec.ts`, `.md/specs/PRD.md` REQ-NFR-002

### 2026-11-09 / DEV / A11Y-001 구현·자체 검증

- 확인한 사실: 로비 초기화 버튼에 접근 가능한 이름이 없었고, 푸터·도감 잠금 카드의 색 대비가 부족했다. 모든 모달에 dialog 역할·포커스 트랩이 없었고, 헤더 로고·룸 카드·복원·위탁 항목이 `div onClick`이었다. 경매 포기·초기화·복원·위탁은 확인 없이 즉시 실행됐고, 내부 `item_*` ID가 화면에 노출됐다. 오디오 설정은 새로고침 후 초기화됐고 탭 숨김 시 BGM이 계속됐다.
- 변경 파일: `src/hooks/useModalA11y.ts`(신규), `src/components/common/ConfirmDialog.tsx`(신규), `src/services/itemDisplayService.ts`(신규), `src/services/motionService.ts`(신규), `src/App.tsx`, `src/components/common/Header.tsx`, `SoundControlModal.tsx`, `src/components/lobby/LobbyView.tsx`, `src/components/auction/` 5종 모달·게임 뷰, `src/components/codex/CodexModal.tsx`, `src/components/consignment/ConsignmentModal.tsx`, `src/components/workshop/RestorationModal.tsx`, `src/components/gallery/ResultGalleryView.tsx`, `src/components/bankruptcy/BankruptcyModal.tsx`, `src/stores/useAudioStore.ts`, `src/services/audioService.ts`, `src/index.css`, `tailwind.config.js`, `tests/a11y-001.test.tsx`(신규), `tests/e2e/a11y-keyboard.spec.ts`(신규), `tests/e2e/codex-a11y.spec.ts`, `tests/ui/app-flow.test.tsx`, `.md/specs/PROJECT_STATE.md`, `.md/specs/QA_TEST_PLAN.md`, `.md/specs/ART_ASSET_SPEC.md`, `.md/specs/ARCHITECTURE.md`, `.md/root/FEATURES.md`.
- 구현: 공통 모달 Hook과 확인 모달, 모든 모달 dialog 계약, 클릭 가능한 카드·항목의 버튼 전환, live region, reduced-motion, 대비·`gold-950`·폰트 수정, 오디오 영속화·가시성 정책, LOT 번호, 이미지 fallback 유지.
- 실행한 명령: `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build`, `npm.cmd run test:e2e`, `npm run perf:transfer`, Lighthouse 13.6.0(Edge 157 headless), axe 수동 스크립트.
- 결과: Vitest 21개 파일 134개(10회 반복), E2E 19개, axe serious·critical 0, Lighthouse 접근성 1.00·성능 1.00, 로비 450.1 KiB·경매 추가 149.6 KiB, JS 273.75 kB·CSS 52.52 kB.
- 미검증 범위: 독립 QA_DEVOPS 재검증, 실제 스크린리더 수동 검증, 다중 브라우저 키보드 반복, 전 룸·전 모달 브라우저 반복.
- 결함·충돌: `CONTRACT_CONFLICT` 없음. 경찰 급습·비밀 봉투 공개 전 모달은 필수 선택을 우회하지 않도록 Escape 닫기를 의도적으로 제한했다. 기존 PM 변경분 `.md/specs/DECISIONS.md`·`.md/specs/PRD.md`는 수정하지 않았다.
- 상태 변경: `A11Y-001` `BACKLOG -> DONE(DEV_COMPLETE)` — 자체 검증 완료, 독립 QA_DEVOPS 대기.
- 다음 시작 지점: QA_DEVOPS가 axe·Lighthouse·키보드 E2E를 독립 재현한다. 결함이 없으면 `REPO-001`과 `DOC-003`을 진행한다.

---

## 10. REPO-001 상세 — 저장소·CI/CD·배포 위생

- [x] `REPO-001` **저장소·CI/CD·배포 위생** — P1, Phase 01 — DONE
  - 진행 순서: 5번째 완료
  - 목표: 재현 가능한 빌드·검증·배포 절차를 만들고 Git 저장소에서 생성물을 분리한다.
  - 담당: QA_DEVOPS(주), DEV(Vite·빌드 설정), PM(릴리즈 절차).
  - 범위:
    - [x] `.gitignore`를 추가하고 `node_modules` 8,414개·`dist` 61개·`*.tsbuildinfo` 2개를 추적 해제했다. `package-lock.json`은 유지했다.
    - [x] Node 26 이상을 `.nvmrc`·`engines`·CI`에 고정하고 `@types/node`를 26으로 올렸다. 테스트 스크립트는 `NODE_OPTIONS=--no-experimental-webstorage`로 Node 26 Web Storage 경고를 제거했다.
    - [x] `.github/workflows/qa.yml`에 Node 26, `npm ci`→typecheck→asset check→coverage→build→audit→Playwright E2E→artifact 업로드를 구성했다.
    - [x] `npm audit` 전체·프로덕션 의존성 0건을 확인했다. Vite 6.4.5, Vitest 4.1.12, `@vitejs/plugin-react` 4.7.0으로 보안 패치를 적용했다.
    - [x] `vite.config.ts`에 `VITE_BASE_PATH` 기반 `base` 정규화, `src/services/assetService.ts`에 런타임 `assetUrl()`을 추가하고 favicon·robots·meta description·OG·보안 헤더를 적용했다.
    - [x] `README.md`에 Node 26 요구 사항, 설치·개발·검증·빌드·루트/하위 경로 배포·Vercel·버전 태그·라이선스 절차를 기록했다.
  - DoD:
    - fresh clone에서 `npm ci` 후 typecheck·test·build가 문서 절차만으로 통과한다.
    - CI가 PR·push에서 green/red를 정확히 표시하고 빌드 아티팩트를 남긴다.
    - 저장소에 `node_modules`·`dist`·`*.tsbuildinfo`가 추적되지 않고, 빌드 후 working tree가 clean하다.
    - 하위 경로 preview에서 이미지 404 0건, Lighthouse SEO 메타 실패 0건, 프로덕션 audit 0건.
  - QA_DEVOPS 검증 (2026-11-09):
    - `npm ci`: lockfile 기준 설치 통과. `--legacy-peer-deps` 없이 동작한다.
    - fresh clone: 로컬 clone에서 `npm ci`→typecheck→test(134개)→build 통과, 빌드 후 working tree clean.
    - `npm run typecheck`: 테스트 포함 0오류.
    - `npm test`: 21개 파일 134개 테스트 통과.
    - `npm run test:coverage`: 문장 71.73%, 분기 56.85%, 함수 63%, 줄 74.04%. `assetService`·신규 UI 코드 포함 기준선이다.
    - `npm run test:e2e`: Playwright Chromium 19개 통과.
    - `npm run build`·`npm run build:subpath`: 통과. 메인 JS 274.07 kB, CSS 약 52.5 kB.
    - `npm run check:assets`: public 1,846.9 KB, 이미지 104개, WebP·참조·변형 무결성 통과.
    - `npm audit`·`npm audit --omit=dev`: 모두 0 vulnerabilities.
    - 루트 preview: `npm run verify:deploy -- http://127.0.0.1:4175/` 20 requests·이미지 10개·실패 0.
    - 하위 경로 preview: `npm run verify:deploy -- http://127.0.0.1:4174/simple-auction-game/` 20 requests·이미지 10개·실패 0.
    - Lighthouse 13.6.0 SEO: 루트·하위 경로 모두 **1.00**, 실패 audit 0.
    - GitHub Actions `QA` run [42556497240](https://github.com/NewplayerKOR/simple-auction-game/actions/runs/42556497240): **success**. Node 26 설치, `npm ci`, typecheck, asset check, coverage, build, 하위 경로 build, audit, E2E, artifact 업로드 16단계 통과.
    - 추적 상태: `git ls-files node_modules`·`git ls-files dist`·`git ls-files '*.tsbuildinfo'` 모두 0.
  - 미검증 범위: Vercel 프로젝트는 사용자가 pause 상태로 두었으므로 실제 Vercel 헤더·CDN 검증은 재개 후로 미룬다. 이는 저장소 오류가 아니다. 실제 CDN 압축·다중 기기 측정은 `QA-REBASE-001` 이후로 남긴다.
  - 참고: `.gitignore`, `.nvmrc`, `.env.example`, `package.json`, `vercel.json`, `index.html`, `public/favicon.svg`, `public/robots.txt`, `vite.config.ts`, `src/vite-env.d.ts`, `src/services/assetService.ts`, `scripts/verify-deployment.mjs`, `.github/workflows/qa.yml`, `README.md`
