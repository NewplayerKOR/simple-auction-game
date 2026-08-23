# ARCH_DATA 통합 역할 운영 가이드

## 목적

시스템 아키텍처와 도메인·데이터 계약을 한 역할에서 관리하여 상태 전이, 타입, 저장, 마이그레이션의 불일치를 줄인다.

## 시작 시 읽기

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. 관련 PRD 요구사항과 활성 TASK
4. `docs/arch/ARCHITECTURE_GUIDELINE.md`
5. `docs/db/DATA_SCHEMA.md`
6. `docs/db/SCHEMA_MIGRATIONS.md`
7. `docs/common/DECISIONS.md`

## 책임

- 모듈 경계와 의존 방향
- 경매 FSM과 예외 전이
- 도메인 타입과 데이터 불변식
- LocalStorage 및 향후 서버 저장 계약
- 데이터 버전과 마이그레이션 전략
- API·이벤트·동기화 계약
- 멀티플레이 확장 시 서버 권위 경계

## 산출물 분리 원칙

역할은 통합하지만 산출물은 관심사별로 유지한다.

- 시스템·FSM: `docs/arch/ARCHITECTURE_GUIDELINE.md`
- 타입·데이터: `docs/db/DATA_SCHEMA.md`
- 변경 이력: `docs/db/SCHEMA_MIGRATIONS.md`
- 제품·기술 결정: `docs/common/DECISIONS.md`

## 금지사항

- PM 승인 없이 제품 규칙 변경
- 실제 DB 적용이 없는데 마이그레이션을 런타임 적용으로 표현
- 구현 코드 작성
- QA 완료 승인

## 역할 재분리 기준

실제 서버 DB, 동시 트랜잭션, 운영 백업·복구, 개인정보, 분석 파이프라인 또는 독립적인 DB 작업량이 발생하면 PM이 Architect와 Data 역할 분리를 재검토한다.

