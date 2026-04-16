# Minecraft Support Landing

## 概要

MinecraftコミュニティのためのLPと、メンバーシップサービスの導線ページです。

<img width="1782" height="949" alt="image" src="https://github.com/user-attachments/assets/ac4e083a-97ac-48f2-ba06-69cf54f8232a" />
<img width="1782" height="949" alt="image" src="https://github.com/user-attachments/assets/6998d249-338d-4a29-aa0c-f38437eb5891" />
<img width="1782" height="949" alt="image" src="https://github.com/user-attachments/assets/865ae575-3c7c-4b45-817b-d4ccc41d219a" />
<img width="1782" height="949" alt="image" src="https://github.com/user-attachments/assets/2bedc566-18d1-42a2-aa31-fe1d41818a26" />
<img width="1782" height="949" alt="image" src="https://github.com/user-attachments/assets/fe186608-5b1b-4252-9d54-4910f16d063f" />
<img width="1782" height="949" alt="image" src="https://github.com/user-attachments/assets/4aae92f0-ee57-4c97-8b7a-0df501071fe7" />


## プレビュー

前提: Node.js 18以上（開発マシンでは v25.2.1 で確認）。

```bash
npm install
npm run dev   # http://localhost:5173 でプレビュー
npm run build # プロダクションビルド
```

Tailwind CSS は PostCSS 経由でビルドに組み込まれます。`src/styles.css` の `@tailwind` を起点に Vite で生成します。

## 環境変数（デプロイ/Functions）

Cloudflare Pages + Pages Functions を利用する前提の構成です。外部連携系の Functions を動かすには以下の環境変数が必要です。

### Pages Functions（必須）
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`
- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`
- `DISCORD_ROLE_MEMBER_ID`
- `STRIPE_PRICE_ONE_MONTH`
- `STRIPE_PRICE_SUB_MONTHLY`
- `STRIPE_PRICE_SUB_YEARLY`
- `AUTH_TOKEN_SECRET`

### Pages Functions（任意）
- `AUTH_TOKEN_TTL_SECONDS`（セッションクッキーの TTL 秒数）

### Pages（フロント）
- `VITE_APP_BASE_URL`
- `VITE_DISCORD_CLIENT_ID`
- `VITE_DISCORD_REDIRECT_URI`
- `VITE_SENTRY_DSN`（任意）
- `VITE_GA4_MEASUREMENT_ID`（任意）

## 技術スタック
- Vite + React 18
- framer-motion / lucide-react
- Tailwind CSS（PostCSS 経由のビルド）

## ライセンス

このリポジトリは [MITライセンス](LICENSE.txt) の下でライセンスされています。
