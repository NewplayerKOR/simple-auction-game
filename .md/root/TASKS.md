# TASKS.md - Single Source of Tasks

> **문서 체계:** `.md` 활성 작업 보드  
> **관리자:** PM  
> **최종 수정일:** 2026-11-09

## 1. 현재 마일스톤

| 마일스톤 | 판정 | 비고 |
| :--- | :---: | :--- |
| Phase 01: v2.3.1 안정화 | `RELEASE_CANDIDATE` | `STAB-001` QA `DONE`. `STAB-002`·`PERF-ASSET-001`·`A11Y-001` DEV_COMPLETE·독립 QA 대기. `QA-INFRA-001`·`REPO-001` DONE. `DOC-003` 대기. `REL-001` 보류 |
| Phase 02: 실시간 멀티플레이 PVP | `BLOCKED` | Phase 01 릴리즈 승인과 서버 권위 설계 전 착수 금지 |
| Phase 00: Phase 1·2·2.5 | `ARCHIVED` | 상세 증거가 없는 과거 티켓 범위. 현재 릴리즈 근거로 사용하지 않음 |

## 2. Active Tasks (진행 중인 작업)

(현재 진행 중인 작업 없음)

## 3. Backlog (대기 중인 작업)

> **진행 순서:** 1번째 `STAB-002` 완료 → 2번째 `QA-INFRA-001` 완료 → 3번째 `PERF-ASSET-001` 완료 → 4번째 `A11Y-001` 완료 → 5번째 `REPO-001` 완료 → 6번째 `DOC-003` → 7번째 `QA-REBASE-001` → 8번째 `REL-001` → 9번째 `ARCH-PVP-001`
> 6번째 `DOC-003`은 1~5번째 결과를 반영한 뒤 착수한다.
> `STAB-002`·`PERF-ASSET-001`·`A11Y-001`은 DEV_COMPLETE이며 독립 QA_DEVOPS 검증 대기다. `QD-28`은 후속 TASK 후보로 분리했다.

### [PM]

- [ ] `REL-001` **v2.3.1 릴리즈 승인 판정** — P1, Phase 01
  - 진행 순서: 8번째 (1~7번째 결과 확인 후)
  - 목표: 완료 TASK, 사용자 확인 범위, 미검증 제한사항을 종합해 `RELEASE_CANDIDATE -> PM_RELEASE_APPROVED` 또는 보류 사유를 결정한다.
  - 선행: `STAB-001` `DONE`, `STAB-002`·`QA-INFRA-001`·`PERF-ASSET-001`·`A11Y-001`·`REPO-001`·`DOC-003`·`QA-REBASE-001` 결과 확인.
  - DoD: 승인 시 `.md/root/TASKS.md`와 `.md/specs/PROJECT_STATE.md`의 마일스톤을 갱신하고, 보류 시 남은 조건과 재판정 시점을 기록한다.
  - 2026-11-09 PM 판정: **보류**. 사유: 2026-11-09 분석에서 P1 결함 9건(`QD-01`~`QD-09`)과 QA·DevOps P1 과제를 확인했다. 재판정: 1~7번째 TASK 완료 후.
  - 참고: `.md/specs/PROJECT_STATE.md`, `.md/root/archive/v2.3.1/STAB-001.md`

- [ ] `DOC-003` **문서·스키마·추적성 정합** — P2, Phase 01
  - 진행 순서: 6번째 (`STAB-002`·`QA-INFRA-001` 결과 반영 후)
  - 목표: 코드·데이터 계약 변경을 문서에 반영하고, PRD 요구사항과 테스트의 추적성 기준을 고정한다.
  - 담당: PM(문서 권위·요구사항), DEV(기술 명세), QA_DEVOPS(검증·링크·UTF-8).
  - 범위:
    - `roomTiers.ts`의 손상된 최소 순자산 주석(`$15,000`, `$60,000`)과 `types/index.ts`의 시너지 주석(`0.35`)을 실제 값으로 정정한다.
    - `DATA_SCHEMA.md`의 `PoliceRaidState` 필드명과 `Item` 필수·선택 필드를 실제 타입과 일치시킨다.
    - `ARCHITECTURE.md`의 타이머 정리·단일 저장 작성자 설명을 실제 구현과 일치시킨다.
    - `QA_TEST_PLAN.md` 기준선(84개)과 `QA-REBASE-001` 매트릭스를 연결하고, “음수 종료 잔액” AC의 테스트 위치를 명시한다.
    - `README.md`의 실행·검증·배포 절차를 최신 `REPO-001` 결과와 대조하고, README가 소유한 절차는 문서에서 링크로 연결한다.
  - 선행: `STAB-002`·`QA-INFRA-001` 결과. `QA-REBASE-001`의 매트릭스 초안을 참조한다.
  - DoD: 문서-코드 필드·상수 불일치 0건, 내부 링크 유효, UTF-8, `QA_TEST_PLAN`의 TC↔테스트 매트릭스 링크, 변경 계약의 근거 파일 기록.
  - 참고: `.md/specs/ARCHITECTURE.md`, `.md/specs/DATA_SCHEMA.md`, `.md/specs/QA_TEST_PLAN.md`

### [DEV]

- [!] `ARCH-PVP-001` **서버 권위형 Phase 3 사전 아키텍처** — P2, Phase 02
  - 진행 순서: 9번째 (Phase 02, 8번째 릴리즈 승인 후)
  - 목표: 서버 권위 FSM, 자금 원장, 재접속·재동기화, 결정론적 이벤트 로그의 사전 계약을 정리한다.
  - 블로커: `REL-001` 승인 전 착수 금지. 서버 권위 계약과 Phase 3 범위 결정이 필요하다.
  - 다음 담당: DEV가 기술 대안을 정리하고 PM이 제품 범위를 승인한다.
  - 해제 조건: Phase 01 릴리즈 승인 + Phase 3 서버 계약 승인.
  - 참고: `.md/specs/PRD.md` 9절, `.md/specs/DECISIONS.md`

### [QA / DevOps]

- [!] `QA-REBASE-001` **테스트와 인수 조건의 추적성 재작성** — P1, Phase 01
  - 진행 순서: 7번째 (`DOC-003` 완료 후)
  - 목표: 현재 자동화 테스트와 `PRD` 인수 조건·`STAB-001` TC의 추적성 매트릭스를 다시 만든다.
  - 선행: `QA-INFRA-001`의 테스트 타입·실행 기준, `DOC-003`의 요구사항 ID 정합.
  - 블로커: 기존 70개 테스트 기준과 현재 134개 테스트·인수 조건의 기준 차이를 먼저 정의해야 한다. 수동 S4 의존도 함께 정리한다.
  - 다음 담당: QA_DEVOPS가 매트릭스 초안을 만들고 PM이 우선순위를 확인한다.
  - 해제 조건: PRD REQ ↔ TC-STAB ↔ 테스트 파일 매트릭스, 누락·중복 판정, `QA-INFRA-001` typecheck·E2E 기준선 기록.
  - 참고: `.md/specs/QA_TEST_PLAN.md`, `.md/specs/PRD.md`

## 4. Recent Completions (최근 완료 요약)

| TASK | 완료일 | 담당 | 핵심 결과 | 검증 범위 | 원문 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `REPO-001` | 2026-11-09 | QA_DEVOPS | Node 26·CI/CD·배포 위생, 추적 산출물 분리, audit 0, 루트·하위 경로 검증 | fresh clone, Vitest 134개, E2E 19개, build, Lighthouse SEO 1.00, 이미지 404 0 | [`TASKS_PHASE_01.md`](./archive/TASKS_PHASE_01.md) |
| `A11Y-001` | 2026-11-09 | DEV | 핵심 흐름 접근성·실수 방지 UX, axe serious·critical 0, Lighthouse 접근성 1.00 | 21개 파일 134개 테스트·E2E 19개·키보드 5라운드·모달 포커스·확인 모달·reduced-motion·오디오 영속화 | [`TASKS_PHASE_01.md`](./archive/TASKS_PHASE_01.md) |
| `PERF-ASSET-001` | 2026-11-09 | DEV | 이미지·폰트·번들 예산 최적화, public 75.14 MB → 1.85 MB | 20개 파일 126개 테스트·E2E 13개·typecheck·build, 로비 441.4 KiB·경매 추가 176.0 KiB, Lighthouse 0.96~1.00 | [`TASKS_PHASE_01.md`](./archive/TASKS_PHASE_01.md) |
| `QA-INFRA-001` | 2026-11-09 | QA_DEVOPS | 테스트 포함 타입 검사 0오류, Vitest 121개·Playwright E2E 11개, 커버리지 기준선, CI 워크플로 | 19개 파일 121개 10회 반복, E2E 11개, coverage 74.6%, axe 기저선 | [`TASKS_PHASE_01.md`](./archive/TASKS_PHASE_01.md) |
| `STAB-002` | 2026-11-09 | DEV | P1 9건과 동반 P2 구현·자체 검증, `DEV_COMPLETE` | 18개 파일 114개 테스트·빌드·손상 프로필·시세·감정 UI 확인, 독립 QA 대기 | [`TASKS_PHASE_01.md`](./archive/TASKS_PHASE_01.md) |

## 5. Phase Archives (Phase별 보관 목록)

| Phase | 보관 파일 | 포함 완료 TASK |
| :--- | :--- | :--- |
| Phase 01 | [`archive/TASKS_PHASE_01.md`](./archive/TASKS_PHASE_01.md) | `STAB-001`, `STAB-002`, `QA-INFRA-001`, `PERF-ASSET-001`, `A11Y-001`, `REPO-001`, `DOC-002`, `DOC-001` 대체 기록 |

## 6. Historical Ticket Ranges (상세 증거 없는 과거 기록)

기존 Phase 1·2·2.5 티켓 번호는 삭제하지 않는다. 다만 상세 증거 없이 번호 범위만 존재하므로 현재 릴리즈 증거로 사용하지 않는다.

- Phase 1: `ARCH-101~103`, `DEV-201~211`, `QA-301~306`, `DB-401~404`, `ART-101~104`, `SND-101~103`
- Phase 2: `DEV-301~311`, `QA-401~411`, `DB-501~504`
- Phase 2.5: `DEV-314~316`, `QA-412~413`, `DB-505`

## 7. 결정과 참조

- 제품 요구사항: [`../specs/PRD.md`](../specs/PRD.md)
- 결정 로그: [`../specs/DECISIONS.md`](../specs/DECISIONS.md)
- 현재 상태: [`../specs/PROJECT_STATE.md`](../specs/PROJECT_STATE.md)
- 기능 명세: [`FEATURES.md`](./FEATURES.md)
- 기술 명세: [`../specs/`](../specs/)
- TASK 기록 형식: 이 파일의 Backlog 항목과 작업 기록, 그리고 [`AGENTS.md`](./AGENTS.md)의 TASK 생성 기준을 따른다.

## 8. 작업 기록

### 2026-11-08 / PM / 문서 체계 이관

- 확인한 사실: 구 `docs/`의 현재 상태·TASK·PRD·결정·기술 명세를 `.md/`로 이관해야 하며, 구 `docs/`는 삭제 대상이다. `docs/art/asset` 58개는 `public/assets` 58개와 SHA-256이 모두 일치해 런타임 에셋 손실 없이 삭제할 수 있다.
- 변경한 파일: `.md/root/`와 `.md/specs/`의 활성 문서, 역할 문서, 루트 `AGENTS.md`·`README.md`
- 실행한 명령: `npm.cmd test`, `npm.cmd run build`, 에셋 SHA-256 비교, 문서 링크·UTF-8 검사
- 결과: 테스트 17개 파일 84개 통과, 프로덕션 빌드 통과, 에셋 58/58 일치
- 미검증 범위: 문서 이관 자체의 독립 QA, 브라우저 E2E 재실행, v2.3.1 릴리즈 승인
- 결함·충돌: 기존 `DEC-008`의 QA 전용 `DONE` 규칙은 `GOV-002`로 대체됨. `DEC-006`의 `ARCH_DATA` 역할은 `GOV-003`으로 대체됨.
- 다음 시작 지점: PM이 `REL-001`로 v2.3.1 릴리즈 승인 여부를 판정한다.

### 2026-11-08 / PM / 이관 구조 정정

- 사용자 피드백: 이관 문서가 많고 기존 `.md` 양식을 벗어남.
- 변경: `PROJECT_STATE.md`, `PRD.md`, `DECISIONS.md`를 `.md/specs/`로 이동하고 `TASK_TEMPLATE.md`와 `.md/README.md`를 삭제했다.
- TASK 기록: 별도 템플릿 없이 `AGENTS.md`의 TASK 생성 기준과 이 파일의 항목·작업 기록 형식을 사용한다.
- 다음 시작 지점: 변경 후 링크·UTF-8을 재검사하고 `REL-001` 판정을 유지한다.

### 2026-11-09 / QA_DEVOPS / 분석 결과 TASK 할당

- 확인한 사실: 2026-11-08 분석 실행에서 현재 리비전 `npm.cmd test` 17개 파일 84개 테스트 통과, `npm.cmd run build` 통과(JS 352.60 kB, CSS 49.84 kB). 테스트를 타입 검사에 포함하면 12개 오류가 발생했고, 브라우저 로비·경매 콘솔 오류는 0건이었다. 자산은 public 75.14 MB·미사용 4개 6.1 MB이며, 경매 진입 누적 전송은 14.45 MB였다. 손상된 룸 티어를 주입하면 백지 화면과 `TypeError`가 재현됐다.
- 변경한 파일: `.md/root/TASKS.md`, `.md/specs/PROJECT_STATE.md`만 변경했다. 제품 코드·테스트·TASK 완료 상태는 변경하지 않았다.
- 실행한 명령: `npm.cmd test`, `npm.cmd run build`, 테스트 포함 임시 타입 검사, 자산 참조·크기 감사, Lighthouse(로비·경매), 브라우저 손상 프로필 재현, `git status --short`.
- 결과: `STAB-002`, `QA-INFRA-001`, `PERF-ASSET-001`, `A11Y-001`, `REPO-001`, `DOC-003`을 Backlog에 등록하고 담당·범위·DoD·선행 조건을 기록했다. 각 TASK와 `REL-001`·`ARCH-PVP-001`에 `진행 순서: 1~9번째`를 별도 표기하고 Backlog 상단에 전체 순서를 요약했다. `QA-REBASE-001`의 선행·해제 조건을 `QA-INFRA-001`·`DOC-003`과 연결했고, `PROJECT_STATE`의 현재 작업·다음 시작 지점을 갱신했다.
- 미검증 범위: 분석 후 제품 코드 수정과 수정 후 재검증은 수행하지 않았다. P2 전체 항목의 개별 TASK 분리와 `REL-001` 릴리즈 판정은 PM 판단이 필요하다.
- 결함·충돌: 분석에서 P1 결함 9건(QD-01~09)과 QA·DevOps P1 과제를 확인했다. `QD-04`(탈출 대출 상환), `QD-08`(감정 비용), `QD-09`(보존 상태 평가)은 PM 제품 결정 전 해당 항목을 완료할 수 없다. `REL-001` 판정 전 `STAB-002` 등 후속 TASK 결과를 확인해야 한다.
- 다음 시작 지점: PM이 3건 제품 결정과 TASK 우선순위를 확정한다. QA_DEVOPS는 `QA-INFRA-001`·`REPO-001`을, DEV는 `STAB-002`의 결정 불필요 항목을 착수할 수 있다. `A11Y-001`·`PERF-ASSET-001`은 DEV와 QA_DEVOPS가 병행한다.

### 2026-11-09 / PM / STAB-002 제품 결정 및 REL-001 보류

- 확인한 사실: `QD-04`는 `escapePoliceRaid`가 `loanRepaymentAmount` 없이 `endingCash: user.cash`를 정산하는 것을 확인했다. `QD-08`은 `Item.appraisalCost`가 $300~$5,000으로 차등되어 있지만 store/UI가 상수 $500만 사용하는 것을 확인했다. `QD-09`는 `finishGame` 순위가 원본 `realValue`를 쓰고 보관함·위탁은 보존 상태·잭팟 배수를 적용하며, 위탁 모달이 배수를 다시 적용하는 것을 확인했다.
- 변경한 파일: `.md/specs/DECISIONS.md`, `.md/root/TASKS.md`, `.md/specs/PROJECT_STATE.md`, `.md/specs/PRD.md`, `.md/specs/ARCHITECTURE.md`, `.md/specs/DATA_SCHEMA.md`, `.md/root/FEATURES.md`
- 실행한 명령: 코드·테스트 근거 확인, `public/assets` 75.14 MB·미사용 아이템 4개 참조 0 확인, `git status --short`
- 결과: `DEC-009`(탈출 시 대출 상환), `DEC-010`(아이템별 감정 비용), `DEC-011`(보존 상태·잭팟 단일 평가)을 `APPROVED`로 기록했다. `STAB-002`의 `QD-04`·`QD-08`·`QD-09` 블로커를 해제했다. `REL-001`은 후속 P1 결과 전까지 보류로 판정했다.
- TASK 우선순위: `STAB-002` → `QA-INFRA-001` → `PERF-ASSET-001` → `A11Y-001` → `REPO-001` → `DOC-003` → `QA-REBASE-001` → `REL-001` → `ARCH-PVP-001` 순서를 승인했다. `STAB-002`의 동일 파일 P2 동반 범위는 같은 TASK에 포함하고 `QD-70`~`QD-72`는 별도 후속 후보로 유지한다.
- 미검증 범위: 제품 코드 수정과 수정 후 테스트·브라우저 검증은 수행하지 않았다. 12개 테스트 타입 오류와 자산·성능 수치는 QA_DEVOPS 분석 기록을 근거로 사용했다.
- 결함·충돌: `DEC-009`~`DEC-011`과 기존 `DEC-001`~`DEC-004`는 충돌하지 않는다. `REL-001` 보류와 `RELEASE_CANDIDATE` 상태는 일치한다.
- 다음 시작 지점: DEV가 `STAB-002`의 `QD-01`부터 착수하고, QA_DEVOPS는 `QA-INFRA-001`·`REPO-001`을 병행한다. PM은 1~7번째 TASK 결과를 확인한 뒤 `REL-001`을 재판정한다.

### 2026-11-09 / QA_DEVOPS / QA-INFRA-001 테스트 기반 구축

- 확인한 사실: 현재 리비전은 `STAB-002` DEV 변경을 포함하며 Vitest 18개 파일 114개 테스트가 통과했다. 테스트는 `tsconfig.app.json`의 `include: ["src"]` 밖이라 타입 검사되지 않았고, 테스트 포함 시 12개 타입 오류가 있었다. Node 26의 실험적 `localStorage` 전역과 jsdom 환경이 충돌해 UI 테스트에는 메모리 스토리지 폴리필이 필요했다.
- 변경한 파일: `package.json`, `package-lock.json`, `tsconfig.test.json`(신규), `vitest.config.ts`(신규), `vitest.setup.ts`(신규), `playwright.config.ts`(신규), `vite.e2e.config.ts`(신규), `.github/workflows/qa.yml`(신규), `tests/ui/app-flow.test.tsx`(신규), `tests/e2e/helpers.ts`(신규), `tests/e2e/auction-flow.spec.ts`(신규), `tests/e2e/police-raid.spec.ts`(신규), `tests/e2e/codex-a11y.spec.ts`(신규), 기존 테스트 `qa-301/302/306/401/402/403/404/408/409/410/412/413`, `tests/stab-002.test.ts`, `.md/specs/QA_TEST_PLAN.md`, `.md/specs/QA_TRACEABILITY_DRAFT.md`(신규), `.md/root/TASKS.md`.
- 실행한 명령: `npm run typecheck`, `npm test`, `npm test` 10회 반복, `npm run test:coverage`, `npm run test:e2e`, `npm run build`, `npm ci --dry-run --legacy-peer-deps`.
- 결과: 타입 검사 0오류. Vitest 19개 파일 121개 테스트 통과(10회 반복 실패 0, skip·xfail 0). Playwright E2E 11개 통과(영어·더치 5라운드, 비밀 봉투 제출·타임아웃, 경찰 3결과+새로고침, 30종/6종 도감, 모바일 390×844, axe 기저선). 커버리지 문장 74.6%, 분기 58.71%, 함수 65.1%, 줄 76.73%. 프로덕션 빌드 통과.
- axe 판정: 로비·도감에서 알려진 `button-name` critical 1건이 남아 있어 `QA-INFRA`는 “새 critical 0건” 기저선으로 기록했다. `A11Y-001`에서 `button-name`을 해소하고 critical 0건으로 강화해야 한다.
- CI: `.github/workflows/qa.yml`에 `npm ci --legacy-peer-deps`→typecheck→coverage→build→Playwright install→E2E→artifact 업로드를 구성했다. 실제 GitHub Actions 원격 실행은 아직 미검증이며 `REPO-001`에서 첫 PR로 확인한다.
- 미검증 범위: 원격 CI 실행, axe serious·critical 전체 0건(A11Y-001), 전체 접근성 수동 검증, 다중 브라우저·장기 랜덤 반복, 성능 예산(PERF-ASSET-001).
- 결함·충돌: 제품 결함은 새로 발견하지 않았다. `QD-28`(시드 RNG·이벤트 로그)은 후속 TASK 후보로 유지한다. Node 26의 `localStorage` 경고는 CI Node 22 고정과 REPO-001에서 정리한다.
- 상태 변경: `QA-INFRA-001` `[ ] -> [x]`. 상세 원문은 `.md/root/archive/TASKS_PHASE_01.md` 7절에 보관했다.
- 다음 시작 지점: `PERF-ASSET-001`과 `A11Y-001`을 병행 착수한다. `REPO-001`은 `QA-INFRA-001`의 스크립트를 CI에 연결하고 원격 실행을 확인한다.

### 2026-11-09 / QA_DEVOPS / REPO-001 저장소·CI/CD·배포 위생

- 확인한 사실: Git이 `node_modules` 8,414개·`dist` 61개·`*.tsbuildinfo` 2개를 추적하고 `.gitignore`가 없었다. `npm audit`은 개발 의존성 6건(중간 4·높음 2)을 보고했고, 로컬은 Node 26.13.0·npm 11.20.0, CI는 Node 22였다. 런타임 이미지 경로가 `/assets/...` 루트 절대 경로라 하위 경로 배포에서 404가 발생할 수 있었다. favicon·robots·meta description이 없었다.
- 변경한 파일: `.gitignore`(신규), `.nvmrc`(신규), `.env.example`(신규), `package.json`, `package-lock.json`, `vercel.json`(신규), `index.html`, `public/favicon.svg`(신규), `public/robots.txt`(신규), `vite.config.ts`, `src/vite-env.d.ts`(신규), `src/services/assetService.ts`, `src/data/masterItems.ts`·`masterBots.ts`·`masterAchievements.ts`·`masterEvents.ts`·`chanceCards.ts`, `src/stores/useAuctionStore.ts`, `src/components/` 5개 파일, `scripts/verify-deployment.mjs`(신규), `vitest.setup.ts`, `.github/workflows/qa.yml`, `README.md`, `.md/specs/PROJECT_STATE.md`, `.md/specs/DECISIONS.md`, `.md/specs/QA_TEST_PLAN.md`, `.md/specs/QA_TRACEABILITY_DRAFT.md`, `.md/root/archive/TASKS_PHASE_01.md`.
- 실행한 명령: `git rm -r --cached node_modules dist`, `git rm --cached *.tsbuildinfo`, `npm ci`, `npm run typecheck`, `npm test`, `npm run test:coverage`, `npm run test:e2e`, `npm run build`, `npm run build:subpath`, `npm run check:assets`, `npm audit`, `npm audit --omit=dev`, `npm run verify:deploy -- <루트·하위 경로 URL>`, Lighthouse 13.6.0 SEO.
- 결과: Node 26·npm 11 고정, 테스트 Web Storage 경고 제거, audit 전체·프로덕션 0건, Vitest 21개 파일 134개·E2E 19개 통과, 타입 검사 0오류, 루트·하위 경로 preview 이미지 404 0건, Lighthouse SEO 1.00, 추적 산출물 0건. Vite 6.4.5·Vitest 4.1.12·`@vitejs/plugin-react` 4.7.0·`@types/node` 26.6.6을 적용했다.
- 미검증 범위: GitHub Actions 원격 실행은 push 후 확인한다. Vercel 프로젝트가 pause 상태여서 실제 Vercel 보안 헤더·CDN·캐시 검증은 재개 후로 미룬다. 이는 저장소 오류가 아니다.
- 결함·충돌: `assetUrl()`이 Vite 밖 Playwright 테스트 프로세스에서 `import.meta.env`가 없어 실패하는 문제를 확인해 optional env 처리로 수정했다. `DEC-012`로 Node 26·배포 경로 정책을 기록했다.
- 상태 변경: `REPO-001` `[ ] -> [x]`. 상세 원문은 `.md/root/archive/TASKS_PHASE_01.md` 10절에 보관했다.
- 다음 시작 지점: `DOC-003`에서 문서·스키마·추적성을 정합한 뒤 `QA-REBASE-001`을 해제한다. PM은 1~7번째 TASK 결과를 확인한 뒤 `REL-001`을 재판정한다.
