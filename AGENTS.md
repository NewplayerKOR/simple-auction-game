# AGENTS.md - 문서 체계 전환 안내

> **상태:** DEPRECATED (2026-11-08)
> 이 문서의 기존 내용은 구버전 문서 체계(`docs/`)를 기준으로 작성되었다. 더 이상 권위 문서가 아니다.

## 활성 문서 체계

모든 세션과 AI 에이전트는 다음 순서로 `.md/` 문서를 읽는다.

1. `.md/root/AGENTS.md` — 공통 운영 규칙, 역할, 작업 흐름
2. `.md/specs/PROJECT_STATE.md` — 현재 상태와 검증 증거
3. `.md/root/TASKS.md` — 활성 작업 보드
4. `.md/root/FEATURES.md` — 구현·검증된 기능 명세
5. 배정된 역할 문서 — `.md/roles/{ROLE}.md`
6. 기술 명세 — `.md/specs/`

구 `docs/`는 2026-11-08 `.md/`로 이관한 뒤 삭제했다. 이관 전 상세 이력은 Git과 `.md/root/archive/TASKS_PHASE_01.md`에 보존한다.
