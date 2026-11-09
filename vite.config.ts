import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import packageJson from './package.json';

/**
 * 하위 경로 배포를 지원하려면 VITE_BASE_PATH를 `/simple-auction-game/`처럼
 * 슬래시로 시작·끝나는 값으로 정규화한다. 기본값은 루트 배포 `/`다.
 */
export const normalizeBasePath = (value?: string): string => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = normalizeBasePath(env.VITE_BASE_PATH || process.env.VITE_BASE_PATH);

  return {
    base,
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: false,
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
    build: {
      sourcemap: mode !== 'production',
    },
  };
});
