---
title: LP Image Bundling Guide
status: active
draft_status: n/a
created_at: 2025-12-20
updated_at: 2026-07-23
references:
  - _docs/draft/lp_image_delivery_r2_transformations.md
  - _docs/draft/design_tokens.md
related_issues: []
related_prs: []
---

## 概要
- LPで使用する画像は外部URLに依存せず、ビルドに同梱して配信する。
- 画像は `src/assets/images/landing/` と `src/assets/images/membership/` に分離し、`src/data/lpImages.ts` で参照を統一する。
- レスポンシブ配信は `srcset` + `sizes` を標準とし、LCPを優先する。

## ディレクトリ構成
- `src/assets/images/landing/hero/`: JoinLanding ヒーロー用（main/sub-left/sub-right）。
- `src/assets/images/landing/gallery/`: JoinLanding ギャラリー用（column-1-1 〜 column-3-3）。
- `src/assets/images/landing/bottom_cta/`: JoinLanding CTA用（left/right/overlay）。
- `src/assets/images/membership/`: Membership ヒーロー用（hero-1〜hero-4）。
- `src/data/lpImages.ts`: 画像名・サイズ・`srcset` を一元管理するマッピング。

## 命名規則
- **Landing Hero**: `landing/hero/main.webp`, `landing/hero/sub-left.webp`, `landing/hero/sub-right.webp`
- **Landing Gallery**: `landing/gallery/column-1-1.webp` 〜 `landing/gallery/column-3-3.webp`
- **Landing CTA**: `landing/bottom_cta/left.webp`, `landing/bottom_cta/right.webp`, `landing/bottom_cta/overlay.webp`
- **Membership Hero**: `membership/hero-1.webp`〜`membership/hero-4.webp`（必要に応じて `-640/-1024/-1600` を付与）

## レスポンシブ配信ルール
- **Gallery / CTA は 320 / 480 / 640 / 1024 / 1600 のバリアントを生成し、`srcset` に含める。**
- **Hero は 320 / 480 / 640 / 1024 / 1600 のバリアントを生成し、`srcset` に含める。**
  - サブ画像（sub-left/right）はモバイル向けに 240px を追加してもよい。
- バリアント追加が難しい場合は実寸幅1エントリの `srcset` でも可とするが、初期表示速度の改善優先で追加を検討する。
- `sizes` はレイアウトに合わせて明示する。
  - **全幅**: `sizes="100vw"`
  - **2/3 幅**: `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 66vw"`
  - **1/3 幅**: `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 33vw"`
  - **固定幅**: `sizes="320px"` など、実際の表示幅に合わせる

## 実装ルール
- `Join` は `joinImages` を参照し、`PhotoFrame` と `<img>` に `srcset/sizes` を渡す。
- `Membership` のヒーローは `homeHeroImages` を参照し、`sizes="100vw"` を指定する。
- LCP対象は `loading="eager"` + `fetchPriority="high"`、それ以外は `loading="lazy"` + `decoding="async"` を基本とする。

## 更新手順
1. `src/assets/images/landing/` または `src/assets/images/membership/` に画像を配置し、命名規則に合わせる。
2. `src/data/lpImages.ts` を更新して `src` / `width` / `height` / `srcset` を登録する。
3. 必要に応じて `-640/-1024/-1600` を追加し、`srcset` を拡張する。
4. `Join` / `Membership` の参照を更新し、表示確認を行う。

### ImageMagick 例（任意でバリアント生成）
```bash
magick input.jpg -strip -quality 82 output.webp
magick input.jpg -strip -quality 82 -resize 320x>  output-320.webp
magick input.jpg -strip -quality 82 -resize 480x>  output-480.webp
magick input.jpg -strip -quality 82 -resize 640x>  output-640.webp
magick input.jpg -strip -quality 82 -resize 1024x> output-1024.webp
magick input.jpg -strip -quality 82 -resize 1600x> output-1600.webp
```

## 確認方法
- `npm run dev` で `Join` / `Home` を表示し、画像の欠落やレイアウト崩れがないことを確認する。
