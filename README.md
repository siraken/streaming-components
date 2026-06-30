# Streaming Components

OBS ブラウザソース用のオーバーレイ・ツール集。各ページが独立した配信用コンポーネントとして動作する。

## Components

| Component | Path | Description |
|---|---|---|
| Clock | `/clock/` | 現在時刻をリアルタイム表示。タイムゾーン調整対応 |
| Counter | `/counter/` | 汎用カウンター。スコアや回数の表示に |
| Speech Recognition | `/speech-recognition/` | Web Speech API によるリアルタイム自動字幕 |
| Lower Third | `/lower-third/` | アニメーション付き名前・肩書きバナー |
| Visualizer | `/visualizer/` | オーディオスペクトラム風アニメーション |
| Particles | `/particles/` | パーティクルネットワーク背景エフェクト |
| Countdown | `/countdown/` | 配信開始前・休憩・終了用カウントダウン |
| Alert Box | `/alert-box/` | 通知ポップアップ。フォロー・サブスク等 |

## Tech Stack

- [Astro](https://astro.build/) + [React](https://react.dev/) (`client:only="react"`)
- [Tailwind CSS v4](https://tailwindcss.com/) + [tailwind-variants](https://www.tailwind-variants.org/)
- [Cloudflare Workers](https://workers.cloudflare.com/) (`@astrojs/cloudflare` adapter)

## Setup

```bash
pnpm install
pnpm dev
```

## Commands

```bash
pnpm dev       # dev server
pnpm build     # type-check + build
pnpm lint      # Biome lint/format
pnpm deploy    # build + Cloudflare Workers deploy
```

## Usage

OBS のブラウザソースに各コンポーネントの URL を設定して使用する。OBS の Source Visibility イベントによるオーバーレイアニメーションに対応。
