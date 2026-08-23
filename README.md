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

AI 세션은 루트의 [`AGENTS.md`](./AGENTS.md)를 먼저 읽고 역할과 관련 문서를 자동으로 선택합니다.

## 현재 상태

- 현재 상태와 알려진 결함: [`docs/PROJECT_STATE.md`](./docs/PROJECT_STATE.md)
- 제품 요구사항: [`docs/common/PRD.md`](./docs/common/PRD.md)
- 작업 보드: [`docs/common/TASKS.md`](./docs/common/TASKS.md)
- 결정 로그: [`docs/common/DECISIONS.md`](./docs/common/DECISIONS.md)
- 전체 문서 지도: [`docs/README.md`](./docs/README.md)

현재 판정은 **Phase 2.5 안정화 재검증 필요**이며, Phase 3 실시간 멀티플레이는 안정화 완료 전 착수 보류 상태입니다.

## 기술 구성

- React 18
- TypeScript
- Vite
- Zustand
- Tailwind CSS
- Vitest
- LocalStorage 기반 영구 커리어

