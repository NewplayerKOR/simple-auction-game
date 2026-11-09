/**
 * 에셋 경로 유틸리티 (PERF-ASSET-001, REPO-001)
 * - 원본 경로는 유지하고, 표시 크기별 변형 파일 이름만 계산한다.
 * - 런타임 문자열 경로에는 Vite `base`를 적용해 하위 경로 배포에서도 404를 막는다.
 */

const normalizeBase = (base: string): string => {
  if (!base || base === '/') return '/';
  return `/${base.replace(/^\/+|\/+$/g, '')}/`;
};

/** `/assets/...` 같은 루트 절대 경로에 배포 base를 붙인다. */
export const assetUrl = (src: string): string => {
  if (!src.startsWith('/')) return src;

  // Vitest·Vite는 BASE_URL을 주입하지만 Playwright 테스트 프로세스처럼
  // Vite 밖에서 데이터 모듈을 직접 import하는 경우에는 env가 없다.
  const env = (import.meta as ImportMeta & { env?: ImportMetaEnv }).env;
  const base = normalizeBase(env?.BASE_URL || '/');
  if (base === '/') return src;
  if (src.startsWith(base)) return src;
  return `${base.replace(/\/$/, '')}${src}`;
};

/** `item_01.webp` + `-256` -> `item_01-256.webp` */
export const assetVariant = (src: string, suffix: string): string =>
  src.replace(/\.webp($|\?)/i, `${suffix}.webp$1`);

/** 반응형 이미지의 `srcSet` 문자열을 만든다. */
export const assetSrcSet = (
  src: string,
  mainWidth: number,
  suffix: string,
  variantWidth: number
): string => `${assetUrl(src)} ${mainWidth}w, ${assetVariant(assetUrl(src), suffix)} ${variantWidth}w`;
