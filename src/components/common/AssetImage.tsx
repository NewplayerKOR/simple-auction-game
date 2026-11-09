import React, { useState } from 'react';

/**
 * 공통 이미지 컴포넌트 (PERF-ASSET-001)
 * - 기본 lazy·async 디코딩으로 초기 전송을 줄인다.
 * - 파일이 없거나 디코딩에 실패하면 작은 SVG placeholder로 대체한다.
 * - `width`·`height`는 호출부에서 실제 표시 비율에 맞게 전달한다.
 */
const FALLBACK_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="#0f172a"/><rect x="24" y="24" width="208" height="208" rx="24" fill="none" stroke="#334155" stroke-width="4"/><path d="M64 176l48-56 32 36 24-28 40 48H64z" fill="#1e293b"/><circle cx="96" cy="88" r="16" fill="#334155"/></svg>'
)}`;

interface AssetImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

export const AssetImage: React.FC<AssetImageProps> = ({
  src,
  alt,
  fallbackSrc = FALLBACK_SRC,
  loading = 'lazy',
  decoding = 'async',
  onError,
  ...rest
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const isFailed = failedSrc === src;

  return (
    <img
      {...rest}
      src={isFailed ? fallbackSrc : src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={(event) => {
        setFailedSrc(src);
        onError?.(event);
      }}
    />
  );
};
