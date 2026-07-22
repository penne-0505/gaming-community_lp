---
title: Backend Test Expansion for Pages Functions
status: proposed
draft_status: n/a
created_at: 2026-01-08
updated_at: 2026-07-23
references:
  - README.md
  - _docs/standards/documentation_guidelines.md
  - _docs/standards/documentation_operations.md
related_issues: []
related_prs: []
---

## Overview
Cloudflare Pages Functions の純粋な関数テストを拡充し、主要フロー（決済、Discord OAuth、サポーター管理、telemetry）の回帰検知を早期に行えるようにする。テストランナーは Vitest を採用し、外部連携はモックで完結させる。

## Scope
- Functions 配下の重要エンドポイントのユニットテスト追加
- 主要フローの入力/出力仕様をテストで固定
- 例外系（外部連携失敗、署名不一致、権限不足など）の回帰検知
- CI（GitHub Actions）での自動実行

## Non-Goals
- e2e テストやブラウザ自動化
- 実外部サービス（Stripe/Discord）との統合テスト
- 本番データ/環境に依存するテスト

## Requirements
- **Functional**:
  - Stripe Webhook、Checkout/Portal Session、Discord OAuth、Supporters API、Telemetry の主要パスをカバー
  - エラーハンドリング（認証失敗、署名検証失敗、必須 env 不足、API 失敗）を明示的にテスト
  - 期待レスポンス（status, body, headers）の検証を統一
- **Non-Functional**:
  - テストは純粋関数レベルで完結（副作用はモック/スタブ）
  - テスト実行はローカルと CI で安定して再現できる
  - 新規 Functions 追加時のテスト追加手順が明確

## Test Strategy
- **Test Runner**: Vitest
- **Test Style**:
  - `functions/` 内の各 Function を直接 import し、Request/Env/Context をスタブして実行
  - 外部 SDK（Stripe/Discord/Sentry）はモックで固定
  - ランタイム依存（`fetch`, `crypto`, `Headers`, `Request`, `Response`）はテスト環境でポリフィルまたは最小限スタブ
- **Target Priorities**:
  1. 決済・認証など収益/権限に直結する Functions
  2. サポーター状態判定やセッション関連
  3. telemetry・監視系
- **Fixtures/Factories**:
  - Stripe イベント payload と Discord OAuth レスポンスのテンプレートを用意
  - 正常/異常のバリエーションを明示的に分ける
- **Env Handling**:
  - 必須環境変数はテスト用にダミー値を明示
  - env 不足時のエラーをテストで保証

## Tasks
- テスト実行基盤の追加（Vitest 設定、npm script）
- Functions 一覧の棚卸しと優先度付け
- Stripe 関連: webhook/checkout/portal の正常系・署名不正・API失敗
- Discord OAuth: 認可コード不正・トークン取得失敗・ユーザー情報取得失敗
- Supporters API: 認証トークン不正・未登録ユーザー
- Telemetry: 無効/不足パラメータ時の挙動
- CI: GitHub Actions で `npm test` を実行

## Test Plan
- ユニットテストで Request/Response の整合性を検証
- 例外シナリオの網羅度を上げ、エラーコードとメッセージを固定
- CI 実行で `node` バージョン固定（README準拠）

## Test Cases (Draft)
### auth.ts
- issueSessionCookie: `AUTH_TOKEN_SECRET` 未設定で例外
- issueSessionCookie: 署名付きトークン生成、Set-Cookie の `HttpOnly`/`SameSite=Lax`/`Max-Age` が入る
- requireSession: cookie なしで 401
- requireSession: 期限切れトークンで 401
- requireSession: 改竄署名で 401
- requireSession: 正常トークンで userId を返す

### discord-oauth.ts
- POST 以外で 405
- 必須 env 欠落で 500
- JSON 不正で 400
- code 欠落で 400
- token 交換失敗で 400（エラーメッセージ含む）
- user fetch 失敗で 400（エラーメッセージ含む）
- guild join 失敗でも 200（警告ログのみ）
- 正常系: Set-Cookie 付き 200、user payload 返却

### create-checkout-session.ts
- POST 以外で 405
- Stripe env 欠落で 503
- JSON 不正で 400
- セッション不正で 401/500（requireSession の戻りに従う）
- priceType 欠落で 400
- priceType 不正で 400
- 正常系: checkout session 作成 200 + url 返却
- Stripe API 失敗で 500

### create-portal-session.ts
- POST 以外で 405
- Stripe env 欠落で 500
- セッション不正で 401/500
- customer 不在で 404
- 正常系: portal session 作成 200 + url 返却
- Stripe API 失敗で 500

### stripe-webhook.ts
- POST 以外で 405
- env 欠落で 500
- 署名ヘッダ欠落で 400
- 署名検証失敗で 400
- checkout.session.completed: role 付与成功で 200
- subscription updated/deleted: status=active/trialing/past_due で付与、その他で剥奪
- resolveDiscordUserId: metadata なし→customer metadata 参照
- Discord API 失敗時: add/remove role エラーで 500
- 未対応イベントで 200（Event ignored）

### api/supporters.ts
- GET 以外で 405
- env 欠落で 500（不足キー表示）
- Stripe search 失敗で 500
- Discord fetch 失敗時: fallback で subscription のみ返却
- 正常系: role 所有メンバーと subscription をマージ
- resolvePlan: metadata/interval の優先順位で plan 決定
- formatDate: 不正値で null

### api/subscription-status.ts
- GET 以外で 405
- Stripe env 欠落で 500
- セッション不正で 401/500
- subscription なしで { ok:false, reason:not_found }
- not cancelled で { ok:false, reason:not_cancelled }
- cancelled で days_left/plan_label を返却
- Stripe API 失敗で 500

### supporters.ts
- accept に text/html 含む場合は `context.next()` を呼ぶ
- それ以外は /api/supporters に 307 リダイレクト

### telemetry.ts
- DEBUG_TELEMETRY=true の時に console が呼ばれる
- SENTRY_DSN ありで captureException を呼ぶ

## Deployment / Rollout
- 既存機能への影響はなし
- CI にテストを追加し、失敗時にブロックする
