import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// @astrojs/cloudflare v14 の dev モード (workerd) は client:only island の
// component-url を絶対ファイルパスで出力し React がマウントされない。
// build 時のみ adapter を有効にし、dev は Node.js dev サーバーを使う。
const isBuild = process.argv.includes('build');

export default defineConfig({
  output: 'server',
  ...(isBuild ? { adapter: cloudflare() } : {}),
  integrations: [react()],
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});
