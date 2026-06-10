# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A collection of standalone full-screen browser pages designed to be used as **OBS browser sources** for live streaming overlays. Each route renders one self-contained component (subtitle captions, clock, counter) intended to be added as a separate browser source in OBS — not a multi-page app that users navigate through. The flagship page is `/speech-recognition`, an auto-subtitle generator built on the Web Speech API.

## Commands

This project uses **Bun** (see `bun.lock`).

```bash
bun install        # install dependencies
bun run dev        # start the Vite dev server (HTTPS — see below)
bun run build      # tsc -b (project references) then vite build
bun run lint       # ESLint
bun run preview    # preview the production build
```

There is no test setup. Both ESLint (`eslint.config.js`, wired to `bun run lint`) and Biome (`biome.jsonc`) are configured, but Biome has no npm script — invoke it directly with `bunx biome check` / `bunx biome format`. Biome enforces single quotes and space indentation.

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

- **`src/pages/counter.tsx` is dead/broken code.** It imports `semantic-ui-react`, which is **not** a dependency and is not installed. Its route is commented out in `main.tsx`. Don't re-enable the route or import this page without first adding the missing dependency (or rewriting it to match the Tailwind-based pages) — otherwise the build breaks.
- TypeScript uses project references (`tsc -b`): `tsconfig.app.json` covers `src`, `tsconfig.node.json` covers the Vite/config files. Strict mode plus `noUnusedLocals`/`noUnusedParameters` are on, so dead bindings fail the build.
