---
title: LP SEO Operations
status: active
draft_status: n/a
created_at: 2025-12-22
updated_at: 2026-07-23
references:
  - _docs/archives/plan/Membership/seo/plan.md
  - _docs/intent/Membership/lp-seo-master-plan.md
  - .env.example
related_issues: []
related_prs: []
---

## Overview
Join Landing を中心に、SPA でも安定してメタ情報・OG/Twitter・構造化データを反映するための運用ガイド。ポートフォリオ公開時は独自名を主にし、Minecraft は説明語としてのみ扱う。

## Setup
- `.env` に SEO 変数を設定する。
- 本番 URL が確定したら `public/robots.txt` と `public/sitemap.xml` を更新する。
  - デモ公開ドメイン例: `https://clover-support-demo.pages.dev`
  - ロゴ: `public/logo.webp`
  - OG 共有画像: 作成後に `public/` 配置 or 画像URLを `.env` に設定する。

### 環境変数
`.env.example` の以下をプロダクション値で上書きする。
- `VITE_SITE_NAME`
- `VITE_SITE_DESCRIPTION`
- `VITE_SITE_OG_IMAGE` (1200x630 推奨)
- `VITE_SITE_LOGO` (正方形推奨)
- `VITE_SITE_TWITTER`
- `VITE_SITE_LOCALE`
- `VITE_SITE_SOCIALS` (カンマ区切り)

## Metadata
- `src/components/Seo.tsx` が SPA の head 更新を担当。
- 各ページの `Seo` で title/description/canonical/OG/Twitter を設定。
- `/contract`, `/thanks`, `/cancellation`, `/supporters`, `/legal/*`, `/auth/callback` は `noindex` 運用。
- `/demo-flow` は公開デモの導線説明ページとして index 対象にする。
- サイト名の fallback は `Clover Support Demo`。`Minecraft` を主名称にしない。

## Structured Data
- Join Landing で `Organization` / `WebSite` / `WebPage` を JSON-LD として注入。
- ロゴや公式 SNS を設定する場合は `VITE_SITE_LOGO` / `VITE_SITE_SOCIALS` を更新。
- Minecraft / Mojang / Microsoft との公式関係を示す構造化データや文言は入れない。

## Robots / Sitemap
- `public/robots.txt` の `Sitemap` URL を本番ドメインに合わせる。
- `public/sitemap.xml` は `/`, `/demo-flow`, `/membership` を掲載（/join は `/` に正規化）。

## Validation
- Lighthouse の SEO で警告が残らないことを確認。
- OG/Twitter のプレビューと JSON-LD の検証を実施。
