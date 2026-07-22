# Clover Support Demo

Minecraft向けコミュニティ支援フローを題材にした、ポートフォリオ用のReact + Cloudflare Pages Functionsデモです。

この公開版はデモモードを既定にしており、実際の決済、契約、Discord参加、ロール付与、ゲーム内特典提供は行いません。Minecraft / Mojang / Microsoft の公式サービス、承認済みサービス、提携サービスでもありません。

<img width="1782" height="949" alt="image" src="https://github.com/user-attachments/assets/ac4e083a-97ac-48f2-ba06-69cf54f8232a" />
<img width="1782" height="949" alt="image" src="https://github.com/user-attachments/assets/6998d249-338d-4a29-aa0c-f38437eb5891" />
<img width="1782" height="949" alt="image" src="https://github.com/user-attachments/assets/865ae575-3c7c-4b45-817b-d4ccc41d219a" />
<img width="1782" height="949" alt="image" src="https://github.com/user-attachments/assets/2bedc566-18d1-42a2-aa31-fe1d41818a26" />
<img width="1782" height="949" alt="image" src="https://github.com/user-attachments/assets/fe186608-5b1b-4252-9d54-4910f16d063f" />
<img width="1782" height="949" alt="image" src="https://github.com/user-attachments/assets/4aae92f0-ee57-4c97-8b7a-0df501071fe7" />


## 何を見せるデモか

- LP、支援プラン、申し込み前確認、完了画面、解約画面、支援者一覧のUIフロー
- 静的ReactフロントとCloudflare Pages Functionsの責務分担
- Discord OAuth、Stripe Checkout / Portal / Webhook、サポーター取得APIの参考実装
- デモ公開時に外部APIを呼ばない安全境界

## ローカルプレビュー

前提: Node.js 18以上（開発マシンでは v25.2.1 で確認）。

```bash
npm install
npm run dev        # http://localhost:5173 でプレビュー
npm run typecheck  # TypeScript（strict）
npm run build      # typecheck + プロダクションビルド
npm run lint       # ESLint + Prettier check
npm test           # Vitest
```

Tailwind CSS は PostCSS 経由でビルドに組み込まれます。`src/styles.css` の `@tailwind` を起点に Vite で生成します。

## デモモード

`.env.example` では `DEMO_MODE=true` / `VITE_DEMO_MODE=true` を既定にしています。この状態では次のように動きます。

- `beginDiscordLogin` は実Discord OAuthへ遷移せず、モックユーザーを保存します。
- `/demo-flow` は、一般流入向けLP導線とMembership導線をタブで説明する公開デモ用ハブです。
- LP の Discord CTA は、`VITE_DISCORD_INVITE_URL` が未設定でも disabled にせず、toast から `/demo-flow?tab=lp` へ案内します。
- `/create-checkout-session` はStripe Checkoutを作らず、デモ用の完了URLを返します。
- `/create-portal-session` は410を返し、外部ポータルを開きません。
- `/stripe-webhook` は署名検証やDiscord Bot API呼び出しをせず、デモとして受け流します。
- `/api/supporters`, `/api/checkout-session`, `/api/subscription-status` はモックデータを返します。

参考実装として実連携を検証する場合だけ、`DEMO_MODE=false` と `VITE_DEMO_MODE=false` を明示し、下記の環境変数を設定してください。

### Pages Functions（参考実装）
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
- `VITE_DISCORD_INVITE_URL`（任意。未設定時は `/demo-flow?tab=lp` への toast 導線へ切り替え）
- `VITE_SENTRY_DSN`（任意）
- `VITE_GA4_MEASUREMENT_ID`（任意）

## 技術スタック
- Vite + React 18 + TypeScript（`strict: true` / `allowJs: false`）
- React Router / framer-motion / lucide-react
- Tailwind CSS（PostCSS 経由のビルド）
- Cloudflare Pages Functions（TypeScript）
- Stripe / Discord OAuth（デモでは無効、参考実装として保持）
- Vitest / ESLint（typescript-eslint） / Prettier

型チェックの詳細は `_docs/guide/DevOps/typescript.md` を参照。

## 公開時の注意

- サイト名は独自名を主にし、Minecraftは説明語としてのみ扱います。
- 主要画面とREADMEに「非公式」「実取引なし」を明記しています。
- `/contract`, `/thanks`, `/cancellation`, `/supporters`, `/legal`, `/auth` は検索対象から外す設定です。
- 法務ページは実サービス用の法的文書ではなく、デモ境界を説明する文書です。

## ライセンス

このリポジトリは [MITライセンス](LICENSE.txt) の下でライセンスされています。
