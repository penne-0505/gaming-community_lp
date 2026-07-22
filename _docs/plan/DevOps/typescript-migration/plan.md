---
title: JavaScript to TypeScript Migration
status: active
draft_status: n/a
created_at: 2026-07-23
updated_at: 2026-07-23
references:
  - README.md
  - TODO.md
  - _docs/intent/DevOps/typescript-migration.md
  - _docs/standards/documentation_guidelines.md
  - _docs/standards/documentation_operations.md
related_issues: []
related_prs: []
---

## Overview

Vite React SPA・Cloudflare Pages Functions・Vitest・設定一式を TypeScript に一括切替する。単一ブランチ / 単一 PR で完了し、マージ時点では `strict: true` かつ `allowJs: false` の安定状態にする。

## Scope

- アプリソース（`src/`）、Pages Functions（`functions/`）、Vitest（`tests/`）、Vite/Vitest 設定の `.ts` / `.tsx` 化
- `typescript` および関連 `@types/*` / `@cloudflare/workers-types` の導入
- tsconfig 分割（app / functions / node）と project references
- ESLint（typescript-eslint）、package scripts（`typecheck` / build 時 `tsc --noEmit`）、lint-staged、Tailwind content glob、`index.html` エントリの追従
- 共有型（`Env`、`DiscordUser`、`PlanKey`、`ImportMetaEnv` / `Window` / 資産宣言）
- 現行ドキュメント（guide / intent / reference / README）のパス参照更新

## Non-Goals

- UI/UX 改修、ページ分割、機能追加
- wrangler プロジェクト化やバインディング追加
- React コンポーネントテストの新設
- archives 配下の歴史ドキュメントのパス更新
- `any` 多用での「通すだけ」の型付け

## Requirements

- **Functional**:
  - 挙動は原則変更しない。型付けのための最小限の正規化（Discord ユーザー形状の共有型 + parse ヘルパ）は許容
  - Pages Functions はファイルベース `onRequest` を維持し、`Env` で `context.env` を型付け
  - `npm run build` は型チェックを含む（`tsc --noEmit` + `vite build`）
- **Non-Functional**:
  - `strict: true`、マージ時点で `allowJs: false`
  - lint / format / lint-staged が `.ts` / `.tsx` に追従
  - ローカルと CI で `typecheck` / `test` / `lint` / `build` が緑

## Design Decisions

### tsconfig 分割

```text
tsconfig.json          # references のみ
tsconfig.app.json      # src/（DOM + Vite）
tsconfig.functions.json # functions/ + tests/（Workers 型）
tsconfig.node.json     # vite.config.ts / vitest.config.ts
```

- `moduleResolution: "bundler"`（app/node）。Functions は Cloudflare 実行環境に合わせる
- JSX: `react-jsx`
- `noEmit: true`（型チェック専用。出力は Vite / Pages ビルドに任せる）

### 共有型

| 型 | 置き場 | 用途 |
|---|---|---|
| `Env` | `functions/types.ts` | Pages `context.env` + テスト `createEnv` |
| `DiscordUser` / session parse | `src/types/discord.ts` + `discordAuth` 側ヘルパ | `username` / `name` 揺れの単一点 |
| `PlanKey` | `src/constants/plans.ts` から導出 | checkout / Pricing |
| `ImportMetaEnv` | `src/vite-env.d.ts` | `VITE_*` |
| `Window` 拡張 | 同上 | `gtag` / `dataLayer` |
| Vite 資産宣言 | 同上 | `*.md?raw`、画像 import |

### ESLint / 設定ファイル

- `typescript-eslint` を追加し、対象を `**/*.{ts,tsx}` に切替（dual 長期運用はしない）
- 既存ルール方針を維持（`react/prop-types` off、unused は `_` ignore）
- `vite.config.js` / `vitest.config.js` → `.ts`
- `eslint.config.js` / `tailwind.config.js` / `postcss.config.js` は JS のまま可（glob のみ TS 化）

## Tasks

1. `_docs/plan/DevOps/typescript-migration/plan.md` と `TODO.md`（Size XL）を登録
2. Toolchain: 依存追加、tsconfig、`vite-env.d.ts`、scripts、Tailwind、エントリ
3. 共有型: `Env`、`DiscordUser`、`PlanKey`、gtag ambient
4. 葉モジュール一括 rename + 型付け
5. Functions ルート + Vitest を `.ts` 化
6. React コンポーネント → ページ（JoinLanding / DemoFlow / Membership は最後）
7. `allowJs` 撤去・strict 固定・検証・ガイド類のパス更新
8. 設計判断を `_docs/intent/DevOps/typescript-migration.md` に記録

## Test Plan

- `npm run typecheck` がエラーゼロ
- `npm run test`
- `npm run lint` / `npm run format`（check）
- `npm run build`
- 手動スモーク: トップ LP、Discord ログイン（または demo）、Checkout 開始、Thanks、Supporters（demo mode 可）

## Deployment / Rollout

- 単一 PR で一括マージ。中間の JS/TS 混在状態はマージしない
- Cloudflare Pages は `functions/**/*.ts` をコンパイルする前提。問題時はビルド設定を確認
- Rollback: 当該 PR を revert。部分的な JS 復帰は行わない

## Risks

| リスク | 扱い |
|---|---|
| Discord user 形状の不整合 | 共有型 + parse ヘルパで正規化。API 契約は変えない |
| Pages の `.ts` Functions ビルド | ローカルは Vitest + 型チェック。デプロイは Cloudflare の TS サポートに依存 |
| `JoinLanding` 体積 | 分割リファクタは Non-Goal。型付けのみ |
| ESM 拡張子 import（tests → functions） | Vite/Vitest が解決できる形に一貫させる |
