---
title: Legal Documents Guide
status: active
draft_status: n/a
created_at: 2025-12-07
updated_at: 2026-07-23
references:
  - ../../plan/Membership/roadmap/plan.md
related_issues: []
related_prs: []
---

## 概要
`/legal` でデモ用文書をタブ切り替え表示する構成です。ポートフォリオ公開版では実サービスの法的文書ではなく、実取引なし・非公式デモ・外部連携の境界を説明する文書として扱います。

## 取扱い方針
- `src/legal/content/` 配下に各文書の本文（Markdown）を配置します。
- `src/legal/config.ts` で文書のメタ情報と表示順を管理します。
- `/legal/*` は `noindex` とし、サイトマップには含めません。
- 実サービスへ転用する場合は、事業内容と法域に合わせた法的文書へ差し替えてください。

## 関連ファイル
- `src/legal/content/` 配下の各ファイル
- `src/legal/config.ts`
- `src/legal/LegalDocPage.tsx`
