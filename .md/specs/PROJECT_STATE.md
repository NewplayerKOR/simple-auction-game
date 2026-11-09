# 프로젝트 현재 상태

> 이 문서는 과거 계획이 아니라 현재 확인된 사실만 기록하는 세션 복구용 문서다.  
> **기준일:** 2026-11-09
> **활성 문서 체계:** `.md`  
> **런타임·패키지 버전:** `2.3.1`  
> **현재 마일스톤:** v2.3.1 `PM_RELEASE_APPROVED`
> **다음 판단:** 릴리즈 실행(태그·배포) 여부와 잔여 수동·환경 검증

## 1. 확인된 구현 범위

- React 18, TypeScript, Vite, Zustand 기반 싱글플레이 SPA
- Node.js 26 이상, npm 11 이상 빌드·테스트 런타임
- 잉글리시 호가, 4라운드 비밀 봉투, 더치 역경매
- 브론즈·실버·골드·다이아몬드·암시장 5개 룸
- 30종 마스터 아이템: 일반 24종과 암시장 밀수품 6종
- 영구 커리어, 룸 게이팅, 파산, 복원, 위탁 판매, 도감, 업적
- 암시장, 밀수품 저주, 경찰 급습
- Web Audio 기반 BGM·SFX 합성
- 브라우저 LocalStorage 기반 영구 저장, 백엔드·실제 DB 없음

## 2. 최신 확인 증거

### 2026-11-08 / PM 확인 실행

| 검증 | 결과 | 검증 범위와 한계 |
| :--- | :--- | :--- |
| `npm.cmd test` | 17개 테스트 파일, 84개 테스트 통과 | PM이 현재 리비전에서 실행한 확인이며 독립 QA 승인은 아님 |
| `npm.cmd run build` | `tsc -b && vite build` 통과. JS 352.60 kB, CSS 49.84 kB | 빌드·타입 검증이며 브라우저 E2E를 대신하지 않음 |
| 에셋 무결성 | 구 `docs/art/asset` 58개와 `public/assets` 58개의 SHA-256 일치 | 파일 무결성만 확인. 로딩 성능·최적화는 미검증 |
| 문서 이관 | 구 `docs/`의 상태·요구사항·결정·기술 명세를 `.md/`로 이관하고 `docs/` 삭제 | 문서 작업. 제품 코드·테스트 변경 없음 |

### 2026-11-09 / QA_DEVOPS 분석 기록

| 검증 | 결과 | 검증 범위와 한계 |
| :--- | :--- | :--- |
| `npm.cmd test`·`npm.cmd run build` | 17개 파일 84개 테스트 통과, 빌드 통과 | QA_DEVOPS 분석 기록. PM 재실행 아님 |
| 테스트 포함 타입 검사 | 12개 오류 (`qa-306`, `qa-404`, `qa-410` 등) | 현재 `tsconfig`는 테스트를 제외하므로 별도 기준 필요 |
| 자산 인벤토리 | `public/assets` 75.14 MB, 미사용 4개 약 6.1 MB, 경매 진입 누적 전송 약 14.45 MB | PM이 75.14 MB와 미사용 4개 참조 0을 재확인 |
| 손상 프로필 | `PLATINUM` 룸 티어 주입 시 `TypeError`와 백지 화면 재현 | 저장 스키마 검증·복구 부재 |
| 브라우저 스모크 | 로비·경매 콘솔 오류 0건 | 확인 구간 한정 |

### 2026-11-09 / DEV `STAB-002` 자체 검증

| 검증 | 결과 | 검증 범위와 한계 |
| :--- | :--- | :--- |
| `npm.cmd test` | 18개 테스트 파일, 114개 테스트 통과. 반복 실행 모두 통과 | `tests/stab-002.test.ts` 30개 추가. DEV 자체 실행이며 독립 QA는 아님 |
| `npm.cmd run build` | `tsc -b && vite build` 통과. JS 362.18 kB, CSS 50.20 kB | 빌드·타입 검증이며 브라우저 E2E를 대신하지 않음 |
| 손상 프로필 복구 | `PLATINUM` 티어 주입 후 새로고침 시 `BRONZE` 복구, 백지 화면·콘솔 오류 0건 | 인앱 Browser 1회 확인 |
| 시세 영속화 | 손상 프로필 복구 후 `marketRates`가 localStorage에 저장·복원됨 | 인앱 Browser 1회 확인 |
| 감정 비용 UI | 브론즈 `item_br_04`에서 `$300` 표시·차감 경로 확인 | 인앱 Browser 1회 확인. 전 룸 반복은 테스트로 대체 |
| 로비 표기 | 전체 30종, 업적 분모 `0/6`, `v2.3.1`, 다중 탭 미지원 안내 확인 | 데스크톱 1회 |

### 2026-11-09 / QA_DEVOPS `QA-INFRA-001`

| 검증 | 결과 | 검증 범위와 한계 |
| :--- | :--- | :--- |
| `npm run typecheck` | 테스트 포함 19개 파일 0오류 | `tsconfig.test.json` 신규, 기존 테스트 fixture 오류 해소 |
| `npm test` | 19개 파일 121개 테스트 통과, 10회 반복 실패 0건 | skip·xfail 0건. UI 7개 포함 |
| `npm run test:e2e` | Playwright Chromium 11개 통과 | 영어·더치 5라운드, 비밀 봉투, 경찰 3결과, 30종/6종 도감, 모바일 390×844 |
| `npm run test:coverage` | 문장 74.6%, 분기 58.71%, 함수 65.1%, 줄 76.73% | V8 기준선. 이후 테스트 추가 시 갱신 필요 |
| axe 기저선 | 로비·도감에 알려진 `button-name` critical 1건 유지 | `A11Y-001`에서 critical 0건으로 강화 필요 |
| CI 워크플로 | `.github/workflows/qa.yml` 작성 | 실제 GitHub Actions 원격 실행은 `REPO-001`에서 확인 |

### 2026-11-09 / DEV `PERF-ASSET-001`

| 검증 | 결과 | 검증 범위와 한계 |
| :--- | :--- | :--- |
| `npm run check:assets` | public 1,846.5 KB(1.85 MB), 이미지 104개 1,821.2 KB, 개별 300 KB 이하, 실제 WebP·참조·변형·레거시 제거 통과 | 파일·예산 검사이며 브라우저 렌더를 대신하지 않음 |
| `npm test` | 20개 파일 126개 테스트 통과 | `tests/perf-asset.test.ts` 5개 추가. DEV 자체 실행 |
| `npm run test:e2e` | Playwright Chromium 13개 통과 | `tests/e2e/perf-assets.spec.ts` 2개 추가. 로비·도감·업적·경매·이벤트·카드·결과 이미지 렌더와 404 0건 확인 |
| `npm run typecheck` | 테스트 포함 0오류 | `tsconfig.test.json` 기준 |
| `npm run build` | `tsc -b && vite build` 통과. 메인 JS 266.04 kB, CSS 51.31 kB, 지연 청크 10개 | 빌드·타입 검증이며 실제 배포 환경 측정은 아님 |
| `npm run perf:transfer` | 로비 441.4 KiB/6 requests, 경매 진입 추가 176.0 KiB/7 requests | 1280×720, 응답 본문 압축 해제 크기. 예산 500 KB·1.5 MB 이내 |
| Lighthouse (모바일) | Performance 0.96~1.00(4회), FCP 0.8 s, LCP 0.8 s, TBT 20~230 ms, CLS 0, 총 184 KiB | Edge 157 headless, 모바일 기본 에뮬레이션, 2026-11-09 |
| Lighthouse (데스크톱) | Performance 1.00, FCP 0.2 s, LCP 0.4 s, TBT 0 ms, CLS 0, 총 224 KiB | Edge 157 headless, `--preset=desktop` |
| 폰트·배경 | Cinzel 자체 호스팅 로드, Google Fonts 요청 0건, 로비·경매·결과 배경 데스크톱/모바일 분기 확인 | 인앱 Browser·Playwright 1회씩, 전체 브라우저 매트릭스는 아님 |

### 2026-11-09 / DEV `A11Y-001`

| 검증 | 결과 | 검증 범위와 한계 |
| :--- | :--- | :--- |
| `npm test` | 21개 파일 134개 테스트 통과, 10회 반복 실패 0건 | `tests/a11y-001.test.tsx` 8개 추가. DEV 자체 실행 |
| `npm run test:e2e` | Playwright Chromium 19개 통과 | `tests/e2e/a11y-keyboard.spec.ts` 6개 추가. 로비·도감·경매·결과 axe, 키보드 5라운드, 확인 모달, 오디오 영속화, reduced-motion |
| axe serious·critical | 로비·도감·경매·결과 0건 | `@axe-core/playwright`, WCAG 2.0/2.1 A·AA 태그 |
| axe 수동 확인 | 사운드·커리어 초기화 확인·복원·위탁·확인 모달 0건 | 임시 스크립트로 1회 확인. 전 룸·전 모달 반복은 아님 |
| Lighthouse 접근성 | **1.00** | Edge 157 headless, 모바일 기본 에뮬레이션 |
| Lighthouse 성능 | **1.00**, FCP 0.8 s, LCP 0.8 s, TBT 60 ms, CLS 0, 총 186 KiB | 같은 실행. A11Y-001 반영 후 |
| `npm run typecheck` | 테스트 포함 0오류 | `tsconfig.test.json` 기준 |
| `npm run build` | `tsc -b && vite build` 통과. 메인 JS 273.75 kB, CSS 52.52 kB | 빌드·타입 검증 |
| `npm run perf:transfer` | 로비 450.1 KiB/6 requests, 경매 진입 추가 149.6 KiB/7 requests | PERF-ASSET-001 예산 500 KB·1.5 MB 이내 유지 |
| 키보드 흐름 | 로비→브론즈 입장→입찰→4R 비밀 봉투→결과→도감을 키보드만으로 완주, 모달 Tab 순환·Escape·포커스 복귀 확인 | Playwright Chromium 1회. 실제 스크린리더 수동 검증은 아님 |
| 실수 방지 | 경매 중 로고·홈은 확인 모달, 로비·도감 초기화는 확인 모달, 취소 시 세션 유지 | E2E 자동화 |
| reduced-motion | 필수 정보 표시·transition 단축 확인, confetti 생략 | CSS media query와 JS guard |
| 오디오 설정 | 음소거·SFX·BGM 볼륨 저장, 새로고침 후 복원 | Vitest·Playwright |

### 2026-11-09 / QA_DEVOPS `REPO-001`

| 검증 | 결과 | 검증 범위와 한계 |
| :--- | :--- | :--- |
| 추적 해제 | `node_modules` 8,414개·`dist` 61개·`*.tsbuildinfo` 2개 추적 해제, `.gitignore` 추가 | `package-lock.json`은 유지 |
| Node 26 | `.nvmrc` 26, `engines.node >=26`, `@types/node` 26.6.6, 테스트 `--no-experimental-webstorage` | 로컬 Node 26.13.0·npm 11.20.0. GitHub Actions Node 26 실행 성공 |
| `npm ci` | lockfile 기준 설치 통과, `--legacy-peer-deps` 불필요 | 로컬 Windows와 fresh clone 모두 통과 |
| `npm audit` | 전체·프로덕션 모두 **0 vulnerabilities** | Vite 6.4.5·Vitest 4.1.12·plugin-react 4.7.0 적용 |
| `npm run typecheck` | 테스트 포함 0오류 | 21개 테스트 파일 기준 |
| `npm test` | 21개 파일 134개 테스트 통과 | skip·xfail 0건 |
| `npm run test:coverage` | 문장 71.73%, 분기 56.85%, 함수 63%, 줄 74.04% | V8 기준선. 이후 테스트 추가 시 갱신 |
| `npm run test:e2e` | Playwright Chromium 19개 통과 | 21.5초, trace·screenshot 보존 설정 |
| `npm run build`·`build:subpath` | 루트·`/simple-auction-game/` 빌드 통과. 메인 JS 274.07 kB | 빌드·타입 검증 |
| `npm run check:assets` | public 1,846.9 KB, 이미지 104개, WebP·참조·변형 무결성 통과 | 파일·예산 검사 |
| 배포 검증 | 루트·하위 경로 preview 각각 20 requests·이미지 10개·404 0 | `scripts/verify-deployment.mjs`, Chromium |
| Lighthouse SEO | 루트·하위 경로 모두 **1.00**, 실패 audit 0 | Lighthouse 13.6.0, Playwright Chromium headless |
| CI 워크플로 | Node 26, typecheck→asset→coverage→build→subpath build→audit→E2E→artifact | GitHub Actions run `42556497240` success. 16단계 전체 통과 |
| fresh clone | `npm ci`→typecheck→test 134개→build 통과, 빌드 후 working tree clean | 로컬 clone. 원격 CI도 같은 커밋 `81930dd`에서 통과 |

### 2026-11-09 / PM `DOC-003`

| 검증 | 결과 | 검증 범위와 한계 |
| :--- | :--- | :--- |
| `npm.cmd test` | 21개 파일 134개 테스트 통과 | DOC-003 시점 현재 리비전. React ErrorBoundary 테스트의 의도된 `render failed` 로그 외 실패 0건 |
| `npm.cmd run typecheck` | 테스트 포함 0오류 | `tsconfig.test.json` 기준 |
| `npm.cmd run check:assets` | public 1,846.9 KB, 이미지 104개 1,821.2 KB, 예산·무결성 통과 | 파일 검사이며 브라우저 렌더를 대신하지 않음 |
| 문서 정합 | `Item`·`PoliceRaidState`·`PersistentCareerProfile` 실제 타입 일치, 룸 주석·시너지 주석 정정 | DOC-003 범위. E2E·Lighthouse 재실행은 아님 |
| 링크·UTF-8 | Markdown 22개 파일의 로컬 링크 유효, U+FFFD 0, `git diff --check` 오류 0 | 로컬 정적 검사 |

### 2026-11-09 / QA_DEVOPS `QA-REBASE-001`

| 검증 | 결과 | 검증 범위와 한계 |
| :--- | :--- | :--- |
| 최종 추적성 | PRD REQ 14개 ↔ `TC-STAB` 12개 ↔ Vitest 22개·E2E 19개 매핑 | [`QA_TRACEABILITY.md`](./QA_TRACEABILITY.md) ACTIVE |
| 신규 테스트 | `tests/qa-rebase-001.test.ts` 12개 | 음수 종료 잔액, 6종 저주 개별, 잉글리시 입찰 경계값, 뇌물 비용 부족, 티켓 지급·미소모 |
| `npm test` | 22개 파일 146개 테스트 통과 | skip·xfail 0건 |
| `npm run typecheck` | 테스트 포함 0오류 | `tsconfig.test.json` 기준 |
| `npm run test:coverage` | 문장 71.91%, 분기 57.29%, 함수 63%, 줄 74.1% | V8 기준선 |
| `npm run test:e2e` | Playwright Chromium 19개 통과 | 영어·더치 5라운드, 비밀 봉투, 경찰 3결과, 접근성·성능 자산 |
| 자동화 판정 | P0/P1 미커버 요구사항 0건 | 실제 스크린리더·다중 브라우저·Vercel CDN은 별도 잔여. 독립 QA는 REL-001에서 PASS |

### 2026-11-09 / QA_DEVOPS `REL-001` 사전 독립 QA

| 검증 | 결과 | 검증 범위와 한계 |
| :--- | :--- | :--- |
| `STAB-002` 독립 재검증 | **PASS** — `QD-01`~`QD-09`를 실제 store/service에서 독립 재현, P0/P1 결함 0건 | 임시 QA 테스트 19개로 손상 프로필·저장 실패·감정 비용·탈출 대출·위탁 payout·시세 영속·단일 평가를 확인. 테스트 종료 후 삭제 |
| `PERF-ASSET-001` 독립 재검증 | **PASS** — public 1,846.9 KB, 이미지 104개, 로비 451 KiB, 경매 추가 177 KiB | 예산 5 MB·500 KB·1.5 MB 이내. 로컬 preview 1회 측정이며 실제 CDN은 미검증 |
| `A11Y-001` 독립 재검증 | **PASS** — axe serious·critical 0, 키보드 5라운드, 확인 모달·reduced-motion·오디오 영속화 | Chromium 자동화 범위. 실제 스크린리더·Firefox·WebKit은 미검증 |
| 전체 게이트 | Vitest 22개 파일 146개, E2E 19개, typecheck 0오류, coverage 문장 71.97%·분기 57.48%, build 통과, audit 전체·프로덕션 0건 | 2026-11-09 HEAD `d809e51`, 작업 트리 clean |
| 비차단 관찰 | 더치 저장 실패 시 틱 정지(P2), 저장 실패 시 VICTORY BGM 선재생(P3), 금액 소수 허용(P3) | 정상 플레이 밖 또는 새로고침 복구 가능. 릴리즈 차단 아님 |

### 구 `docs/`에서 이관한 QA 증거

| 검증 | 결과 | 한계 |
| :--- | :--- | :--- |
| `STAB-001` 독립 QA | `QA-413` 20/20, 전체 회귀 10/10 반복, 최종 17개 파일 83개 테스트 통과 | 현재 테스트 수는 84개. 과거 QA 기록과 현재 실행의 기준 차이를 함께 보존 |
| 브라우저 5라운드 E2E | 브론즈 잉글리시·더치 각각 5라운드 완주 | 반복·다중 브라우저·장기 랜덤은 미검증 |
| 비밀경매 안정성 | 수동 제출·타임아웃 결과가 완전 공개 후 5.5초 동안 불변 | 전체 브라우저 조합 반복은 미검증 |
| 정상 정산 영속화 | 새로고침 후 현금 `$6,500`, 플레이 `2전` 유지 | 저장 실패·손상 데이터 강제 주입은 미검증 |
| 버전·30종 표기 | 로비·도감·푸터에서 전체 30종과 `v2.3.1` 표시, 콘솔 오류·경고 0건 | 확인 구간 한정 |
| 모바일 도감 | `390x844`에서 필터 6개 한 줄 수평 스크롤 통과 | 다중 모바일 브라우저는 미검증 |
| 30종 고유 유물 이미지 | 30개 고유 URL, 파일 존재, WebP HTTP 응답, 데스크톱·모바일 렌더 통과 | 신규 22개 약 24MB의 최적화·성능 예산은 미검증 |
| 경찰 세 결과 S4 | 사용자 수동 확인 결과 `승인` | QA 에이전트가 동일 Browser에서 직접 재실행한 증거는 아님 |

## 3. P0/P1 이슈

### 기존 해결 이슈

| ID | 심각도 | 상태 | 요약 |
| :--- | :---: | :---: | :--- |
| `ISSUE-ECO-001` | P0 | QA_VERIFIED | 자금 교체·멱등 정산 자동화와 무행동 5라운드 E2E 통과 |
| `ISSUE-FSM-001` | P0 | QA_VERIFIED | 비밀경매 수동·타임아웃 단일 확정과 공개 상태 안정성 통과 |
| `ISSUE-BM-001` | P0 | USER_VERIFIED / QA_ACCEPTED | 사용자 경찰 탈출·뇌물·체포 새로고침 S4 승인 확인 |
| `ISSUE-BM-002` | P0 | QA_VERIFIED | 밀수품 6종 데이터·행동 매핑 자동화 통과 |
| `ISSUE-DUTCH-001` | P1 | QA_VERIFIED | 검증 후 락·동시 클레임·바닥가 자동화와 5라운드 E2E 통과 |
| `ISSUE-DUTCH-002` | P1 | QA_VERIFIED | 숨겨진 실제가치·위작 플래그 독립성 자동화 통과 |
| `ISSUE-EVENT-001` | P1 | QA_VERIFIED | 시장 이벤트 유지 상태를 포함한 5라운드 E2E 통과 |
| `ISSUE-DOC-001` | P1 | QA_VERIFIED | 패키지·UI `2.3.1`과 30종 정적·렌더 검증 통과 |
| `ISSUE-QA-001` | P1 | QA_VERIFIED | `QA-413` 결정론화 후 표적 20/20·전체 회귀 10/10 독립 통과 |
| `ISSUE-UI-001` | P2 | QA_VERIFIED | 모바일 도감 필터 6개 높이·줄바꿈·축소·수평 스크롤 독립 통과 |

### 2026-11-09 후속 P1 결함

| ID | 상태 | 요약 | 결정·TASK |
| :--- | :---: | :--- | :--- |
| `QD-01` | QA_VERIFIED | 손상된 `highestRoomTierUnlocked`가 백지 화면과 `TypeError`를 만든다. 검증·복구·`ErrorBoundary` 적용. REL-001 독립 QA PASS | `STAB-002` |
| `QD-02` | QA_VERIFIED | 저장 실패가 결과 전이·입장·종료에 전파되지 않는다. 실패 반환·화면 전이 보류·재시도 적용. REL-001 독립 QA PASS | `STAB-002` |
| `QD-03` | QA_VERIFIED | 입찰 후 감정·카드 지출로 잔액이 음수가 될 수 있다. 낙찰 예약액 차감 후 지출 적용. REL-001 독립 QA PASS | `STAB-002` |
| `QD-04` | QA_VERIFIED | 탈출 정산이 긴급 대출 상환을 차감하지 않는다. `DEC-009` 적용. REL-001 독립 QA PASS | `DEC-009`, `STAB-002` |
| `QD-05` | QA_VERIFIED | 경찰 모달이 숨겨진 `realValue`를 노출할 수 있다. 추정 범위·감정 결과만 표시. REL-001 독립 QA PASS | `STAB-002` |
| `QD-06` | QA_VERIFIED | 위탁 판매가 보존 배수를 이중 적용할 수 있다. 단일 payout 함수 적용. REL-001 독립 QA PASS | `DEC-011`, `STAB-002` |
| `QD-07` | QA_VERIFIED | 시장 시세가 새로고침으로 초기화되어 `DUMP` 회피가 가능하다. 프로필 영속화·복원 적용. REL-001 독립 QA PASS | `STAB-002` |
| `QD-08` | QA_VERIFIED | 감정 비용이 아이템별 `appraisalCost`와 상수 $500으로 불일치한다. 아이템별 비용 적용. REL-001 독립 QA PASS | `DEC-010`, `STAB-002` |
| `QD-09` | QA_VERIFIED | 세션 순위와 보관함·위탁의 보존 상태 평가가 다르다. 단일 평가 계약 적용. REL-001 독립 QA PASS | `DEC-011`, `STAB-002` |

## 4. 릴리즈 차단 이슈

- 기존 `STAB-001`의 P0/P1 이슈는 모두 `QA_VERIFIED` 또는 `USER_VERIFIED / QA_ACCEPTED`다.
- `STAB-002`의 P1 `QD-01`~`QD-09`는 REL-001 사전 독립 QA에서 전부 PASS했다. P0/P1 미해결 결함은 0건이다.
- `QA-INFRA-001`은 완료했다. 테스트 포함 타입 검사 0오류, Vitest 121개·Playwright 11개, 커버리지 기준선, CI 워크플로를 확보했다.
- `PERF-ASSET-001`은 독립 QA PASS다. public 1,846.9 KB, 로비 451 KiB, 경매 진입 추가 177 KiB로 예산 안에 있다.
- `A11Y-001`은 독립 QA PASS다. axe serious·critical 0건, 키보드 5라운드, 확인 모달·reduced-motion·오디오 영속화를 재현했다. 실제 스크린리더·다중 브라우저는 잔여다.
- `REPO-001`은 완료했다. Node 26·CI·배포 위생, audit 0, 루트·하위 경로 이미지 404 0, Lighthouse SEO 1.00을 확인했다. Vercel 프로젝트는 사용자가 pause 상태로 두어 실제 Vercel 헤더·CDN 검증은 재개 후로 미룬다.
- `QA-REBASE-001`은 완료했다. 최종 추적성 매트릭스와 음수 종료 잔액·6종 저주 개별 테스트를 추가했고, 자동화 기준 P0/P1 미커버 요구사항은 0건이다.
- v2.3.1은 `PM_RELEASE_APPROVED`다. 1~7번째 TASK와 독립 QA를 완료했고, 잔여 수동·환경 검증은 릴리즈 후 추적한다. 실제 태그·배포는 별도 실행이다.

## 5. 알려진 제한사항과 미검증 범위

- `STAB-002`의 저장 실패·손상 프로필·구버전 프로필 복구는 REL-001 사전 독립 QA에서 PASS했다. 독립 QA는 임시 테스트로 `QD-01`~`QD-09`를 재현한 뒤 파일을 삭제했고 작업 트리는 clean이다.
- `ErrorBoundary`의 실제 렌더 오류 유도, 경찰 모달 숨은 가치 비노출, 위탁·비밀 봉투 UI의 전 룸 브라우저 반복은 자동화 범위에서 확인했지만 실제 브라우저 반복은 잔여다.
- `TC-STAB-001`의 음수 종료 잔액은 `tests/qa-rebase-001.test.ts`에서 전용 검증한다. `TC-STAB-008`은 6종 저주를 개별 테스트로 검증한다.
- 테스트 포함 타입 검사 12개 오류는 `QA-INFRA-001`에서 0개로 해소
- Lighthouse 기준선은 로컬 Edge 157 headless 1회 측정이다. 실제 배포 CDN·압축·다중 기기·반복 측정은 릴리즈 후 잔여다.
- Lighthouse 접근성은 A11Y-001 반영 후 1.00이다. 실제 스크린리더(NVDA·VoiceOver) 수동 검증과 다중 브라우저 키보드 반복은 미검증이다.
- 경찰 급습과 비밀 봉투 공개 전 모달은 필수 선택을 우회하지 않도록 Escape 닫기를 의도적으로 막고 포커스 트랩만 적용한다.
- `npm audit` 개발 의존성 취약점은 0건이다. `REPO-001`에서 Vite·Vitest·transitive 패치를 적용했고 `npm audit --omit=dev`도 0건이다.
- CI 원격 실행은 커밋 `81930dd`의 GitHub Actions run `42556497240`에서 success로 확인했다. Vercel 배포 헤더·CDN 검증은 아직 미확인이다. Vercel 프로젝트는 사용자가 pause 상태로 두었다.
- 다중 브라우저·다중 모바일 브라우저
- 장기 랜덤 반복과 성능 반복
- 경찰 탈출·뇌물·체포 S4는 사용자 수동 확인이며 QA 에이전트 직접 재실행은 아님
- 5라운드 E2E는 잉글리시·더치 각각 1회 완주이며 반복·다중 환경은 아님
- REL-001 사전 독립 QA의 비차단 관찰: 더치 저장 실패 시 틱 정지(P2), 저장 실패 시 VICTORY BGM 선재생(P3), 금액 필드 소수 허용(P3). 모두 정상 플레이 밖이거나 새로고침 복구가 가능해 릴리즈 차단으로 보지 않는다.
- Lighthouse 접근성·성능의 QA_DEVOPS 독립 재실행, 실제 2탭 동시성, 경찰·비밀봉투·감정·복원·위탁 모달의 개별 axe 반복은 잔여다.
- 실제 스크린리더·Firefox·WebKit·Vercel CDN은 `QA_TRACEABILITY.md` 7절의 잔여 리스크로 관리한다.

## 6. 현재 작업 상태

- `STAB-001`: `DONE` — QA 최종 승인 완료. 원문: `.md/root/archive/v2.3.1/STAB-001.md`
- `DOC-002`: `DONE` — 구 `docs/`를 `.md/`로 이관하고 `docs/` 삭제. 원문: `.md/root/archive/TASKS_PHASE_01.md`
- `STAB-002`: `[x]` DONE — P1 9건과 동반 P2 구현·자체 검증, REL-001 사전 독립 QA PASS
- `QA-INFRA-001`: `[x]` DONE — 테스트 포함 타입 검사 0오류, Vitest 121개, Playwright 11개, 커버리지·CI 기반
- `PERF-ASSET-001`: `[x]` DONE — public 1.85 MB, 로비 451 KiB, 경매 추가 177 KiB, 독립 QA PASS
- `A11Y-001`: `[x]` DONE — axe serious·critical 0, 키보드·확인 모달·reduced-motion·오디오 영속화, 독립 QA PASS
- `REPO-001`: `[x]` DONE — Node 26·CI/CD·배포 위생, 추적 산출물 분리, audit 0, 루트·하위 경로 이미지 404 0, Lighthouse SEO 1.00
- `DOC-003`: `[x]` DONE — 스키마·아키텍처·추적성·README 정합, 소스 주석 3줄 DEV 정정
- `QA-REBASE-001`: `[x]` DONE — PRD REQ↔TC↔테스트 최종 매트릭스, 음수 종료 잔액·6종 저주 개별 테스트, 수동 S4 의존 정리
- `REL-001`: `[x]` DONE — v2.3.1 `PM_RELEASE_APPROVED`, 독립 QA PASS와 잔여 제한 기록
- `ARCH-PVP-001`: `[!]` 블로커 — `REL-001` 승인 완료. Phase 3 서버 계약·제품 범위 승인 후 착수
- Phase 3 실시간 PVP: 서버 계약·제품 범위 승인 전 착수 금지

## 7. 다음 시작 지점

1. PM: v2.3.1 `PM_RELEASE_APPROVED` 상태를 기준으로 태그·릴리즈 노트·배포 실행 여부를 결정한다. 실행 시 `README.md` 6절 절차를 따른다.
2. QA_DEVOPS·PM: 실제 스크린리더, Firefox·WebKit, Vercel 재개 후 CDN·보안 헤더, 장시간 랜덤·타이머 반복을 잔여 검증으로 추적한다.
3. DEV·PM: `ARCH-PVP-001`은 Phase 3 서버 계약·제품 범위를 승인한 뒤 착수한다. `REL-001` 승인 자체는 완료됐다.
4. DEV: REL-001 독립 QA의 P2/P3 관찰(더치 저장 실패 틱 정지, VICTORY BGM 선재생, 금액 소수 허용)과 `QD-28`(시드 기반 RNG·세션 이벤트 로그)을 후속 후보로 검토한다.
5. 새 기능 요청은 `.md/root/TASKS.md`에 TASK로 등록한 뒤 착수한다.

## 8. 문서 권위와 이관

- 활성 문서 체계는 `.md/`다.
- 제품 요구사항: `.md/specs/PRD.md`
- 결정 로그: `.md/specs/DECISIONS.md`
- 작업 보드: `.md/root/TASKS.md`
- 기능 명세: `.md/root/FEATURES.md`
- 기술 명세: `.md/specs/`
- 실행·검증·배포 절차: [`README.md`](../../README.md)
- 구 `docs/`는 2026-11-08 이관 후 삭제했다. 이관 전 상세 이력은 Git 커밋과 `.md/root/archive/TASKS_PHASE_01.md`에 보존한다.
