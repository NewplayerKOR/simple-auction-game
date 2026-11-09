import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import packageJson from './package.json';

export default defineConfig({
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
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
    open: false,
  },
});
