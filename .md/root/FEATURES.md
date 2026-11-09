# FEATURES.md - Feature Registry & Release Notes

> **문서 체계:** `.md` 활성 기능 명세  
> **관리자:** PM  
> **최종 수정일:** 2026-11-09

## 기록 기준

- 구현·검증된 사용자 기능의 현재 명세를 기록한다. 예정 기능과 미완료 요구사항은 `TASKS.md`와 `../specs/PRD.md`에서 관리한다.
- 기능 변경 시 기존 설명을 최신 동작으로 갱신한다. 작업 원문과 상세 검증 이력은 `archive/`에 둔다.
- 검증 범위를 넘어 완료를 주장하지 않는다. 현재 상태와 미검증 범위는 `../specs/PROJECT_STATE.md`를 따른다.

## 1. Feature Catalog (기능 카탈로그)

| 도메인 | 기능 | 현재 동작 | 주요 파일 | 상태 |
| :--- | :--- | :--- | :--- | :--- |
| 세션 | 5라운드 경매 | 플레이어 1명과 AI 3명이 5라운드를 진행하고 현금·진품 가치·시너지·대출을 반영해 순위를 계산한다. | `src/stores/useAuctionStore.ts`, `src/App.tsx` | 구현·QA 검증 |
| 경매 | 잉글리시 호가 | 최고가보다 높은 입찰만 허용하고 잔액을 검사한다. 종료 직전 입찰은 앤티 스나이핑으로 연장한다. | `src/stores/useAuctionStore.ts`, `src/components/auction/` | 구현·QA 검증 |
| 경매 | 4R 비밀 봉투 | 15초 제한, 미입력·잔액 부족은 `0` 기권으로 확정한다. 0원 기권 버튼과 라운드별 입력 초기화를 제공하고, 제출·타임아웃 결과는 한 번만 생성한다. | `src/stores/useAuctionStore.ts`, `src/components/auction/SealedBidModal.tsx`, `src/components/auction/AuctionGameView.tsx` | 구현·DEV 검증 |
| 경매 | 감정 | 아이템별 `appraisalCost`를 권위로 사용하고 상수는 fallback으로만 쓴다. 최고 입찰자는 낙찰 예약액을 제외한 가용 현금으로만 감정할 수 있다. | `src/services/itemValueService.ts`, `src/stores/useAuctionStore.ts`, `src/components/auction/AuctionGameView.tsx` | 구현·DEV 검증 |
| 경매 | 더치 역경매 | 가격이 시간에 따라 하락하고, 구매자·잔액·상태 검증 후 락을 확정한다. 바닥가 도달 후 500ms 최종 구매 창을 둔다. | `src/stores/useAuctionStore.ts`, `src/services/aiBotService.ts` | 구현·QA 검증 |
| 룸 | 5개 룸 게이팅 | 브론즈·실버·골드·다이아몬드·암시장의 최소 순자산과 입장료를 검사한다. 암시장은 순자산 또는 VIP 티켓으로 입장한다. | `src/data/constants.ts`, `src/stores/useCareerStore.ts` | 구현·QA 검증 |
| 아이템 | 30종 마스터 아이템 | 일반 4개 룸에 각 6종, 암시장에 6종을 배치한다. 한 게임은 해당 룸 6종 중 5종을 중복 없이 사용한다. | `src/data/masterItems.ts`, `src/types/index.ts` | 구현·QA 검증 |
| 아이템 | 암시장 밀수품 6종 | 각 아이템에 타입이 있는 `curseCode`와 영구 디버프를 매핑하고 해당 행동에서 적용한다. | `src/data/masterItems.ts`, `src/services/contrabandService.ts` | 구현·QA 검증 |
| 커리어 | 자금 정산 | 세션 종료 시 기존 커리어 현금에 더하지 않고 최종 세션 잔액으로 교체한다. 입장료·대출·저주·뇌물을 한 번만 반영한다. | `src/stores/useCareerStore.ts`, `src/stores/useAuctionStore.ts` | 구현·QA 검증 |
| 커리어 | 순자산·파산·룸 해금 | `careerCash + 보관함 평가액`으로 순자산을 계산하고 파산·룸 게이팅·승급을 같은 원장으로 판정한다. | `src/stores/useCareerStore.ts` | 구현·QA 검증 |
| 커리어 | 복원·위탁 판매 | 복원 확률과 위탁 판매 시장 배수를 적용하고, 밀수품 저주가 해당 계산을 변경한다. 위탁 payout은 UI 미리보기·store 정산·완료 메시지가 같은 단일 함수를 사용하며 보존 배수를 한 번만 적용한다. | `src/services/itemValueService.ts`, `src/components/workshop/`, `src/components/consignment/` | 구현·DEV 검증 |
| 커리어 | 업적·VIP 티켓 | 업적을 영구 저장하고, 골드·다이아 정상 완주와 `ach-blind-master` 최초 해금에 티켓을 지급한다. | `src/stores/useCareerStore.ts`, `src/data/` | 구현·QA 검증 |
| 암시장 | 경찰 급습 | 15% 기본 확률로 급습하며 5초 안에 탈출·뇌물을 선택한다. 뇌물은 `$5,000 + startingBid`, 체포는 세션 현금 전액 몰수다. 탈출도 긴급 대출 상환을 차감하고, 모달은 숨겨진 `realValue` 대신 추정 범위·감정 결과만 표시한다. | `src/components/auction/PoliceRaidModal.tsx`, `src/stores/` | 구현·DEV 검증, S4 사용자 확인 |
| 도감 | 30종 도감·필터 | 전체 30종을 룸별 필터로 조회한다. 모바일에서 필터 6개를 한 줄 수평 스크롤로 표시하고, 업적 분모는 `MASTER_ACHIEVEMENTS.length`를 사용한다. | `src/components/codex/CodexModal.tsx`, `src/components/common/Header.tsx` | 구현·DEV 검증 |
| UI | 로비·경매·결과 화면 | 룸 선택, 경매 진행, 결과 갤러리, 모달 포커스·복귀를 제공한다. 데스크톱·`390x844` 스모크를 확인했다. | `src/components/`, `src/App.tsx` | 구현·부분 검증 |
| 접근성 | 키보드·스크린리더·실수 방지 | 모든 모달에 dialog 이름·포커스 트랩·초기 포커스·복귀·Escape 닫기를 적용했다. 타이머·입찰가는 live region으로 알리고, reduced-motion에서도 필수 정보를 표시한다. 경매 포기·커리어 초기화·복원·위탁 매각은 확인 모달을 거친다. | `src/hooks/useModalA11y.ts`, `src/components/common/ConfirmDialog.tsx`, `src/components/` | 구현·DEV 검증 |
| 성능 | 이미지·폰트·번들 예산 | 30종 아이템·아바타·업적·이벤트·카드·배경을 품질 기반 WebP로 재인코딩하고 표시 크기별 `srcset` 변형을 제공한다. 공통 `AssetImage`가 lazy·async·fallback을 적용하며, 경매·결과·도감은 지연 로딩한다. Google Fonts 대신 Cinzel 라틴 서브셋을 자체 호스팅한다. | `public/assets`, `src/components/common/AssetImage.tsx`, `src/services/assetService.ts`, `src/App.tsx`, `src/index.css` | 구현·DEV 검증 |
| 오디오 | Web Audio BGM·SFX | 외부 MP3 없이 Web Audio 합성으로 배경음과 효과음을 재생한다. | `src/services/` | 구현·부분 검증 |
| 영속화 | LocalStorage v2.3.1 | 단일 커리어 저장 키와 `saveProfileToStorage` 공통 저장 경로로 정산·업적·티켓·통계를 저장한다. 저장 실패는 화면 전이를 보류하고 재시도를 안내하며, 손상 데이터는 백업 키에 보관한 뒤 초기화한다. 시장 시세와 보존 상태·잭팟을 함께 저장한다. | `src/stores/useCareerStore.ts`, `src/services/storageService.ts`, `src/components/common/ErrorBoundary.tsx` | 구현·DEV 검증 |
| 표기 | 버전·아이템 수 | 패키지·UI가 `2.3.1`을 사용하고 로비·도감·푸터가 전체 30종을 표시한다. | `package.json`, `src/version.ts`, `src/components/` | 구현·QA 검증 |

## 2. 현재 검증 기준선

- 최신 DEV 자체 검증: 21개 테스트 파일, 134개 테스트 통과, Playwright E2E 19개 통과, 프로덕션 빌드 통과 (2026-11-09, `A11Y-001`)
- 이관된 독립 QA 증거: `STAB-001`의 `QA-413` 20/20, 전체 회귀 10/10, 5라운드 E2E, 경찰 S4 사용자 확인
- 상세 증거와 미검증 범위: `../specs/PROJECT_STATE.md`
- 이 기능 명세는 새로운 QA 승인이 아니며, 릴리즈 승인은 `REL-001`의 PM 판정을 따른다.

### A11Y-001 DEV 처리 (2026-11-09)

- axe serious·critical 0건을 로비·도감·경매·결과에서 확인하고, 모달·확인 창도 수동 점검했다.
- Lighthouse 접근성 1.00, 키보드만으로 5라운드 완주·모달 포커스 복귀·Escape 닫기를 확인했다.
- 경매 중 로고·홈 이동과 커리어·도감 초기화는 확인 모달을 거치며, 취소하면 세션을 유지한다.
- `aria-live` 타이머·입찰가, reduced-motion, 3자리 LOT 번호, 오디오 설정 영속화·백그라운드 BGM 중지를 적용했다.
- 독립 QA_DEVOPS 재검증과 실제 스크린리더 수동 검증은 아직 남아 있다.

### PERF-ASSET-001 DEV 처리 (2026-11-09)

- `public` 전체를 75.14 MB에서 1.85 MB로 줄이고, 미사용 레거시 아이템 4개를 제거했다. 모든 런타임 이미지가 실제 WebP임을 검증했다.
- 초기 로비 응답 본문 441.4 KiB, 경매 진입 추가 176.0 KiB로 예산(500 KB·1.5 MB) 안에 들어왔다.
- Lighthouse Performance 0.96~1.00(모바일 4회)·1.00(데스크톱), 모바일 LCP 0.8 s·CLS 0, 데스크톱 LCP 0.4 s·CLS 0을 기록했다.
- Google Fonts 의존을 제거하고 Cinzel 라틴 서브셋을 자체 호스팅하며 한국어 본문은 시스템 폰트 스택으로 전환했다.
- `npm run check:assets`와 `tests/perf-asset.test.ts`, `tests/e2e/perf-assets.spec.ts`로 자산 크기·참조·렌더 회귀를 고정했다.

### STAB-002 DEV 처리 (2026-11-09)

- P1 `QD-01`~`QD-09`를 구현하고 재현·회귀 테스트를 추가했다. 세부 증거는 `../root/archive/TASKS_PHASE_01.md`의 `STAB-002` 원문을 따른다.
- 동반 P2는 `QD-15`~`QD-27`, `QD-29`~`QD-36`을 처리했다. `QD-28`(시드 기반 RNG·세션 이벤트 로그)은 전 구간 RNG 교체가 필요한 별도 계약으로 분리해 후속 TASK 후보로 남긴다.
- 독립 QA_DEVOPS 검증과 `REL-001` 재판정은 아직 완료되지 않았다.

## 3. Changelog (변경 이력)

### v2.3.1 A11Y-001 (2026-11-09)

- 모든 모달에 `role="dialog"`·`aria-modal`·`aria-labelledby`·포커스 트랩·초기 포커스·복귀·Escape 닫기를 적용했다.
- 로비 룸 카드·시세 카드·복원·위탁 항목을 키보드 버튼으로 전환하고, 헤더 로고에 포커스 스타일을 추가했다.
- 경매 타이머·입찰가 live region, reduced-motion CSS·confetti guard를 적용했다.
- 경매 포기·커리어 초기화·도감 초기화·복원·위탁 매각에 확인 모달을 추가했다.
- 내부 `item_*` ID 대신 3자리 LOT 번호를 표시하고, 오디오 설정 영속화·백그라운드 BGM 중지를 적용했다.
- 로비·도감·경매·결과 axe serious·critical 0건, Lighthouse 접근성 1.00을 기록했다.

### v2.3.1 PERF-ASSET-001 (2026-11-09)

- 75.14 MB 자산을 1.85 MB로 축소하고 PNG로 위장된 WebP 36개를 실제 WebP로 재인코딩했다.
- 아이템 512/256, 아바타 128/64, 업적 256/128, 카드 256/128, 이벤트 512/256, 배경 1280×720/960×540 변형을 추가했다.
- 공통 `AssetImage`로 lazy·async·fallback을 적용하고 경매·결과·도감·로비 모달을 코드 분할했다.
- Google Fonts를 제거하고 Cinzel 라틴 서브셋을 자체 호스팅했다.
- 미사용 `item_04`·`item_08`·`item_11`·`item_12`를 제거했다.
- 자산 예산·전송량 측정 스크립트와 Vitest·Playwright 회귀 검사를 추가했다.

### v2.3.1 STAB-002 (2026-11-09)

- 손상 프로필의 룸 티어·보관 상태·업적 ID를 검증·복구하고 `ErrorBoundary`를 추가했다.
- 저장 실패 시 입장·정산·결과 전이를 보류하고 재시도를 안내한다. 유효 프로필을 초기값으로 덮어쓰지 않는다.
- 입찰 예약액을 제외한 가용 현금만 감정에 사용하고, 아이템별 `appraisalCost`를 적용했다.
- 탈출 시 긴급 대출 상환을 차감하고, 경찰 모달에서 숨겨진 실제가치를 제거했다.
- 위탁 판매 보존 배수 이중 적용을 제거하고 시장 시세를 프로필에 영속화했다.
- 보존 상태·잭팟·시장 이벤트·시너지를 단일 평가 계약으로 통일하고 위작을 시너지에서 제외했다.
- 비밀 봉투 0원 기권 버튼, 스피드 해머 조건, 백그라운드 타이머 보정, 중복 라운드 진행 가드를 적용했다.

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
