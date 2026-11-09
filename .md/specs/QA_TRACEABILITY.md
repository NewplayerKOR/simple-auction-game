# QA 추적성 매트릭스

> **상태:** ACTIVE
> **관리:** QA_DEVOPS
> **기준일:** 2026-11-09
> **기준 리비전:** `ad0a863` + `QA-REBASE-001` 작업 트리
> **입력 문서:** [`PRD.md`](./PRD.md), [`DECISIONS.md`](./DECISIONS.md), [`QA_TEST_PLAN.md`](./QA_TEST_PLAN.md)
> **목적:** PRD 요구사항·`TC-STAB`·자동화 테스트를 연결하고, 누락·중복·수동 의존을 릴리즈 판정 전에 명시한다.

## 1. 증거 등급과 판정

| 등급 | 증거 | 이 문서에서의 사용 |
| :--- | :--- | :--- |
| S1 | 타입 검사·정적 검사 | `npm run typecheck` |
| S2 | 단위 테스트 | Vitest |
| S3 | 통합 테스트 | Vitest store·storage·모듈 상호작용 |
| S4 | 브라우저 E2E | Playwright Chromium |
| S5 | 반복·복구·성능 | 10회 반복, 새로고침, Lighthouse, 자산 예산 |

판정 값:

- **COVERED**: 요구사항의 핵심 AC를 자동화 테스트가 직접 검증한다.
- **COVERED-DOC**: 자동화 대상이 아닌 문서·버전 계약을 테스트와 문서로 함께 검증한다.
- **PARTIAL**: 일부 AC만 자동화되어 있거나 독립 QA가 남아 있다.
- **MANUAL**: 자동화 대신 수동 확인이 필요하다.
- **GAP**: 자동화·수동 증거가 모두 없다.

상위 등급은 하위 등급의 대체가 아니다. S4 통과는 S2/S3의 경계값 검증을 대신하지 않는다.

## 2. 현재 기준선

| 구분 | 수량 | 명령·증거 |
| :--- | :---: | :--- |
| Vitest 파일 | 22개 | `npm test` |
| Vitest 테스트 | 146개 통과 | `npm test` |
| Playwright E2E | 19개 / 5개 파일 | `npm run test:e2e` |
| 타입 검사 | 테스트 포함 0오류 | `npm run typecheck` |
| 커버리지(V8) | 문장 71.91%, 분기 57.29%, 함수 63%, 줄 74.1% | `npm run test:coverage` |
| 자산 검증 | public 1,846.9 KB, 이미지 104개 | `npm run check:assets` |
| 배포 검증 | 루트·하위 경로 404 0, Lighthouse SEO 1.00 | `npm run verify:deploy -- <URL>` |
| CI | GitHub Actions `QA` success | Node 26, typecheck, coverage, build, audit, E2E |

## 3. PRD 요구사항 ↔ TC ↔ 테스트

| 요구사항 | 핵심 AC | TC | 자동화 근거 | 등급 | 판정·잔여 |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `REQ-CORE-001` 게임 세션 | 5라운드, 인간 1+봇 3, 단일 확정, 순위·시너지·대출·보존 배수 | `TC-STAB-012`, `TC-STAB-011` | `qa-301` TC-01/TC-10, `qa-303` 5번, `stab-001` WP-08, `stab-002` QD-09, E2E 영어·더치 5라운드, `a11y-keyboard` 키보드 5라운드 | S2/S3/S4 | **COVERED** |
| `REQ-CORE-002` 경제 보존 | 입장료, 종료 잔액 교체, 탈출 대출 상환, 감정 비용, 단일 원장 | `TC-STAB-001` | `stab-001` WP-01, `stab-002` QD-02/03/04/06/08, `qa-301` TC-08/09, `qa-303`, `qa-304`, `qa-401` 2/4번, `qa-404`, `qa-408`, `qa-409`, `qa-rebase-001` 음수 종료 잔액 | S2/S3/S4 | **COVERED** |
| `REQ-CORE-003` 영속화 | 커리어·아이템·업적·티켓·파산 저장, 손상 복구, 버전·마이그레이션 | `TC-STAB-005~007` | `stab-002` QD-01/02/QD-27, `qa-305`, `qa-405`, `ui/app-flow` 손상 프로필·`SAVE_FAILED`, `a11y-001` 오디오 영속화, E2E 경찰 새로고침 | S2/S3/S4 | **COVERED-DOC** (마이그레이션 규칙은 문서 계약) |
| `REQ-AUC-001` 잉글리시 | 최고가 초과만 허용, 잔액 초과 거부, 앤티 스나이핑, 유찰 | `TC-STAB-012` | `qa-301` TC-02/03/04, `stab-002` QD-15/QD-24/QD-25, `qa-rebase-001` 입찰 경계값, E2E 영어 5라운드 | S2/S3/S4 | **COVERED** |
| `REQ-AUC-002` 비밀 봉투 | 15초, 기권 0, 단일 생성·공개, 공개 중 불변 | `TC-STAB-002~004` | `qa-301` TC-07, `qa-302` 1~6번, `qa-412` 1~2번, `stab-001` WP-02, `stab-002` QD-22, E2E 수동 제출·타임아웃 | S2/S3/S4 | **COVERED** |
| `REQ-AUC-003` 더치 | 시간 하락, 원자적 1인 낙찰, 잔액·락 검증, AI 은닉 정보 비사용, 바닥가 최종 기회 | `TC-STAB-009~010` | `qa-403` 1~4번, `stab-001` WP-06 3건, E2E 더치 5라운드 | S2/S3/S4 | **COVERED** |
| `REQ-ROOM-001` 룸 구성 | 5개 룸 임계값·입장료, 암시장 VIP 예외 | `TC-STAB-012` | `qa-401` 1~4번, `qa-404` 2번, `qa-301` TC-01, `qa-413` VIP 입장 | S2/S3 | **COVERED** |
| `REQ-ITEM-001` 마스터 아이템 | 일반 24+암시장 6=30, 룸별 6종 중 5종, 도감·필터 | `TC-STAB-011` | `qa-402` 1~4번, `qa-306` 1~7번, `stab-001` WP-08, `ui/app-flow` 도감·암시장 필터, E2E 30종/6종 필터 | S2/S3/S4 | **COVERED** |
| `REQ-BM-001` 진입·티켓 | 순자산/VIP 해금, 골드·다이아 완주 티켓, 블라인드 마스터 1회, 비해당 결과 미지급, 티켓 소모 조건 | `TC-STAB-005~007` | `stab-001` WP-05, `qa-413` VIP 입장, `qa-rebase-001` 비지급·다이아 지급·미소모 | S2/S3 | **COVERED** |
| `REQ-BM-002` 밀수품 저주 | 6종 고유 디버프, 획득·종료·대출·복원·시장 행동 검증 | `TC-STAB-008` | `stab-001` WP-04 2건, `qa-rebase-001` 6종 개별 + 중복 0, `stab-002` QD-04/QD-07 | S2/S3 | **COVERED** |
| `REQ-BM-003` 경찰 급습 | 15%, 5초, 탈출·뇌물·체포, 비용 부족, 아이템·저장 계약 | `TC-STAB-005~007` | `stab-001` WP-03 2건, `qa-413` 탈출·뇌물, `qa-rebase-001` 비용 1 부족 거부, E2E 탈출·뇌물·체포+새로고침 | S2/S3/S4 | **COVERED** |
| `REQ-NFR-001` 무한 정지 방지 | 모든 타이머 종료·폴백, 중복 클릭·타이머·재진입 단일 확정 | `TC-STAB-004` | `qa-302` 5/6번, `qa-412` 1~2번, `stab-001` WP-02, `stab-002` QD-25/QD-26, E2E 비밀 봉투 타임아웃, `a11y-keyboard` 확인 모달 | S2/S3/S4 | **COVERED** |
| `REQ-NFR-002` 접근성 | 키보드 조작, dialog 의미·포커스, 대비 | - | `a11y-001` 1~8번, E2E axe 로비·도감·경매·결과, 키보드 5라운드, 모바일 390×844, reduced-motion | S2/S4 | **COVERED** (자동화) / 실제 스크린리더 수동 미검증 |
| `REQ-NFR-003` 성능 | 초기 자산 예산, 이미지 크기·포맷, 원본·런타임 구분 | - | `perf-asset` 1~5번, E2E 자산 404 0, `check:assets`, `perf:transfer`, Lighthouse | S2/S4/S5 | **COVERED** / 실제 CDN·다중 기기 미검증 |

## 4. TC-STAB 매트릭스

| TC | 기대 결과 | 자동화 테스트 | 판정 |
| :--- | :--- | :--- | :---: |
| `TC-STAB-001` | 무행동·유찰 종료로 현금이 복제되지 않음 | `stab-001` WP-01 2건, `qa-404` 1~2번, `qa-rebase-001` 음수 종료 잔액 | **COVERED** |
| `TC-STAB-002` | 수동 비밀입찰이 한 번만 확정됨 | `qa-301` TC-07, `qa-302` 1~3번, `stab-001` WP-02, E2E 수동 제출 | **COVERED** |
| `TC-STAB-003` | 타임아웃 기권·봇 결과가 한 번만 확정됨 | `qa-302` 5~6번, `qa-412` 2번, E2E 타임아웃 | **COVERED** |
| `TC-STAB-004` | 결과 모달 중 추가 타이머·호출이 상태를 바꾸지 않음 | `stab-001` WP-02, `qa-412` 2번, `stab-002` QD-26 | **COVERED** |
| `TC-STAB-005` | 탈출 결과가 로비 복귀·저장 계약과 일치함 | `qa-413` 탈출, `stab-002` QD-04, E2E 탈출+새로고침 | **COVERED** |
| `TC-STAB-006` | 뇌물 비용·낙찰 결과가 승인 결정과 일치함 | `stab-001` WP-03 뇌물, `qa-413` 뇌물, `qa-rebase-001` 비용 부족, E2E 뇌물+새로고침 | **COVERED** |
| `TC-STAB-007` | 체포 몰수가 새로고침 후에도 유지됨 | `stab-001` WP-03 체포, E2E 체포+새로고침 | **COVERED** |
| `TC-STAB-008` | 밀수품 6종 저주가 각각 해당 행동에서 발생함 | `stab-001` WP-04, `qa-rebase-001` 6종 개별 + 중복 0 | **COVERED** |
| `TC-STAB-009` | 잔액 부족 더치 구매가 틱 엔진을 정지시키지 않음 | `qa-403` 1~2번, `stab-001` WP-06, E2E 더치 5라운드 | **COVERED** |
| `TC-STAB-010` | AI가 숨은 진위·가치를 직접 참조하지 않음 | `stab-001` WP-06 은닉 정보 비사용, `qa-403` AI WTP | **COVERED** |
| `TC-STAB-011` | UI·도감·필터가 총 30종을 일관되게 표시함 | `qa-402`, `qa-306`, `stab-001` WP-08, `ui/app-flow`, E2E 30종/6종 | **COVERED** |
| `TC-STAB-012` | 잉글리시·더치 각각 5라운드 완주 가능 | E2E 영어·더치 5라운드, `a11y-keyboard` 키보드 5라운드 | **COVERED** (Chromium 단일) |

## 5. 테스트 인벤토리

### 5.1 Vitest

| 파일 | 테스트 수 | 주 요구사항·TC | 보강·특이사항 |
| :--- | ---: | :--- | :--- |
| `tests/a11y-001.test.tsx` | 8 | `REQ-NFR-002`, `REQ-CORE-003` | dialog 계약, 포커스, 오디오 영속화, LOT, reduced-motion, 이미지 fallback |
| `tests/perf-asset.test.ts` | 5 | `REQ-NFR-003`, `REQ-ITEM-001` | 자산 예산·참조·변형·레거시·지연 로딩 구조 |
| `tests/qa-301.test.ts` | 10 | `REQ-AUC-001/002`, `REQ-CORE-001/002`, `REQ-ROOM-001` | 기본 인수 조건 TC-01~10 |
| `tests/qa-302.test.ts` | 6 | `REQ-AUC-002`, `REQ-NFR-001` | 비밀 봉투 정렬·동점·타임아웃·잔액 부족 |
| `tests/qa-303.test.ts` | 6 | `REQ-CORE-002`, 보험·위작 | 위작 $0, 보험 환급, 순위 기여 |
| `tests/qa-304.test.ts` | 5 | `REQ-CORE-002` | 긴급 대출 1회·상환·업적 |
| `tests/qa-305.test.ts` | 5 | `REQ-CORE-003`, `REQ-ITEM-001` | 정규화 저장·stale 데이터·알 수 없는 ID |
| `tests/qa-306.test.ts` | 7 | `REQ-ITEM-001`, `REQ-NFR-003` | 30종·봇·업적·카드·이벤트·배경·UI 참조 |
| `tests/qa-401-career-gating.test.ts` | 4 | `REQ-ROOM-001`, `REQ-CORE-002/003` | 초기 자금·티어·입장료·승급 |
| `tests/qa-402-tier-items.test.ts` | 4 | `REQ-ITEM-001` | 30종·5티어 6종·더치 파라미터·중복 없는 큐 |
| `tests/qa-403-dutch-auction.test.ts` | 4 | `REQ-AUC-003`, `TC-STAB-009/010` | 틱·원자 락·봇 자금·WTP |
| `tests/qa-404-bankruptcy.test.ts` | 3 | `REQ-CORE-002`, `REQ-ROOM-001` | 임계값·손실 반영·파산 구제 |
| `tests/qa-405-apple-hig.test.ts` | 2 | `REQ-CORE-003` | 저장 버전·설정·호가 단위 |
| `tests/qa-408-restoration.test.ts` | 4 | `REQ-CORE-002` | 복원 성공·잭팟·파손·비용 |
| `tests/qa-409-consignment-market.test.ts` | 2 | `REQ-CORE-002` | 시세 범위·위탁 정산 |
| `tests/qa-410-ai-reactions-smart-bidding.test.ts` | 3 | `REQ-AUC-001/003` | AI 리액션·조기 포기 |
| `tests/qa-412-sealed-bid-freeze-fix.test.ts` | 2 | `REQ-AUC-002`, `REQ-NFR-001` | 0원 기권·타임아웃 무한 대기 방지 |
| `tests/qa-413-black-market-police-raid.test.ts` | 4 | `REQ-BM-001/002/003` | 6종 등록·VIP 입장·탈출·뇌물 |
| `tests/stab-001.test.ts` | 13 | `TC-STAB-001~012`, `REQ-BM-001` | WP-01~08 계약 |
| `tests/stab-002.test.ts` | 30 | `REQ-CORE-001/002/003`, `REQ-AUC-001/002`, `TC-STAB-004` | QD-01~27 데이터·경제·표시·영속화 |
| `tests/ui/app-flow.test.tsx` | 7 | `REQ-CORE-003`, `REQ-ITEM-001`, `REQ-BM-003` | 로비·도감·ErrorBoundary·손상 프로필·저장 실패·경찰 모달 |
| `tests/qa-rebase-001.test.ts` | 12 | `TC-STAB-001/008`, `REQ-AUC-001`, `REQ-BM-001/002/003` | 음수 종료 잔액, 6종 저주 개별, 입찰 경계값, 뇌물 부족, 티켓 지급·소모 |

### 5.2 Playwright E2E

| 파일 | 테스트 수 | 주 요구사항·TC |
| :--- | ---: | :--- |
| `tests/e2e/a11y-keyboard.spec.ts` | 6 | `REQ-NFR-002`, `REQ-CORE-001`, `REQ-CORE-003` |
| `tests/e2e/auction-flow.spec.ts` | 4 | `REQ-AUC-001/002/003`, `REQ-CORE-001`, `TC-STAB-002/003/012` |
| `tests/e2e/codex-a11y.spec.ts` | 4 | `REQ-ITEM-001`, `REQ-NFR-002`, `TC-STAB-011` |
| `tests/e2e/perf-assets.spec.ts` | 2 | `REQ-NFR-003`, `REQ-ITEM-001` |
| `tests/e2e/police-raid.spec.ts` | 3 | `REQ-BM-003`, `REQ-CORE-003`, `TC-STAB-005/006/007` |

## 6. 중복·보완 관계

- `qa-301` TC-07과 `qa-302`는 의도된 계층이다. 전자는 정상 4R 흐름, 후자는 정렬·동점·타임아웃·잔액 부족 경계값을 검증한다.
- `qa-301` TC-08과 `qa-303`은 모두 위작을 다루지만, 전자는 감정 비용·`appraisalCost` 권위, 후자는 위작 가치·보험 환급·순위 기여를 검증한다.
- `qa-301` TC-09와 `qa-304`는 모두 대출을 다루지만, 전자는 5R 정산 경로, 후자는 대출 1회·상환액·업적 계약을 검증한다.
- `qa-303` 5번과 `stab-002` QD-09는 결과 화면의 위작·보존 배수 계약을 각각 사용자 시나리오와 단일 평가 함수 경계에서 검증한다.
- `qa-306`과 `perf-asset`은 모두 자산을 다루지만, 전자는 참조 파일 존재, 후자는 예산·포맷·변형·레거시 금지 계약을 검증한다.
- `a11y-001`과 E2E 접근성은 단위 계약과 실제 브라우저 키보드 흐름을 분리한다. 어느 한쪽만으로 접근성 전체를 주장하지 않는다.
- `qa-413`과 `police-raid` E2E는 store 계약과 새로고침 포함 사용자 흐름을 분리한다.
- 30종 검증은 `qa-402`(데이터), `qa-306`(파일), `ui/app-flow`(도감), E2E(브라우저)의 4계층이다.
- 위 중복은 결함을 가리기 위한 중복이 아니라, 서로 다른 실패 원인을 분리하기 위한 계층이다. 삭제하지 않는다.

## 7. 잔여 리스크와 수동 검증

| 항목 | 상태 | 다음 확인 |
| :--- | :--- | :--- |
| `REL-001` v2.3.1 릴리즈 승인 | **APPROVED** | 2026-11-09 `PM_RELEASE_APPROVED`. 실제 태그·배포는 별도 실행 |
| `STAB-002` 독립 QA_DEVOPS 재검증 | **PASS** | REL-001 사전 검증에서 `QD-01`~`QD-09`를 실제 store/service로 재현. 임시 테스트 삭제 후 작업 트리 clean |
| `PERF-ASSET-001`·`A11Y-001` 독립 QA | **PASS** | public 1,846.9 KB, 로비 451 KiB, 경매 추가 177 KiB, axe serious·critical 0, 키보드 E2E 10개 |
| 실제 스크린리더(NVDA·VoiceOver) | MANUAL | 릴리즈 후 수동 확인 |
| 다중 브라우저·다중 모바일 | PARTIAL | Chromium 단일. Firefox·WebKit은 후속 |
| 장기 랜덤·타이머 반복 | PARTIAL | 10회 반복은 수행. 장시간·경계 난수는 후속 |
| Vercel 실제 CDN·보안 헤더 | MANUAL | 프로젝트 pause 해제 후 확인 |
| `TC-STAB-012` 반복·다중 브라우저 | PARTIAL | Chromium 1회. 반복 매트릭스는 후속 |

자동화 추적성 기준으로 **P0/P1 미커버 요구사항은 0건**이다. 독립 QA는 `REL-001` 사전 검증에서 PASS했고, 남은 항목은 수동·환경 검증이다.

## 8. 변경 관리

- PRD REQ가 추가·변경되면 이 문서의 3절과 `QA_TEST_PLAN.md`의 기준선을 같은 커밋에서 갱신한다.
- 테스트를 추가·삭제·이름 변경하면 5절 인벤토리와 `npm test` 수치를 갱신한다.
- 요구사항을 약화해 테스트를 통과시키지 않는다. 기대값 변경은 `DECISIONS.md` 근거와 함께 기록한다.
- 레거시 `qa-301`~`qa-413` 파일명은 이력 보존을 위해 유지한다. 파일명 대신 이 문서의 REQ·TC 매핑을 권위로 사용한다.
- 검증 명령: `npm run typecheck`, `npm test`, `npm run test:coverage`, `npm run test:e2e`, `npm run check:assets`, `npm run verify:deploy -- <URL>`.
