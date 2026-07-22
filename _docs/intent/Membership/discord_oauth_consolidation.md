---
title: Discord OAuth Consolidation Intent
status: active
draft_status: n/a
created_at: 2026-01-08
updated_at: 2026-07-23
references:
  - ../../archives/plan/Membership/discord-oauth-consolidation/plan.md
  - ../../archives/draft/Membership/discord-oauth-consolidation.md
related_issues: []
related_prs: []
---

## Overview
Discord OAuth の開始・コールバック処理を共通化し、`Membership`/`Contract`/`AuthCallback` の重複実装を削減する判断を記録する。

## Decision
- `/auth/callback` を正規のコールバックとして維持する（Redirect URI の互換性を優先）。
- `Membership`/`Contract` のエラーメッセージと導線はページごとに維持する。
- 共通化は `src/utils/discordAuth.ts` に集約し、ページ側は呼び出しに限定する。

## Rationale
- 既存の Redirect URI 変更は外部設定やリンクに影響するため、互換性を重視する。
- エラー文言はページ固有の導線があるため統一しない。
- 認証フローの差分を減らし、保守性を高める。

## Outcome
- OAuth 開始/コード交換/ユーザー保存の重複が減り、挙動の差異が抑制される。

## Approval
- 承認: penne
