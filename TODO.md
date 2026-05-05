# Project Task Management Rules

## 0. System Metadata
- **Current Max ID**: `Next ID No: 39` (※タスク追加時にインクリメント必須)
- **ID Source of Truth**: このファイルの `Next ID No` 行が、全プロジェクトにおける唯一のID発番元である。

## 1. Task Lifecycle (State Machine)
タスクは以下の順序で単方向に遷移する。逆行は原則禁止とする。

### Phase 0: Inbox (Human Write-only)
- **Location**: `# Inbox (Unsorted)` セクション
- **Description**: 人間がアイデアや依頼を書き殴る場所。フォーマット不問。ID未付与。
- **Exit Condition**: LLMが内容を解析し、IDを付与して `Backlog` へ構造化移動する。

### Phase 1: Backlog (Structured)
- **Location**: `# Backlog` セクション
- **Status**: タスクとして認識済みだが、着手準備未完了。
- **Entry Criteria**: 
  - IDが一意に採番されている。
  - 必須フィールド（Title, ID, Priority, Size, Area, Description）が埋まっている。
- **Exit Condition**: `Ready` の要件を満たす。

### Phase 2: Ready (Actionable)
- **Location**: `# Ready` セクション
- **Status**: いつでも着手可能な状態。
- **Entry Criteria**:
  - **Plan Requirement**:
    - `Size: M` 以上 (M, L, XL): `Plan` フィールドに有効な `_docs/plan/...` へのリンクが**必須**。
    - `Size: S` 以下 (XS, S): `Plan` は **None** でよい。
  - **Dependencies**: 解決済み（または明確化済み）である。
  - **Steps**: 具体的な実行手順（またはPlanへのポインタ）が記述されている。
- **Exit Condition**: 作業者がタスクに着手する。

### Phase 3: In Progress
- **Location**: `# In Progress` セクション
- **Status**: 現在実行中。
- **Entry Criteria**: 作業者がアサインされている（または自律的に着手）。

### Phase 4: Done
- **Location**: なし（行削除）
- **Exit Action**: `Goal` 達成を確認後、リストから物理削除する。

## 2. Schema & Validation
各タスクは以下の厳格なスキーマに従うこと。

| Field | Type | Constraint / Value Set |
| :--- | :--- | :--- |
| **Title** | `String` | `[Category] Title` 形式。Categoryは後述のEnum参照。 |
| **ID** | `String` | `{Area}-{Category}-{Number}` 形式。不変の一意キー。 |
| **Priority** | `Enum` | `P0` (Critical), `P1` (High), `P2` (Medium), `P3` (Low) |
| **Size** | `Enum` | `XS` (<0.5d), `S` (1d), `M` (2-3d), `L` (1w), `XL` (>2w) |
| **Area** | `Enum` | `_docs/plan/` 直下のディレクトリ名と一致する値。 |
| **Dependencies**| `List<ID>`| 依存タスクIDの配列 `[Core-Feat-1, UI-Bug-2]`。なしは `[]`。 |
| **Goal** | `String` | 完了条件（Definition of Done）。 |
| **Steps** | `Markdown` | 進行管理用のチェックリスト（詳細は後述）。 |
| **Description** | `String` | タスクの詳細。 |
| **Plan** | `Path` | `Size >= M` の場合必須。`_docs/plan/` へのパス。`Size < M` は `None` 可。 |

## 3. Field Usage Guidelines

### Area & Directory Mapping
- **Rule**: `Area` フィールドの値は、`_docs/plan/` 直下に実在するディレクトリ名（ドメイン）と一致させること。
- **New Area**: 新しい領域のタスクを作成する場合、まず `_docs/plan/` にディレクトリを作成してから、その名前を `Area` に指定する。
- **Example**: `Area: Core` -> implies existence of `_docs/plan/Core/`

### Steps vs Plan
タスクの規模に応じて `Steps` の記述方針を切り替えること。情報の二重管理を避ける。

- **Case A: Planあり (Size >= M)**
  - `Steps` は **「Planを実行するための進行管理チェックリスト」** として機能する。
  - 詳細な仕様やコードは Plan に記述し、Steps には複製しない。
  - 例: `1. [ ] Planの "DB Schema" セクションに従いマイグレーション作成`

- **Case B: Planなし (Size < M)**
  - `Steps` に **「具体的な作業手順」** を直接記述する。
  - 例: `1. [ ] src/utils/format.ts の dateFormat 関数を修正`

## 4. Defined Enums

### Categories (Title & ID)
ID生成およびタイトルのプレフィックスには以下のみを使用する。
- `Feat` (New Feature)
- `Enhance` (Improvement)
- `Bug` (Fix)
- `Refactor` (Code Structuring)
- `Perf` (Performance)
- `Doc` (Documentation)
- `Test` (Testing)
- `Chore` (Maintenance/Misc)

### Areas (Examples)
**※実際には `_docs/plan/` のディレクトリ構成に従う。**
- `Core`: 基盤ロジック
- `UI`: プレゼンテーション層
- `Docs`: ドキュメント整備自体
- `General`: 特定ドメインに属さない雑多なタスク
- `DevOps`: CI/CD, 環境構築

## 5. Operational Workflows (for LLM)

### [Action] Create Task from Inbox
1. `Next ID No` を読み取り、割り当て予定のIDを決定する。
2. `Next ID No` をインクリメントしてファイルを更新する。
3. Inboxの内容を解析し、最適な `Area` と `Category` を決定する。
4. IDを生成する（例: `Core-Feat-24`）。
5. タスクをフォーマットし、`Backlog` の末尾に追加する。
6. 元のInbox行を削除する。

### [Action] Promote to Ready
1. **Size check**:
   - `Size >= M` ならば、`Plan` フィールドが有効なリンクであることを検証する。リンク切れや未作成の場合は移動を拒否する。
   - `Size < M` ならば、`Plan` が `None` でも許容する。
2. **Steps check**: `Steps` が具体的か（あるいはPlanへのポインタとして機能しているか）確認する。
3. **Dependency check**: 依存タスクが完了済みか確認する。
4. 全てクリアした場合のみ `Ready` セクションへ移動する。

## 6. Task Definition Examples (Few-Shot)

以下の例を参考に、サイズ（Size）に応じた記述ルール（Planの有無、Stepsの粒度）を厳守すること。

### Case A: Feature Implementation (Size >= M)
**Rule**: `Plan` へのリンクが必須。`Steps` はPlanの参照ポインタとして記述する。

```markdown
- **Title**: [Feat] User Authentication Flow
- **ID**: Core-Feat-25
- **Priority**: P0
- **Size**: M
- **Area**: Core
- **Dependencies**: []
- **Goal**: ユーザーがEmail/Passwordでサインアップおよびログインできる状態にする。
- **Steps**:
  1. [ ] Planの "Schema Design" セクションに基づき、Userテーブルのマイグレーションを作成・適用
  2. [ ] Planの "API Specification" に従い、`/auth/login` エンドポイントを実装
  3. [ ] Planの "Security" に記載されたJWT発行ロジックを実装
  4. [ ] E2Eテストを実施し、ログインフローの疎通を確認
- **Description**: 新規サービスの基盤となる認証機能を実装する。
- **Plan**: `_docs/plan/Core/auth-feature.md`
````

### Case B: Small Fix / Maintenance (Size \< M)

**Rule**: `Plan` は `None` でよい。`Steps` に具体的なコード修正手順を記述する。

```markdown
- **Title**: [Bug] Fix typo in Submit button
- **ID**: UI-Bug-26
- **Priority**: P2
- **Size**: XS
- **Area**: UI
- **Dependencies**: []
- **Goal**: ログイン画面のボタンのラベルが "Subimt" から "Submit" に修正されている。
- **Steps**:
  1. [ ] `src/components/LoginForm.tsx` を開く
  2. [ ] Submitボタンのラベル文字列を修正する
  3. [ ] ブラウザで表示を確認し、レイアウト崩れがないか確認
- **Description**: ユーザーから報告された誤字の修正。
- **Plan**: None
```

### Case C: New Area / Doc Task (Size S)

**Rule**: 新しいAreaが必要な場合、ディレクトリ作成を含む。

```markdown
- **Title**: [Doc] Add Deployment Guide
- **ID**: DevOps-Doc-27
- **Priority**: P1
- **Size**: S
- **Area**: DevOps
- **Dependencies**: [Core-Feat-25]
- **Goal**: 新メンバー向けのデプロイ手順書が `_docs/guide/deployment.md` に作成されている。
- **Steps**:
  1. [ ] `_docs/plan/DevOps/` ディレクトリが存在しないため作成する (Area定義用)
  2. [ ] `_docs/guide/deployment.md` を作成し、ステージング環境へのデプロイ手順を記述
- **Description**: オンボーディングコスト削減のため、暗黙知になっているデプロイ手順をドキュメント化する。
- **Plan**: None
```

--- 

## Inbox

---

## Backlog
- **Title**: [Enhance] Define Demo Boundary
- **ID**: Membership-Enhance-31
- **Priority**: P0
- **Size**: S
- **Area**: Membership
- **Dependencies**: []
- **Goal**: OSS公開用デモとして、実取引・実Discord参加・実ロール付与を行わない境界がコード上で一貫している。
- **Steps**:
  1. [ ] `src/pages/Membership.jsx` / `src/pages/Contract.jsx` / `src/pages/Thanks.jsx` / `src/pages/Cancellation.jsx` の現状デモ化箇所を棚卸しする
  2. [ ] デモ用の単一方針（例: `DEMO_MODE` 定数、mock data、実API非呼び出し）を決める
  3. [ ] コメントアウトによる本番バイパスを、明示的なデモ実装へ置き換える対象を確定する
  4. [ ] `npm run build` と主要ページのブラウザ確認で、実連携なしにデモ導線が完結することを確認する
- **Description**: 現状は本番実装を一部コメントアウトしているため、デモページとしての責務境界が曖昧。後続タスクの前提として、デモ専用の制御点と mock 表示方針を固定する。
- **Plan**: None

- **Title**: [Refactor] Disable Production Integrations for Demo
- **ID**: Membership-Refactor-32
- **Priority**: P0
- **Size**: S
- **Area**: Membership
- **Dependencies**: [Membership-Enhance-31]
- **Goal**: 公開デモ環境で Stripe / Discord の実APIが誤って呼ばれない。
- **Steps**:
  1. [ ] `functions/discord-oauth.js` の guild join / session issue をデモ公開時に実行しない形へ変更する
  2. [ ] `functions/create-checkout-session.js` / `functions/create-portal-session.js` / `functions/stripe-webhook.js` をデモ公開時に mock / 410 / no-op のいずれかへ寄せる
  3. [ ] `functions/api/supporters.js` / `functions/api/subscription-status.js` / `functions/api/checkout-session.js` を mock data 返却または明示的な demo-only response に統一する
  4. [ ] Functions のテストを、デモモードで外部APIを呼ばないことを確認する形へ更新する
- **Description**: OSS化後に本番決済・Discord Bot・Guild/Role 操作が残るのは公開リスクが高い。参考実装を残す場合でも、デモとして実行される経路からは切り離す。
- **Plan**: None

- **Title**: [Enhance] Replace Transaction Copy with Demo Copy
- **ID**: Membership-Enhance-33
- **Priority**: P0
- **Size**: S
- **Area**: Membership
- **Dependencies**: [Membership-Enhance-31]
- **Goal**: 価格、特典、CTA、FAQ、完了/解約画面が実取引や実特典提供を示唆しない。
- **Steps**:
  1. [ ] `src/constants/plans.js` と `src/constants/pricingCopy.js` の価格・特典・CTAをデモ表現に変更する
  2. [ ] `/membership` の Stripeポータル導線をデモ用の無害な表示に置き換える
  3. [ ] `/contract` の同意文言とボタン文言を、実規約同意・実請求ではなく画面遷移デモとして明確化する
  4. [ ] `/thanks` / `/cancellation` の支払いID、ロール付与、解約完了などの文言を mock と分かる表現へ変更する
- **Description**: サンプル告知は追加済みだが、カード・FAQ・完了画面の具体コピーがまだ実決済/実特典に見える。画面全体で「実績デモ」として読める状態にする。
- **Plan**: None

- **Title**: [Enhance] Align Minecraft Branding and Disclaimer
- **ID**: Membership-Enhance-34
- **Priority**: P0
- **Size**: S
- **Area**: Membership
- **Dependencies**: [Membership-Enhance-31]
- **Goal**: Minecraft公式・Mojang/Microsoft承認と誤認されにくいサイト名、SEO、表示になっている。
- **Steps**:
  1. [ ] Header / Footer / SEO / README の主名称で `Minecraft` が支配的になっている箇所を棚卸しする
  2. [ ] 独自名を主、Minecraft は説明語にする命名へ調整する
  3. [ ] 免責表示をフッターだけでなく初回視認範囲または主要デモ説明にも出す
  4. [ ] `index.html`, `src/utils/seo.js`, `.env.example`, `public/og-image` 参照の整合を確認する
- **Description**: 公式 Usage Guidelines では公式/承認/関連の誤認回避と目立つ免責表示が重要。現状の `Minecraft Community` 主名はデモ公開時のリスクになり得るため、表現を調整する。
- **Plan**: None

- **Title**: [Doc] Convert Legal Pages to Demo Documents
- **ID**: Membership-Doc-35
- **Priority**: P1
- **Size**: S
- **Area**: Membership
- **Dependencies**: [Membership-Enhance-33]
- **Goal**: 法務ページが実サービスの法的表示ではなく、デモ用文書であることが明確になっている。
- **Steps**:
  1. [ ] `src/legal/content/*.md` のダミー本文を、デモ用途の短い説明文へ置き換える
  2. [ ] `src/legal/content/specified-commercial-transaction.md` 先頭の `dummy#` 表示崩れを修正する
  3. [ ] `src/legal/config.js` の description をデモ文書として統一する
  4. [ ] Footer の法務リンク表示がデモ文書として誤解を生まないか確認する
- **Description**: 現在の legal md は全てダミーで、特商法ページはMarkdown崩れもある。実取引なしのデモとして公開するなら、法務ページ自体もデモ文書として整える。
- **Plan**: None

- **Title**: [Enhance] Update SEO and Indexing for Portfolio Demo
- **ID**: Membership-Enhance-36
- **Priority**: P1
- **Size**: S
- **Area**: Membership
- **Dependencies**: [Membership-Enhance-34, Membership-Doc-35]
- **Goal**: 検索エンジンに出したいページと出したくないデモ内部ページが分離されている。
- **Steps**:
  1. [ ] `public/robots.txt` と `public/sitemap.xml` の公開対象を見直す
  2. [ ] `/contract`, `/thanks`, `/cancellation`, `/supporters`, `/legal/*` に `noIndex` が必要か判断し実装する
  3. [ ] `index.html` の `google-site-verification` と初期 meta が公開デモに不要なら除去またはプレースホルダー化する
  4. [ ] `src/utils/seo.js` の fallback siteName / description / ogImage をデモ向けに更新する
- **Description**: 現状は sitemap に内部デモ画面まで含まれ、SEO fallback も旧名称が混在している。OSS実績ページとして、index対象を絞る。
- **Plan**: None

- **Title**: [Doc] Rewrite OSS Demo Documentation
- **ID**: Membership-Doc-37
- **Priority**: P1
- **Size**: S
- **Area**: Membership
- **Dependencies**: [Membership-Refactor-32, Membership-Enhance-33, Membership-Enhance-34, Membership-Doc-35, Membership-Enhance-36]
- **Goal**: README と環境変数例から、これは実取引なしのOSSデモであり、本番連携は参考/無効であることが初見で理解できる。
- **Steps**:
  1. [ ] `README.md` の概要を、実績デモ・実取引なし・外部連携無効を先頭に置いて再構成する
  2. [ ] `.env.example` をデモ起動に必要な値と、参考実装用の値に分ける
  3. [ ] Cloudflare Pages Functions / Stripe / Discord の説明を、デモ公開時の注意と参考実装の境界に書き換える
  4. [ ] 実行手順、検証コマンド、主要ページ一覧、免責を README に反映する
- **Description**: 現 README は本番運用導入手順に読める。OSS公開物として、何がデモで何が参考実装かを明確にする。
- **Plan**: None

- **Title**: [Test] Restore Verification Baseline
- **ID**: DevOps-Test-38
- **Priority**: P1
- **Size**: S
- **Area**: DevOps
- **Dependencies**: [Membership-Refactor-32, Membership-Enhance-33, Membership-Enhance-34, Membership-Doc-35, Membership-Enhance-36, Membership-Doc-37]
- **Goal**: `npm run build`, `npm run lint`, `npm test`, `npm audit --omit=dev`, 主要ページのブラウザ確認が公開前チェックとして通る、または残リスクが明記されている。
- **Steps**:
  1. [ ] `tests/utils/http.js` の `node-fetch` 依存欠落を修正する
  2. [ ] デモ化後の Functions / pages に合わせて既存テストを更新する
  3. [ ] `react-router-dom` / `@remix-run/router` / `qs` の audit 指摘を解消または理由付きで記録する
  4. [ ] `/`, `/membership`, `/contract`, `/thanks`, `/cancellation`, `/legal/specified` を Playwright で確認し、console error を潰す
- **Description**: 現状 `npm run build` と `npm run lint` は通るが、`npm test` は `node-fetch` 解決不能で失敗し、audit も指摘あり。公開前の最低限の検証基準を戻す。
- **Plan**: None

---

## Ready

---

## In Progress
