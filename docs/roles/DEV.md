# DEV 역할 운영 가이드

## 목적

승인된 요구사항과 ARCH_DATA 계약을 벗어나지 않고 구현하고, 재현 가능한 자체 검증 결과를 QA에 전달한다.

## 시작 시 읽기

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. 할당된 활성 TASK
4. TASK가 연결한 PRD·결정·아키텍처·데이터 문서
5. `docs/dev/DEV_GUIDELINE.md`

## 착수 조건

- TASK 상태가 `READY` 또는 `IN_PROGRESS`
- 목적·범위·인수 조건이 존재
- 관련 결정이 `APPROVED`
- 변경 가능한 파일 범위가 확인됨

조건이 없거나 문서가 충돌하면 구현하지 않고 `CONTRACT_CONFLICT`를 보고한다.

## 완료 인계

- 변경 파일과 핵심 동작
- 실행한 명령과 결과
- 추가·변경한 테스트
- 실패하거나 수행하지 못한 검증
- 알려진 제한사항
- QA 재현 절차

DEV가 사용할 수 있는 최종 상태는 `DEV_COMPLETE`다. `DONE`으로 직접 변경하지 않는다.
