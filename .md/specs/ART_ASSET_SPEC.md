# 🎨 아트 & 시각 디자인 명세서 (Art Asset & AI Prompt Specification)

> **문서 버전:** v2.1.0 (Apple HIG & Design Principles Integration)  
> **상태:** SPECIFICATION / 30종 런타임 인벤토리 검증 기록  
> **분류:** `art`  
> **담당:** PM + DEV(에셋 적용)  
> **디자인 철학:** **Apple Human Interface Guidelines (HIG)** 3대 원칙(`Clarity`, `Deference`, `Depth`) + 럭셔리 소더비 옥션 톤앤매너 결합  
> **최종 수정일:** 2026-11-08

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
- 신규 22개는 lossless WebP 약 24MB이며 별도 최적화·초기 로딩 예산 검증은 수행하지 않았다.
- 기존 `item_04.webp`, `item_08.webp`, `item_11.webp`, `item_12.webp`는 현재 마스터 유물에서 참조되지 않는 레거시 파일로 남겨 두었다. 삭제는 별도 정리 범위다.
