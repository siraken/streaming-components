# CLAUDE.md

## What this is

OBS ブラウザソース用のオーバーレイ集。各ページが独立した配信用ツール（字幕・時計・カウンター）。`/speech-recognition/` が主機能で Web Speech API による自動字幕。

## Commands

```bash
pnpm dev       # Astro dev server
pnpm build     # type-check + build
pnpm lint      # Biome (single quotes, space indent)
pnpm deploy    # build + Cloudflare Workers deploy
```

## Architecture

- **Astro + React (`client:only="react"`)** — ブラウザ API 依存のため SSR なし
- **Cloudflare Workers** — `@astrojs/cloudflare` adapter、`wrangler.jsonc` で設定
- **Tailwind CSS v4** — `@tailwindcss/vite` プラグイン、`tailwind-variants` でコンポーネントバリアント
- ページ追加: `src/components/` に React、`src/pages/` に `.astro` を作成

## Known gotchas

- `@astrojs/cloudflare` v14 の dev モード (workerd) は `client:only` island の `component-url` を絶対パスで出力するバグあり。`astro.config.ts` で build 時のみ adapter を有効にするワークアラウンド適用中。
- `noUnusedLocals` / `noUnusedParameters` が有効。未使用の変数は `astro check` で失敗する。
