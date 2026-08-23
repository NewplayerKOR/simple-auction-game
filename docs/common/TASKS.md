# 통합 작업 보드

> **버전:** v2.4.0-docs  
> **상태:** ACTIVE  
> **관리자:** PM  
> **최종 수정일:** 2026-08-21

## 1. 현재 마일스톤

| 마일스톤 | 판정 | 비고 |
| :--- | :---: | :--- |
| Phase 1: MVP Core Auction | ARCHIVED | 과거 완료 기록 |
| Phase 2: Career & Dynamic Auction | ARCHIVED_WITH_GAPS | 현재 안정화 회귀 범위에 포함 |
| Phase 2.5: Black Market & Polish | QA_COMPLETED | STAB-001 QA 최종 승인 완료 |
| v2.3.1 Stabilization | RELEASE_CANDIDATE | PM 릴리즈 승인 대기 |
| Phase 3: Real-time Multiplayer PVP | BLOCKED | 안정화와 서버 권위 설계 전 착수 금지 |

## 2. 활성 TASK

| TASK | 우선순위 | 상태 | 오너 | 요약 |
| :--- | :---: | :---: | :--- | :--- |
| [`STAB-001`](../tasks/active/STAB-001.md) | P0 | DONE | PM | QA 최종 승인 완료, PM 릴리즈 판정과 분리 |
| `DOC-001` | P1 | IN_PROGRESS | PM | 문서 자동 라우팅·현재 상태·결정 추적 개편 |
| `QA-REBASE-001` | P1 | BLOCKED | QA | 기존 70개 테스트와 실제 인수 조건의 추적성 재작성 |
| `ARCH-PVP-001` | P2 | BLOCKED | ARCH_DATA | 서버 권위형 Phase 3 사전 아키텍처 |

## 3. STAB-001 준비 결정

| 결정 | 상태 | 차단 대상 |
| :--- | :---: | :--- |
| `DEC-001` 커리어 현금 정산 | APPROVED | 종료 세션 잔액으로 교체 |
| `DEC-002` 경찰 뇌물 비용 | APPROVED | $5,000 + 아이템 시작가 |
| `DEC-003` 체포 페널티 | APPROVED | 세션 현금 전액 몰수 |
| `DEC-004` VIP 티켓 보상 | APPROVED | 골드·다이아 정상 완주 및 지정 업적 |

결정 위치: [`DECISIONS.md`](./DECISIONS.md)

## 4. 현재 결함 백로그

| 이슈 | 심각도 | 연결 Work Package |
| :--- | :---: | :--- |
| 게임 종료 시 커리어 자금 복제 가능성 | P0 | STAB-001/WP-01 — QA_VERIFIED |
| 비밀경매 결과 반복 생성 가능성 | P0 | STAB-001/WP-02 — QA_VERIFIED |
| 경찰 체포 결과 영속화 누락 | P0 | STAB-001/WP-03 — USER_VERIFIED / QA_ACCEPTED |
| 밀수품 6종 저주 행동 미완성 | P0 | STAB-001/WP-04 — QA_VERIFIED |
| 더치 락 실패 시 정지 가능성 | P1 | STAB-001/WP-06 — QA_VERIFIED |
| 더치 AI의 숨겨진 실제가치 참조 | P1 | STAB-001/WP-06 — QA_VERIFIED |
| 3라운드 시장 이벤트 소실 가능성 | P1 | 5라운드 E2E — QA_VERIFIED |
| 버전·30종 표기 불일치 | P1 | STAB-001/WP-08 — QA_VERIFIED |
| `QA-413` 무작위 시작가 비결정성 | P1 | STAB-001/WP-07 — QA_VERIFIED |
| 모바일 도감 필터 세로 글자 배치 | P2 | STAB-001/WP-08 — QA_VERIFIED |

## 5. 문서 개편 완료 조건

- [x] 루트 자동 라우터 생성
- [x] 현재 상태 문서 생성
- [x] 결정 로그 생성
- [x] ARCH_DATA 역할 통합
- [x] 역할별 시작·금지·완료 절차 정의
- [x] TASK 상세 템플릿과 활성 안정화 TASK 생성
- [x] 모든 기존 상세 명세의 상태·권위 헤더 정리
- [x] 전체 내부 링크와 UTF-8 검증
- [ ] `DOC-001`을 QA 확인 후 DONE 처리

## 6. 과거 완료 기록 처리

기존 Phase 1·2·2.5 티켓 번호는 삭제하지 않는다. 다만 상세 증거 없이 번호 범위만 존재하므로 현재 릴리즈 증거로 사용하지 않는다.

- Phase 1: `ARCH-101~103`, `DEV-201~211`, `QA-301~306`, `DB-401~404`, `ART-101~104`, `SND-101~103`
- Phase 2: `DEV-301~311`, `QA-401~411`, `DB-501~504`
- Phase 2.5: `DEV-314~316`, `QA-412~413`, `DB-505`

추후 증거를 복원할 수 있는 티켓만 `docs/tasks/archive/{release}/`로 정식 아카이브한다.

## 7. DOC-001 작업 기록

### 2026-08-21 / PM

- 생성: 루트 자동 라우터, 현재 상태, 결정 로그, 통합 역할 문서, TASK 템플릿, 활성 안정화 TASK
- 개편: 루트·문서 인덱스, 공통 운영 규칙, PRD, 작업 보드, DEV·QA 가이드
- 상태 정리: Architecture, Data Schema, Migrations, Art, Sound 명세의 현재 권위와 검증 한계 표시
- 내부 Markdown 링크 검사: 통과, 누락 0건
- UTF-8 유효성 검사: 프로젝트 Markdown 24개 통과
- 미완료: QA의 문서 구조 독립 확인과 `DOC-001` 최종 승인
