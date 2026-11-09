# 🎨 아트 & 시각 디자인 명세서 (Art Asset & AI Prompt Specification)

> **문서 버전:** v2.3.1 (PERF-ASSET-001·A11Y-001 반영)  
> **상태:** SPECIFICATION / 런타임 인벤토리·예산 검증 기록  
> **분류:** `art`  
> **담당:** PM + DEV(에셋 적용)  
> **디자인 철학:** **Apple Human Interface Guidelines (HIG)** 3대 원칙(`Clarity`, `Deference`, `Depth`) + 럭셔리 소더비 옥션 톤앤매너 결합  
> **최종 수정일:** 2026-11-09

---

> [!NOTE]
> 이 문서는 디자인 방향과 생성 규격의 권위다. 30종 런타임 인벤토리와 파일 무결성은 확인했지만, 전체 화면 적용·접근성·로딩 성능을 모두 증명하지는 않는다. 미검증 범위는 [`PROJECT_STATE.md`](./PROJECT_STATE.md)를 따른다.

## 1. 🍎 애플 디자인 설계 원칙 (Apple HIG) 기반 비주얼 가이드

### 1.1 3대 핵심 설계 원칙 (Core Principles)
1. **명확성 (Clarity):**
   - 텍스트는 어떤 해상도(모바일~4K)에서도 한눈에 읽혀야 하며, 금액과 타이머 등 핵심 정보는 시각적 왜곡 없이 직관적으로 전달되어야 합니다.
   - 높은 명도 대비(High Contrast, WCAG AA/AAA 준수)로 어두운 배경에서도 시인성 보장.
2. **콘텐츠 우선 (Deference):**
   - UI 요소(테두리, 버튼)가 유물 아트워크와 경매 콘텐츠보다 과도하게 튀지 않고, 콘텐츠를 돋보이게 하는 **절제된 글래스모피즘(Frosted Glass: `backdrop-blur-md`)** 질감 적용.
3. **깊이감과 위계 (Depth & Visual Hierarchy):**
   - 레이어 간 명확한 z-index와 은은한 그림자(`shadow-2xl`, 골드 앰비언트 글로우)로 옥션 스테이지, 모달, 컨트롤 패널의 입체적 깊이감 표현.

---

## 2. 8pt 그리드 & 마이크로 인터랙션 규격

- **8pt 간격 시스템 (Spatial Consistency):** 패딩, 마진, 컴포넌트 간격은 4px / 8px / 16px / 24px / 32px / 48px 배수로 통일.
- **햅틱형 시각 피드백 (Tactile Response):**
  - 모든 클릭/터치 가능 버튼은 `active:scale-95 transition-all duration-150`의 탄력적인 눌림 효과 적용.
  - 마우스 호버 시 은은한 테두리 글로우(`hover:border-gold-400 hover:shadow-gold-500/20`).

---

## 3. 에셋 생성 프롬프트 및 규격 카탈로그 (v2.1.0)
*(기존 43종 WebP 규격 및 Midjourney/DALL-E 프롬프트는 Apple HIG의 간결하고 뚜렷한 실루엣 원칙을 엄격히 준수하여 유지)*

## 4. 30종 유물 런타임 에셋 적용 기록

> **적용일:** 2026-08-21  
> **증거 등급:** ART 자체 검증. 독립 QA 또는 릴리즈 승인을 의미하지 않는다.

- `MASTER_ITEMS` 30종은 서로 다른 `imageUrl` 30개를 사용한다.
- 사용자 제공 신규 WebP 22개는 `public/assets/images/items/`에 런타임 에셋으로 배치했다.
- 신규 파일명은 마스터 ID와 일치한다: `item_br_01`·`02`·`04`·`05`·`06`, `item_sv_03`·`05`·`06`, `item_gd_01`·`04`, `item_dm_01`~`06`, `item_bm_01`~`06`.
- 2026-11-08 이관 시 구 `docs/art/asset` 58개와 `public/assets` 58개의 SHA-256이 모두 일치함을 확인하고 구 보관본을 삭제했다. 이제 `public/assets`를 런타임·원본 단일 소스로 사용한다.
- 30개 런타임 URL의 HTTP 200·`image/webp` 응답과 데스크톱·`390x844` 경매 화면 렌더를 확인했다.
- 신규 22개는 lossless WebP 약 24MB였으며 `PERF-ASSET-001`에서 품질 기반 WebP로 재인코딩했다. 2026-11-09 기준 `public` 전체는 1.85 MB다.
- 기존 `item_04.webp`, `item_08.webp`, `item_11.webp`, `item_12.webp`는 현재 마스터 유물에서 참조되지 않는 레거시 파일이었으며 `PERF-ASSET-001`에서 제거했다.

## 5. PERF-ASSET-001 런타임 에셋 예산 (2026-11-09)

### 5.1 인코딩·크기

- 기존 파일 일부는 확장자가 `.webp`였지만 실제 내용은 PNG였다. 2026-11-09 전수 검사에서 PNG 36개를 확인했고, 모두 품질 기반 WebP로 재인코딩했다.
- 표시 크기별 원본·변형 파일을 함께 생성한다. 브라우저는 `srcset`·`sizes`로 화면 밀도에 맞는 파일을 선택한다.

| 자산 | 원본 크기 | 변형 | 품질 | 개수 |
| :--- | :--- | :--- | :---: | :---: |
| 아이템 | 512×512 | `-256.webp` 256×256 | 78 / 68 | 30 + 30 |
| 업적 배지 | 256×256 | `-128.webp` 128×128 | 82 / 80 | 6 + 6 |
| 아바타 | 128×128 | `-64.webp` 64×64 | 82 / 80 | 4 + 4 |
| 찬스 카드 | 256×256 | `-128.webp` 128×128 | 80 / 78 | 3 + 3 |
| 시장 이벤트 | 512×286 | `-256.webp` 256×143 | 78 / 76 | 4 + 4 |
| UI 아이콘 | 128×128 | - | 82 | 2 |
| UI 스탬프 | 256×256 | - | 82 | 2 |
| 배경 | 1280×720 | `-960.webp` 960×540 | 62 / 58 | 3 + 3 |

- 원본 배경은 1376×768이다. 1920×1080으로 업스케일하면 파일만 커지고 실제 디테일이 늘지 않으므로 데스크톱 1280×720, 모바일 960×540으로 다운스케일했다.
- `public/assets/images`는 104개 1.82 MB, 자체 호스팅 폰트 25.9 KB를 포함한 `public` 전체는 1.85 MB다.

### 5.2 로딩·폰트·코드 분할

- 공통 `AssetImage`가 기본 `loading="lazy"`, `decoding="async"`, 실패 시 SVG fallback을 적용한다. 첫 화면 핵심 이미지(로비 아바타, 경매 출품작, 이벤트 배너)는 `loading="eager"`를 사용한다.
- 배경은 CSS 클래스 `bg-lobby-pattern`·`bg-auction-pattern`·`bg-gallery-pattern`으로 모바일·데스크톱 파일을 분기한다.
- Google Fonts 의존을 제거하고 Cinzel 라틴 서브셋 `public/assets/fonts/cinzel-latin.woff2`를 자체 호스팅한다. `font-display: swap`을 적용하고, 한국어 본문은 Pretendard·Apple SD Gothic Neo·Malgun Gothic 시스템 스택을 사용한다.
- `AuctionGameView`, `ResultGalleryView`, `CodexModal`, 로비 모달은 `React.lazy`와 `Suspense`로 분할한다. A11Y-001 반영 후 초기 로비 청크는 273.75 kB(JS) + 52.52 kB(CSS)다.

### 5.3 자동 회귀 검사

- `npm run check:assets`: `public` 전체 5 MB, 개별 이미지 300 KB, 실제 WebP 시그니처, 참조 파일 존재, 변형 파일 존재, 레거시 파일 부재를 검사한다.
- `npm run perf:transfer`: 빌드 미리보기에서 로비·경매 진입 응답 본문 합계를 측정한다. 예산은 로비 500 KB, 경매 진입 추가 1.5 MB다.
- `tests/perf-asset.test.ts`: 위 자산·폰트·`AssetImage`·코드 분할 계약을 Vitest에서 재검증한다.
- `tests/e2e/perf-assets.spec.ts`: 로비·도감·업적·경매·이벤트·카드·결과 화면의 실제 이미지 렌더와 404 부재를 Playwright에서 확인한다.

### 5.4 측정 기준선

| 측정 | 결과 | 조건 |
| :--- | :--- | :--- |
| Lighthouse Performance (모바일) | 1.00, FCP 0.8 s, LCP 0.8 s, TBT 60 ms, CLS 0 | Edge 157 headless, 모바일 기본 에뮬레이션, A11Y-001 반영 후 |
| Lighthouse 접근성 (모바일) | 1.00 | 같은 실행 |
| Lighthouse Performance (데스크톱) | 1.00, FCP 0.2 s, LCP 0.4 s, TBT 0 ms, CLS 0 | Edge 157 headless, `--preset=desktop`, PERF-ASSET-001 기준선 |
| 초기 로비 응답 본문 | 450.1 KiB / 6 requests | `npm run perf:transfer`, A11Y-001 반영 후 |
| 경매 진입 추가 응답 본문 | 149.6 KiB | 같은 측정 |
| Lighthouse 총 전송량 | 모바일 186 KiB, 데스크톱 224 KiB | 캐시 없는 새 프로필 |

- LCP 목표는 모바일·데스크톱 모두 2.5 s 이하로 설정한다. 현재 측정값은 목표보다 충분히 낮다.
- Lighthouse 접근성은 A11Y-001 반영 후 1.00이다. 실제 스크린리더 수동 검증과 다중 브라우저 반복은 미검증이다.
