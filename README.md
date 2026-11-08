# Simple Auction Game

웹 기반 싱글플레이 경매 경제 시뮬레이션 프로젝트입니다.

## 사용자와 세션의 시작점

사용자는 문서 경로를 지정할 필요가 없습니다. 원하는 결과와 필요하면 역할 또는 TASK 번호만 전달합니다.

```text
예: 암시장 경제를 고도화해줘.
예: PM으로 다음 릴리즈를 기획해줘.
예: STAB-001의 비밀경매 결함을 구현해줘.
예: STAB-001을 독립 QA해줘.
```

AI 세션은 [`.md/root/AGENTS.md`](./.md/root/AGENTS.md)를 먼저 읽고 역할과 관련 문서를 자동으로 선택합니다.

## 현재 상태

- 현재 버전·마일스톤: `2.3.1` · v2.3.1 `RELEASE_CANDIDATE` (PM 승인 대기)
- 현재 상태와 검증 증거: [`.md/specs/PROJECT_STATE.md`](./.md/specs/PROJECT_STATE.md)
- 제품 요구사항: [`.md/specs/PRD.md`](./.md/specs/PRD.md)
- 결정 로그: [`.md/specs/DECISIONS.md`](./.md/specs/DECISIONS.md)
- 활성 작업 보드: [`.md/root/TASKS.md`](./.md/root/TASKS.md)
- 기능 명세: [`.md/root/FEATURES.md`](./.md/root/FEATURES.md)
- 기술 명세: [`.md/specs/`](./.md/specs/)
- 역할 문서: [`.md/roles/`](./.md/roles/)

현재 판정과 릴리즈 상태는 `.md/root/TASKS.md`와 `.md/specs/PROJECT_STATE.md`를 기준으로 관리합니다.

> 구 `docs/`는 2026-11-08 `.md/`로 이관한 뒤 삭제했습니다. 이관 전 이력은 Git과 [`.md/root/archive/TASKS_PHASE_01.md`](./.md/root/archive/TASKS_PHASE_01.md)에 보존합니다.

## 기술 구성

- React 18
- TypeScript
- Vite
- Zustand
- Tailwind CSS
- Vitest
- LocalStorage 기반 영구 커리어
