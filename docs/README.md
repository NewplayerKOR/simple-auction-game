# 문서 지도 및 자동 라우팅 안내

> 사용자가 파일명을 지정하는 방식이 아니라 `AGENTS.md`가 역할과 TASK에 따라 필요한 문서를 자동으로 선택한다.

## 1. 가장 먼저 읽을 문서

| 순서 | 문서 | 목적 |
| :---: | :--- | :--- |
| 1 | [`../AGENTS.md`](../AGENTS.md) | 역할 판정, 권위 순서, 세션 시작·복구 절차 |
| 2 | [`PROJECT_STATE.md`](./PROJECT_STATE.md) | 현재 구현·검증·결함·차단 상태 |
| 3 | [`common/TASKS.md`](./common/TASKS.md) | 활성 작업과 역할별 상태 |
| 4 | 역할 문서 | 역할의 권한·금지·완료 절차 |
| 5 | 활성 TASK | 실제 작업 범위와 인수 조건 |

## 2. 사용자가 지정해야 하는 정보

사용자는 원하는 결과만 말해도 된다. 역할과 TASK를 알고 있다면 추가로 지정할 수 있다.

- 목표만 제공: PM이 기본 진입점이 되어 분류
- 역할 제공: 해당 역할 절차로 시작
- TASK ID 제공: TASK와 연결 문서를 우선 읽음

문서 경로 지정은 사용자의 책임이 아니다.

## 3. 역할별 라우팅

| 역할 | 필수 역할 문서 | 작업에 따라 읽을 상세 문서 |
| :--- | :--- | :--- |
| PM | [`roles/PM.md`](./roles/PM.md) | PRD, TASKS, DECISIONS |
| ARCH_DATA | [`roles/ARCH_DATA.md`](./roles/ARCH_DATA.md) | Architecture, Data Schema, Migrations |
| DEV | [`roles/DEV.md`](./roles/DEV.md) | 활성 TASK가 연결한 요구사항·계약·개발 지침 |
| QA | [`roles/QA.md`](./roles/QA.md) | 활성 TASK, QA Plan, DEV 인계 |
| ART | 기존 Art 명세 | 관련 TASK와 데이터 명세 |
| SOUND | 기존 Sound 명세 | 관련 TASK |

## 4. 문서 구조

```text
docs/
├── README.md                         # 문서 지도
├── PROJECT_STATE.md                  # 현재 사실과 세션 복구 지점
├── common/
│   ├── DOCUMENTATION_GUIDE_AND_RULES.md
│   ├── PRD.md
│   ├── TASKS.md
│   ├── DECISIONS.md
│   └── GLOSSARY.md
├── roles/
│   ├── PM.md
│   ├── ARCH_DATA.md
│   ├── DEV.md
│   └── QA.md
├── tasks/
│   ├── TASK_TEMPLATE.md
│   ├── active/
│   └── archive/
├── arch/                             # ARCH_DATA 소유 시스템 상세 명세
├── db/                               # ARCH_DATA 소유 데이터 상세 명세
├── dev/                              # 개발 상세 제약
├── qa/                               # QA 테스트 계획
├── art/                              # 아트 명세와 원본 에셋
└── sound/                            # 사운드 명세
```

## 5. 문서 종류별 책임

| 문서 | 답해야 하는 질문 |
| :--- | :--- |
| `PROJECT_STATE` | 지금 실제 상태는 무엇인가? |
| `PRD` | 무엇을 왜 만들어야 하는가? |
| `DECISIONS` | 충돌 사항을 어떤 이유로 결정했는가? |
| `TASKS` | 누가 무엇을 어떤 상태로 진행하는가? |
| 활성 TASK | 정확한 범위·인수 조건·인계 증거는 무엇인가? |
| Architecture/Data | 어떤 계약과 불변식을 지켜야 하는가? |
| QA Plan | 어떻게 독립적으로 검증하는가? |

같은 내용을 여러 문서에 복사하지 않는다. 각 문서는 ID와 링크로 연결한다.

## 6. 활성 상세 작업

- [`tasks/active/STAB-001.md`](./tasks/active/STAB-001.md): v2.3.1 경제·FSM·암시장 계약 안정화

완료된 작업은 TASK의 증거를 보존한 상태로 `tasks/archive/{release}/`에 이동한다.

