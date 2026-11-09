# QA 추적성 매트릭스 초안 (QA-REBASE-001 입력)

> **상태:** DRAFT  
> **작성:** QA_DEVOPS, 2026-11-09  
> **목적:** 현재 자동화 테스트와 PRD 요구사항·STAB TC의 연결을 기록해 `QA-REBASE-001`의 기준선으로 넘긴다.  
> **주의:** 이 문서는 최종 승인 매트릭스가 아니다. 누락·중복 판정은 `QA-REBASE-001`에서 완료한다.

## 1. 현재 자동화 기준선

| 구분 | 수량 | 실행 명령 |
| :--- | :---: | :--- |
| Vitest 파일 | 21개 | `npm test` |
| Vitest 테스트 | 134개 통과 | `npm test` |
| React UI 테스트 | UI·A11Y 포함 (`tests/ui/`, `tests/a11y-001.test.tsx`) | `npm test` |
| Playwright E2E | 19개 | `npm run test:e2e` |
| 커버리지(V8) | 문장 71.73%, 분기 56.85%, 함수 63%, 줄 74.04% | `npm run test:coverage` |
| 타입 검사 | 테스트 포함 0 오류 | `npm run typecheck` |
| 배포 검증 | 루트·하위 경로 404 0, Lighthouse SEO 1.00 | `npm run verify:deploy -- <URL>` |

## 2. PRD 요구사항 ↔ TC ↔ 테스트

| 요구사항 | TC | 자동화 테스트 | 등급 | 현재 판정 |
| :--- | :--- | :--- | :---: | :--- |
| REQ-CORE-001 게임 세션 | TC-STAB-012 | `tests/e2e/auction-flow.spec.ts` 영어·더치 5라운드 | S4 | 통과 |
| REQ-CORE-002 경제 보존 | TC-STAB-001 | `tests/stab-001.test.ts` WP-01, `tests/stab-002.test.ts` QD-02/QD-03 | S3 | 통과 |
| REQ-CORE-003 영속화 | TC-STAB-005~007 | `tests/stab-001.test.ts` WP-01/03, `tests/stab-002.test.ts` QD-01/QD-02, `tests/e2e/police-raid.spec.ts` | S3/S4 | 통과 |
| REQ-AUC-001 잉글리시 | TC-STAB-012 | `tests/qa-301.test.ts`, `tests/e2e/auction-flow.spec.ts` | S3/S4 | 통과 |
| REQ-AUC-002 비밀 봉투 | TC-STAB-002~004 | `tests/stab-001.test.ts` WP-02, `tests/qa-302.test.ts`, `tests/qa-412-sealed-bid-freeze-fix.test.ts`, `tests/e2e/auction-flow.spec.ts` | S3/S4 | 통과 |
| REQ-AUC-003 더치 | TC-STAB-009~010 | `tests/stab-001.test.ts` WP-06, `tests/qa-403-dutch-auction.test.ts`, `tests/e2e/auction-flow.spec.ts` | S3/S4 | 통과 |
| REQ-ROOM-001 룸 구성 | TC-STAB-012 | `tests/qa-401-career-gating.test.ts`, `tests/qa-404-bankruptcy.test.ts` | S3 | 통과 |
| REQ-ITEM-001 30종 | TC-STAB-011 | `tests/qa-402-tier-items.test.ts`, `tests/qa-306.test.ts`, `tests/ui/app-flow.test.tsx`, `tests/e2e/codex-a11y.spec.ts` | S2/S3/S4 | 통과 |
| REQ-BM-001 티켓 | TC-STAB-005~007 | `tests/stab-001.test.ts` WP-05, `tests/qa-413-black-market-police-raid.test.ts` | S3 | 통과 |
| REQ-BM-002 저주 6종 | TC-STAB-008 | `tests/stab-001.test.ts` WP-04, `tests/stab-002.test.ts` QD-04/QD-07 | S3 | 통과 |
| REQ-BM-003 경찰 급습 | TC-STAB-005~007 | `tests/stab-001.test.ts` WP-03, `tests/qa-413-black-market-police-raid.test.ts`, `tests/e2e/police-raid.spec.ts` | S3/S4 | 통과 |
| REQ-NFR-001 무한 정지 방지 | TC-STAB-004 | `tests/qa-302.test.ts`, `tests/qa-412-sealed-bid-freeze-fix.test.ts`, `tests/stab-002.test.ts` QD-25/QD-26 | S3 | 통과 |
| REQ-NFR-002 접근성 | - | `tests/e2e/codex-a11y.spec.ts`, `tests/e2e/a11y-keyboard.spec.ts` axe serious·critical 0·키보드 흐름 | S4 | **DEV 검증 완료, 독립 QA 대기** |
| REQ-NFR-003 성능 | - | 없음 | - | **미완료 — PERF-ASSET-001** |

## 3. TC-STAB 매트릭스

| TC | 현재 테스트 | 보강 필요 |
| :--- | :--- | :--- |
| `TC-STAB-001` | `stab-001.test.ts` WP-01, `stab-002.test.ts` QD-02/03 | 음수 종료 잔액 전용 케이스 |
| `TC-STAB-002` | `stab-001.test.ts` WP-02, `qa-302.test.ts`, E2E 수동 제출 | 없음 |
| `TC-STAB-003` | `qa-412-sealed-bid-freeze-fix.test.ts`, E2E 타임아웃 | 없음 |
| `TC-STAB-004` | `stab-001.test.ts` WP-02, `qa-302.test.ts` | 모달 열린 상태의 추가 타이머 반복 |
| `TC-STAB-005` | `qa-413-black-market-police-raid.test.ts`, E2E 탈출 | 없음 |
| `TC-STAB-006` | `qa-413-black-market-police-raid.test.ts`, E2E 뇌물 | 없음 |
| `TC-STAB-007` | `stab-001.test.ts` WP-03, E2E 체포+새로고침 | 없음 |
| `TC-STAB-008` | `stab-001.test.ts` WP-04, `stab-002.test.ts` QD-04/07 | 6종 각각의 개별 행동 테스트 이름·매핑 |
| `TC-STAB-009` | `stab-001.test.ts` WP-06, `qa-403-dutch-auction.test.ts` | 없음 |
| `TC-STAB-010` | `stab-001.test.ts` WP-06, `qa-403-dutch-auction.test.ts` | 없음 |
| `TC-STAB-011` | `qa-402`, `qa-306`, UI codex, E2E codex | 없음 |
| `TC-STAB-012` | E2E 영어·더치 5라운드 | 반복·다중 브라우저는 후속 |

## 4. QA-INFRA에서 추가한 테스트

| 테스트 | 범위 | 등급 |
| :--- | :--- | :---: |
| `tests/ui/app-flow.test.tsx` | 로비 렌더·룸 진입, 도감 열기/닫기, 암시장 필터, ErrorBoundary, 손상 프로필 복구, 저장 실패 `SAVE_FAILED`, 경찰 모달 실제가치 비노출 | S2/S3 |
| `tests/e2e/auction-flow.spec.ts` | 영어·더치 5라운드, 비밀 봉투 수동 제출·타임아웃 | S4 |
| `tests/e2e/police-raid.spec.ts` | 탈출·뇌물·체포와 새로고침 영속화 | S4 |
| `tests/e2e/codex-a11y.spec.ts` | 30종/6종 필터, axe 기저선, 모바일 390×844 필터 스크롤 | S4 |

## 5. 알려진 누락·중복

- `REQ-NFR-002`는 A11Y-001에서 axe serious·critical 0건과 Lighthouse 접근성 1.00을 DEV 확인했다. 독립 QA 재검증이 남아 있다.
- `REQ-NFR-003` 성능 테스트가 없다. PERF-ASSET-001에서 전송량·LCP 기준선을 추가한다.
- `TC-STAB-001`의 “음수 종료 잔액” 전용 테스트가 아직 없다.
- `TC-STAB-008`은 6종 저주를 한 테스트에서 묶어 검증한다. 개별 저주별 테스트 이름과 매핑이 필요하다.
- 테스트 파일명이 PRD REQ와 직접 대응하지 않는다. `QA-REBASE-001`에서 파일·테스트 제목에 REQ ID를 연결한다.
- 기존 `qa-301`~`qa-413`은 레거시 티켓 이름을 유지한다. 파일 이름 변경은 이번 범위에서 하지 않는다.
