# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A collection of standalone full-screen browser pages designed to be used as **OBS browser sources** for live streaming overlays. Each page renders one self-contained component (subtitle captions, clock, counter) intended to be added as a separate browser source in OBS — these are independent overlays, not a single app users navigate between. The flagship page is `/speech-recognition/`, an auto-subtitle generator built on the Web Speech API.

## Commands

This project uses **pnpm** (see `pnpm-lock.yaml`); the version is pinned via the `packageManager` field in `package.json`.

```bash
pnpm install       # install dependencies
pnpm dev           # start the Astro dev server
pnpm build         # astro check (type-check) then astro build
pnpm lint          # Biome check (linting + formatting)
pnpm preview       # preview the production build locally
pnpm deploy        # build and deploy to Cloudflare Workers
```

There is no test setup. Biome (`biome.jsonc`, wired to `pnpm lint`) enforces single quotes and space indentation. ESLint is not configured.

pnpm blocks postinstall scripts by default, so native deps are pre-approved in `pnpm-workspace.yaml` under `allowBuilds`. On a fresh clone, `pnpm install` builds them automatically; if pnpm ever reports ignored builds, run `pnpm approve-builds`.

## Architecture

- **Astro with file-based routing.** Each overlay is an `.astro` page under `src/pages/` that renders a React component with `client:only="react"` (no SSR — browser APIs only). Pages: `index.astro` (→ `/`), `clock.astro` (→ `/clock/`), `counter.astro` (→ `/counter/`), `speech-recognition.astro` (→ `/speech-recognition/`). All pages are prerendered at build time. **URLs use trailing slashes** (`trailingSlash: 'always'` in `astro.config.ts`). To add a page: create a React component in `src/components/`, then create an `.astro` page in `src/pages/` that imports and renders it with `client:only="react"`.
- **Deployment target: Cloudflare Workers** via `@astrojs/cloudflare` adapter (`output: 'server'` in `astro.config.ts`). The adapter auto-generates `dist/server/wrangler.json` at build time. Root `wrangler.jsonc` provides base config (project name, compatibility date). Deploy with `pnpm deploy` or via Cloudflare git integration.
- **React components live in `src/components/`.** Each is a self-contained, full-viewport component. The flagship `speech-recognition.tsx` has a chroma-key green background (default `#008000`) with layout/visibility driven by keyboard shortcuts. `clock.tsx` and `counter.tsx` are simpler text overlays.
- **Shared Astro layout**: `src/layouts/Base.astro` provides the HTML shell (head, body) for all pages.
- **Styling**: Tailwind CSS v4 via the `@tailwindcss/vite` plugin (no `tailwind.config.js`; `@import "tailwindcss"` in `src/styles/globals.css`). Component-level variants use `tailwind-variants` (`tv(...)`) — see the `button`/`select`/`textDisplay` definitions in `speech-recognition.tsx` for the established pattern.
- **Font customization via env vars**: `clock.tsx` reads `PUBLIC_CLOCK_FONT` / `PUBLIC_CLOCK_WEIGHT`; `counter.tsx` reads `PUBLIC_COUNTER_FONT` / `PUBLIC_COUNTER_WEIGHT` (`import.meta.env.*`). Set these in a `.env` to theme the overlays without code changes.
- **Keyboard controls** (overlay pages): `F` = fullscreen, `Esc` = exit fullscreen, `C` = toggle the caption view's visibility. Implemented per-page via a `keydown` listener (see `speech-recognition.tsx`).
- **Speech recognition flow** (`speech-recognition.tsx`): wraps the `webkitSpeechRecognition` API with manually-declared TypeScript interfaces. It self-restarts on `onsoundend`/`onerror`/final result to keep continuous captioning alive. Text/background colors use native `<input type="color">`.

## Known gotchas

- TypeScript extends `astro/tsconfigs/strict`. `noUnusedLocals`/`noUnusedParameters` are on, so dead bindings fail `astro check`. The whole `src` tree is type-checked.
- All React components use `client:only="react"`, meaning they are **not** server-rendered. This is intentional — they rely on browser APIs (`window`, `SpeechRecognition`, `setInterval`).
