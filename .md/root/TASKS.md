# TASKS.md - Single Source of Tasks

> **문서 체계:** `.md` 활성 작업 보드  
> **관리자:** PM  
> **최종 수정일:** 2026-11-08

## 1. 현재 마일스톤

| 마일스톤 | 판정 | 비고 |
| :--- | :---: | :--- |
| Phase 01: v2.3.1 안정화 | `RELEASE_CANDIDATE` | `STAB-001` QA `DONE`, PM 릴리즈 승인 대기 |
| Phase 02: 실시간 멀티플레이 PVP | `BLOCKED` | Phase 01 릴리즈 승인과 서버 권위 설계 전 착수 금지 |
| Phase 00: Phase 1·2·2.5 | `ARCHIVED` | 상세 증거가 없는 과거 티켓 범위. 현재 릴리즈 근거로 사용하지 않음 |

## 2. Active Tasks (진행 중인 작업)

(현재 진행 중인 작업 없음)

## 3. Backlog (대기 중인 작업)

### [PM]

- [ ] `REL-001` **v2.3.1 릴리즈 승인 판정** — P1, Phase 01
  - 목표: 완료 TASK, 사용자 확인 범위, 미검증 제한사항을 종합해 `RELEASE_CANDIDATE -> PM_RELEASE_APPROVED` 또는 보류 사유를 결정한다.
  - 선행: `STAB-001` `DONE`, `PROJECT_STATE`의 QA 증거와 제한사항 확인.
  - DoD: 승인 시 `.md/root/TASKS.md`와 `.md/specs/PROJECT_STATE.md`의 마일스톤을 갱신하고, 보류 시 남은 조건과 재판정 시점을 기록한다.
  - 참고: `.md/specs/PROJECT_STATE.md`, `.md/root/archive/v2.3.1/STAB-001.md`

### [DEV]

- [!] `ARCH-PVP-001` **서버 권위형 Phase 3 사전 아키텍처** — P2, Phase 02
  - 목표: 서버 권위 FSM, 자금 원장, 재접속·재동기화, 결정론적 이벤트 로그의 사전 계약을 정리한다.
  - 블로커: `REL-001` 승인 전 착수 금지. 서버 권위 계약과 Phase 3 범위 결정이 필요하다.
  - 다음 담당: DEV가 기술 대안을 정리하고 PM이 제품 범위를 승인한다.
  - 해제 조건: Phase 01 릴리즈 승인 + Phase 3 서버 계약 승인.
  - 참고: `.md/specs/PRD.md` 9절, `.md/specs/DECISIONS.md`

### [QA / DevOps]

- [!] `QA-REBASE-001` **테스트와 인수 조건의 추적성 재작성** — P1, Phase 01
  - 목표: 현재 자동화 테스트와 `PRD` 인수 조건·`STAB-001` TC의 추적성 매트릭스를 다시 만든다.
  - 블로커: 기존 70개 테스트 기준과 현재 84개 테스트·인수 조건의 기준 차이를 먼저 정의해야 한다.
  - 다음 담당: QA_DEVOPS가 범위를 재정의하고 PM이 우선순위를 확인한다.
  - 해제 조건: 테스트-AC 추적성 매트릭스와 누락·중복 판정 기록.
  - 참고: `.md/specs/QA_TEST_PLAN.md`, `.md/specs/PRD.md`

## 4. Recent Completions (최근 완료 요약)

| TASK | 완료일 | 담당 | 핵심 결과 | 검증 범위 | 원문 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `DOC-002` | 2026-11-08 | PM | 구 `docs/`의 상태·요구사항·결정·기술 명세를 `.md/`로 이관하고 `docs/` 삭제 | UTF-8·내부 링크·잔여 참조·테스트 84개·빌드 확인 | [`TASKS_PHASE_01.md`](./archive/TASKS_PHASE_01.md) |
| `STAB-001` | 2026-08-21 | QA | v2.3.1 경제·FSM·암시장 계약 안정화, QA 최종 `DONE` | 구 QA 자동화 83/83, 현재 확인 84/84, 5라운드 E2E, 경찰 S4 사용자 확인 | [`v2.3.1/STAB-001.md`](./archive/v2.3.1/STAB-001.md) |

## 5. Phase Archives (Phase별 보관 목록)

| Phase | 보관 파일 | 포함 완료 TASK |
| :--- | :--- | :--- |
| Phase 01 | [`archive/TASKS_PHASE_01.md`](./archive/TASKS_PHASE_01.md) | `STAB-001`, `DOC-002`, `DOC-001` 대체 기록 |

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
