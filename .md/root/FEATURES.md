# FEATURES.md - Feature Registry & Release Notes

> **문서 체계:** `.md` 활성 기능 명세  
> **관리자:** PM  
> **최종 수정일:** 2026-11-08

## 기록 기준

- 구현·검증된 사용자 기능의 현재 명세를 기록한다. 예정 기능과 미완료 요구사항은 `TASKS.md`와 `../specs/PRD.md`에서 관리한다.
- 기능 변경 시 기존 설명을 최신 동작으로 갱신한다. 작업 원문과 상세 검증 이력은 `archive/`에 둔다.
- 검증 범위를 넘어 완료를 주장하지 않는다. 현재 상태와 미검증 범위는 `../specs/PROJECT_STATE.md`를 따른다.

## 1. Feature Catalog (기능 카탈로그)

| 도메인 | 기능 | 현재 동작 | 주요 파일 | 상태 |
| :--- | :--- | :--- | :--- | :--- |
| 세션 | 5라운드 경매 | 플레이어 1명과 AI 3명이 5라운드를 진행하고 현금·진품 가치·시너지·대출을 반영해 순위를 계산한다. | `src/stores/useAuctionStore.ts`, `src/App.tsx` | 구현·QA 검증 |
| 경매 | 잉글리시 호가 | 최고가보다 높은 입찰만 허용하고 잔액을 검사한다. 종료 직전 입찰은 앤티 스나이핑으로 연장한다. | `src/stores/useAuctionStore.ts`, `src/components/auction/` | 구현·QA 검증 |
| 경매 | 4R 비밀 봉투 | 15초 제한, 미입력·잔액 부족은 `0` 기권으로 확정한다. 제출·타임아웃 결과는 한 번만 생성하고 공개 중 재정산하지 않는다. | `src/stores/useAuctionStore.ts`, `src/components/auction/SealedBidModal.tsx` | 구현·QA 검증 |
| 경매 | 더치 역경매 | 가격이 시간에 따라 하락하고, 구매자·잔액·상태 검증 후 락을 확정한다. 바닥가 도달 후 500ms 최종 구매 창을 둔다. | `src/stores/useAuctionStore.ts`, `src/services/aiBotService.ts` | 구현·QA 검증 |
| 룸 | 5개 룸 게이팅 | 브론즈·실버·골드·다이아몬드·암시장의 최소 순자산과 입장료를 검사한다. 암시장은 순자산 또는 VIP 티켓으로 입장한다. | `src/data/constants.ts`, `src/stores/useCareerStore.ts` | 구현·QA 검증 |
| 아이템 | 30종 마스터 아이템 | 일반 4개 룸에 각 6종, 암시장에 6종을 배치한다. 한 게임은 해당 룸 6종 중 5종을 중복 없이 사용한다. | `src/data/masterItems.ts`, `src/types/index.ts` | 구현·QA 검증 |
| 아이템 | 암시장 밀수품 6종 | 각 아이템에 타입이 있는 `curseCode`와 영구 디버프를 매핑하고 해당 행동에서 적용한다. | `src/data/masterItems.ts`, `src/services/contrabandService.ts` | 구현·QA 검증 |
| 커리어 | 자금 정산 | 세션 종료 시 기존 커리어 현금에 더하지 않고 최종 세션 잔액으로 교체한다. 입장료·대출·저주·뇌물을 한 번만 반영한다. | `src/stores/useCareerStore.ts`, `src/services/storageService.ts` | 구현·QA 검증 |
| 커리어 | 순자산·파산·룸 해금 | `careerCash + 보관함 평가액`으로 순자산을 계산하고 파산·룸 게이팅·승급을 같은 원장으로 판정한다. | `src/stores/useCareerStore.ts` | 구현·QA 검증 |
| 커리어 | 복원·위탁 판매 | 복원 확률과 위탁 판매 시장 배수를 적용하고, 밀수품 저주가 해당 계산을 변경한다. | `src/services/`, `src/components/workshop/`, `src/components/consignment/` | 구현·QA 검증 |
| 커리어 | 업적·VIP 티켓 | 업적을 영구 저장하고, 골드·다이아 정상 완주와 `ach-blind-master` 최초 해금에 티켓을 지급한다. | `src/stores/useCareerStore.ts`, `src/data/` | 구현·QA 검증 |
| 암시장 | 경찰 급습 | 15% 기본 확률로 급습하며 5초 안에 탈출·뇌물을 선택한다. 뇌물은 `$5,000 + startingBid`, 체포는 세션 현금 전액 몰수다. | `src/components/auction/PoliceRaidModal.tsx`, `src/stores/` | 구현·QA 검증, S4 사용자 확인 |
| 도감 | 30종 도감·필터 | 전체 30종을 룸별 필터로 조회한다. 모바일에서 필터 6개를 한 줄 수평 스크롤로 표시한다. | `src/components/codex/CodexModal.tsx` | 구현·QA 검증 |
| UI | 로비·경매·결과 화면 | 룸 선택, 경매 진행, 결과 갤러리, 모달 포커스·복귀를 제공한다. 데스크톱·`390x844` 스모크를 확인했다. | `src/components/`, `src/App.tsx` | 구현·부분 검증 |
| 오디오 | Web Audio BGM·SFX | 외부 MP3 없이 Web Audio 합성으로 배경음과 효과음을 재생한다. | `src/services/` | 구현·부분 검증 |
| 영속화 | LocalStorage v2.3.1 | 단일 커리어 저장 키와 단일 작성자로 정산·업적·티켓·통계를 한 번에 저장한다. 손상 데이터는 안전 초기화한다. | `src/services/storageService.ts` | 구현·QA 검증, 저장 실패 주입 미검증 |
| 표기 | 버전·아이템 수 | 패키지·UI가 `2.3.1`을 사용하고 로비·도감·푸터가 전체 30종을 표시한다. | `package.json`, `src/version.ts`, `src/components/` | 구현·QA 검증 |

## 2. 현재 검증 기준선

- 최신 PM 확인 실행: 17개 테스트 파일, 84개 테스트 통과, 프로덕션 빌드 통과 (2026-11-08)
- 이관된 독립 QA 증거: `STAB-001`의 `QA-413` 20/20, 전체 회귀 10/10, 5라운드 E2E, 경찰 S4 사용자 확인
- 상세 증거와 미검증 범위: `../specs/PROJECT_STATE.md`
- 이 기능 명세는 새로운 QA 승인이 아니며, 릴리즈 승인은 `REL-001`의 PM 판정을 따른다.

## 3. Changelog (변경 이력)

### v2.3.1 (2026-08-21)

- 커리어 현금을 종료 세션 잔액으로 교체하고 `sessionId` 기반 멱등 정산을 적용했다.
- 비밀경매 수동 제출·타임아웃을 단일 확정 FSM으로 고정했다.
- 경찰 탈출·뇌물·체포 결과를 커리어 저장소에 영속화했다.
- 밀수품 6종에 타입 기반 `curseCode`와 행동 계약을 적용했다.
- VIP 티켓 지급·소모 조건을 골드·다이아 정상 완주와 `ach-blind-master` 최초 해금으로 제한했다.
- 더치 검증 후 락, 공개 정보 기반 AI, 바닥가 500ms 최종 창을 적용했다.
- 버전 `2.3.1`과 전체 30종 표기를 패키지·UI·문서에 통일했다.

### v2.3.0 (2026-08-20)

- 암시장 룸과 밀수품 6종, 경찰 급습을 추가했다.
- 4R 비밀 봉투 타임아웃 무한 대기 방지 스키마를 보완했다.
- 블랙 VIP 티켓 필드를 추가했다.

### v2.2.0 (2026-08-20)

- 복원 실패, 극단 시장 이벤트, 스마트 AI를 추가했다.

### v2.1.0 (2026-08-20)

- 엄격한 경제 손실, 파산, 반응형 UI를 적용했다.

### v2.0.0 (2026-08-20)

- 룸 티어, 영구 커리어 경제, 더치 역경매를 도입했다.

### v1.3.0 (2026-08-20)

- 위작, 비밀 봉투, 대출, 도감을 추가했다.

### v1.2.0 (2026-08-20)

- 시장 이벤트, 찬스 카드, 난이도 체계를 추가했다.

### v1.1.0 (2026-08-20)

- 숨겨진 실제가치, 시너지, AI 봇을 추가했다.

### v1.0.0 (2026-08-20)

- 초기 도메인·아이템 스키마와 기본 경매 흐름을 구성했다.
