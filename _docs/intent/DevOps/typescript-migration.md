---
title: TypeScript Migration Delivery Decisions
status: active
draft_status: n/a
created_at: 2026-07-23
updated_at: 2026-07-23
references:
  - _docs/plan/DevOps/typescript-migration/plan.md
  - TODO.md
  - README.md
related_issues: []
related_prs: []
---

## Overview

JavaScript のみだったリポジトリを TypeScript に移行する際の配信単位と型厳格さについての判断ログ。

## Decision

1. **単一 PR 一括カットオーバー**  
   内部作業はフェーズ化してよいが、マージ可能な中間状態として長期の JS/TS 混在は置かない。

2. **`strict: true` 固定**  
   移行完了時点から strict を有効にし、段階的緩和フラグに依存しない。

3. **`allowJs: false`（マージ時点）**  
   移行完了後は JS ソースを残さない。一時的な allowJs は作業中の便宜に留め、PR マージ条件には含めない。

4. **挙動は原則不変**  
   型付けのための最小限の正規化（例: `DiscordUser` 共有型と parse ヘルパ）のみ許容する。UI 改修・ページ分割・wrangler 化は行わない。

5. **ドキュメント**  
   現行の guide / intent / reference / README のパス参照を `.ts` / `.tsx` に追従する。archives は原則更新しない。

## Rationale

- 短期的な混在マージはレビューと CI の二重パスを増やし、型の穴が残りやすい。
- Size XL の一括移行コストは大きいが、完了後の型安定とツールチェーン単純化の方が長期コストを下げる。
- Cloudflare Pages Functions のファイルベースルーティングは維持し、プロジェクト構造の同時変更（wrangler 化）を避けることでリスクを分離する。

## Alternatives Considered

| 案 | 却下理由 |
|---|---|
| 複数 PR で段階移行（allowJs 期間あり） | 混在期間が長くなり、strict 導入が先送りされる |
| JSDoc のみで型を足す | エディタ体験と Functions/テスト横断の保証が弱い |
| wrangler プロジェクト化を同時実施 | 移行失敗時の切り分けが困難 |

## Outcome

- Plan: `_docs/plan/DevOps/typescript-migration/plan.md`
- Guide: `_docs/guide/DevOps/typescript.md`
- TODO: `DevOps-Refactor-39`（Goal 達成により TODO から削除）
- 検証: `npm run typecheck` / `test` / `lint` / `build` が緑であることを確認済み（2026-07-23）

## Approval

- 承認: penne（単一 PR 一括・strict 固定の合意に基づく）
