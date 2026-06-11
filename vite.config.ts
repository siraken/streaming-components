import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  // 各オーバーレイは独立した HTML エントリ。SPA フォールバックは無効にする。
  appType: 'mpa',
  server: {
    https: {
      key: './localhost-key.pem',
      cert: './localhost.pem',
    },
  },
  plugins: [react(), tailwindcss()],
  build: {
    // マルチページ: 各オーバーレイの HTML をエントリとして指定する。
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        clock: resolve(import.meta.dirname, 'clock/index.html'),
        counter: resolve(import.meta.dirname, 'counter/index.html'),
        'speech-recognition': resolve(
          import.meta.dirname,
          'speech-recognition/index.html',
        ),
      },
    },
  },
});
