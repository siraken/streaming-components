# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A collection of standalone full-screen browser pages designed to be used as **OBS browser sources** for live streaming overlays. Each route renders one self-contained component (subtitle captions, clock, counter) intended to be added as a separate browser source in OBS — not a multi-page app that users navigate through. The flagship page is `/speech-recognition`, an auto-subtitle generator built on the Web Speech API.

## Commands

This project uses **pnpm** (see `pnpm-lock.yaml`); the version is pinned via the `packageManager` field in `package.json`.

```bash
pnpm install       # install dependencies
pnpm dev           # start the Vite dev server (HTTPS — see below)
pnpm build         # tsc -b (project references) then vite build
pnpm lint          # ESLint
pnpm preview       # preview the production build
```

There is no test setup. Both ESLint (`eslint.config.js`, wired to `pnpm lint`) and Biome (`biome.jsonc`) are configured, but Biome has no package script — invoke it directly with `pnpm exec biome check` / `pnpm exec biome format`. Biome enforces single quotes and space indentation.

pnpm blocks postinstall scripts by default, so the native deps `esbuild` and `@parcel/watcher` are pre-approved in `pnpm-workspace.yaml` under `allowBuilds`. On a fresh clone, `pnpm install` builds them automatically; if pnpm ever reports ignored builds, run `pnpm approve-builds`. Note that `pnpm <script>` verifies dependencies before running, so unapproved native builds will block `pnpm build`.

## HTTPS dev server is mandatory

`vite.config.ts` serves over HTTPS using `localhost.pem` / `localhost-key.pem` (gitignored). The Web Speech API requires a secure context, so the dev server will fail to start without these certs. Generate them with [mkcert](https://github.com/FiloSottile/mkcert):

```bash
mkcert -install
mkcert localhost
```

## Architecture

- **Routing lives entirely in `src/main.tsx`** using react-router v7 in *library* mode (`createBrowserRouter` + `RouterProvider`) — there is no framework-mode config, no loaders/actions. To add a page, create it under `src/pages/` and register a route object in `main.tsx`. `src/App.tsx` is just the index page listing links to each overlay.
- **Each page is a full-viewport overlay.** Pages set their own background (often chroma-key green for OBS) and read layout/visibility from local state. `src/ui/layouts/root.tsx` is a pass-through wrapper.
- **Styling**: Tailwind CSS v4 via the `@tailwindcss/vite` plugin (no `tailwind.config.js`; the single entry is `@import "tailwindcss"` in `src/styles/globals.css`). Component-level variants use `tailwind-variants` (`tv(...)`) — see the `button`/`select`/`textDisplay` definitions in `speech-recognition.tsx` for the established pattern.
- **Font customization via env vars**: `clock.tsx` reads `VITE_CLOCK_FONT` / `VITE_CLOCK_WEIGHT`; `counter.tsx` reads `VITE_COUNTER_FONT` / `VITE_COUNTER_WEIGHT` (`import.meta.env.*`). Set these in a `.env` to theme the overlays without code changes.
- **Keyboard controls** (overlay pages): `F` = fullscreen, `Esc` = exit fullscreen, `C` = toggle the caption view's visibility. Implemented per-page via a `keydown` listener (see `speech-recognition.tsx`).
- **Speech recognition flow** (`speech-recognition.tsx`): wraps the `webkitSpeechRecognition` API with manually-declared TypeScript interfaces (the lib types aren't pulled in). It self-restarts on `onsoundend`/`onerror`/final result to keep continuous captioning alive, and color pickers come from `@uiw/react-color`.

## Known gotchas

- TypeScript uses project references (`tsc -b`): `tsconfig.app.json` covers `src`, `tsconfig.node.json` covers the Vite/config files. Strict mode plus `noUnusedLocals`/`noUnusedParameters` are on, so dead bindings fail the build. Because the whole `src` tree is type-checked, a broken or unused page still fails `pnpm build` even if its route isn't registered in `main.tsx`.
