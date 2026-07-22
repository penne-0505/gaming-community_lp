---
title: Analytics & Error Reporting Hooks Intent
status: active
draft_status: n/a
created_at: 2025-12-21
updated_at: 2026-07-23
references:
  - ../../plan/Membership/roadmap/plan.md
  - ../../archives/draft/analytics_usage.md
related_issues: []
related_prs: []
---

## Overview
Analytics / Error Reporting のフック運用方針を記録し、実配信接続時の基準にする。

## Decision
- フロント/Functions のフックは共通の呼び出し点として維持する。
- 実配信は環境設定とセキュリティ確認を満たした段階で行う。

## Rationale
- 実装と運用の切り分けを維持し、段階的に導入するため。

## Outcome
- 追跡イベントの実装箇所と責務が整理される。

## Implementation (GA4: Frontend / gtag.js)

### Env
- Frontend (Vite): `VITE_GA4_MEASUREMENT_ID` を設定する。
  - 未設定の場合、[src/analytics.ts](../../../src/analytics.ts) の `trackEvent` / `trackPageView` は no-op。

### What is tracked
- 画面遷移: React Router の location 変化で `page_view` を送信する。
  - 実装: [src/App.tsx](../../../src/App.tsx) の `RouteAnalytics`
- イベント: アプリ内の `trackEvent(name, params)` 呼び出しを GA4 イベントとして送信する。
  - 実装: [src/analytics.ts](../../../src/analytics.ts)

### Setup steps (GA4)
1. Google Analytics で GA4 プロパティを作成する（既存があればそれを使用）。
2. データストリーム（Web）を作成し、Measurement ID（`G-...`）を控える。
3. Cloudflare Pages の Environment variables に `VITE_GA4_MEASUREMENT_ID=G-...` を設定する。
   - 本番/プレビューを分けない場合は Production/Preview 両方に同じ値を設定する。
4. デプロイ（または再デプロイ）して反映する。

### Verification
- GA4 管理画面の Realtime / DebugView で `page_view` とイベントが届くことを確認する。
- ブラウザでページ遷移（例: `/` → `/membership`）し、`page_view` が複数回記録されることを確認する。

## Notes
- `send_page_view: false` で初期化し、SPA の画面遷移は明示的に `page_view` を送信する。
- 送信はフロント側で完結する（Measurement Protocol は Functions 側で必要になったタイミングで追加）。

## Implementation (Sentry)

### Env
- Frontend (Vite): `VITE_SENTRY_DSN`
- Functions (Pages Functions): `SENTRY_DSN`

### Frontend
- 実装: [src/analytics.ts](../../../src/analytics.ts)
- `VITE_SENTRY_DSN` が設定されている時だけ `@sentry/browser` を初期化し、`captureError(error, context)` から `Sentry.captureException` を送信する。

### Pages Functions
- 実装:
  - グローバル middleware: [functions/_middleware.ts](../../../functions/_middleware.ts)
  - 手動送信（hook）: [functions/telemetry.ts](../../../functions/telemetry.ts)

#### Cloudflare 設定（必須）
- `@sentry/cloudflare` は `AsyncLocalStorage` が必要なため、Cloudflare Pages / Workers の Compatibility Flags に以下いずれかを設定する。
  - 推奨: `nodejs_als`
  - 代替: `nodejs_compat`

### Verification
- フロント: 既存の `captureError(...)` が呼ばれる導線（例: OAuth 失敗）で Sentry にイベントが届くこと。
- Functions: わざと `SENTRY_DSN` を設定した上で失敗ケース（例: `STRIPE_SECRET_KEY` 欠落など）を再現し、Sentry に例外が届くこと。

### Sourcemaps（任意）
- スタックトレースを読みやすくするには、Sentry の sourcemaps upload を設定する。
  - 例: `npx @sentry/wizard@latest -i sourcemaps`

## Approval
- 承認: penne
