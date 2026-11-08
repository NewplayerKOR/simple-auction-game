# Phase 01 완료 기록 — v2.3.1 안정화 및 문서 체계 이관

> **Phase:** 01  
> **기간:** 2026-08-21 ~ 2026-11-08  
> **상태:** `STAB-001` DONE, `DOC-002` DONE, v2.3.1 `RELEASE_CANDIDATE`  
> **보관일:** 2026-11-08

## 1. 완료 TASK 목록

| TASK | 완료일 | 담당 | 결과 | 원문 |
| :--- | :--- | :--- | :--- | :--- |
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
- `DOC-002`: DONE
- v2.3.1: `RELEASE_CANDIDATE`
- Phase 3: `BLOCKED`
- 다음 판단: `REL-001`
