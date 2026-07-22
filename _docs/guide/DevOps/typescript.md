---
title: TypeScript Development Guide
status: active
draft_status: n/a
created_at: 2026-07-23
updated_at: 2026-07-23
references:
  - _docs/plan/DevOps/typescript-migration/plan.md
  - _docs/intent/DevOps/typescript-migration.md
  - README.md
related_issues: []
related_prs: []
---

## Overview

本リポジトリは TypeScript を標準言語とする。アプリ（`src/`）、Cloudflare Pages Functions（`functions/`）、Vitest（`tests/`）は `.ts` / `.tsx` で記述し、`strict: true` かつ `allowJs: false` で型チェックする。

## Commands

```bash
npm run typecheck  # tsconfig.app / functions / node を順に --noEmit
npm run build      # typecheck のあと vite build
npm run lint       # ESLint（typescript-eslint）+ Prettier check
npm test           # Vitest（tests/**/*.test.ts）
```

## tsconfig 分割

| ファイル | 対象 |
|---|---|
| `tsconfig.json` | project references |
| `tsconfig.app.json` | `src/`（DOM + Vite） |
| `tsconfig.functions.json` | `functions/` + `tests/`（Workers 型） |
| `tsconfig.node.json` | `vite.config.ts` / `vitest.config.ts` |

## 共有型

- `functions/types.ts` — Pages `Env` / `PagesHandler`
- `src/types/discord.ts` — `DiscordUser` / `parseDiscordUser`
- `src/constants/plans.ts` — `PlanKey`
- `src/vite-env.d.ts` — `ImportMetaEnv` / `Window.gtag` / 資産宣言

## Notes

- エントリは `index.html` → `/src/main.tsx`
- ESLint flat config（`eslint.config.js`）は JS のまま。対象 glob は `**/*.{ts,tsx}`
- 設計判断の経緯は `_docs/intent/DevOps/typescript-migration.md` を参照
