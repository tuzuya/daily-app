# 開発ガイド（技術・アーキテクチャ・コード仕様）

このファイルは **「どう作るか」（HOW）** をまとめた開発の前提です。
プロダクト要件・画面定義・ロードマップは `docs/ai-product-brief.md` を参照。

---

## 1. 技術スタック
- **フロントエンド**: Next.js（App Router）+ Vercel
- **Language**: TypeScript
- **UI**: Tailwind CSS v4
- **UI utilities**: shadcn, Radix関連, Headless UI
- **バックエンドAPI**: Hono + Cloudflare Workers
- **DB / 認証 (BaaS)**: Supabase（PostgreSQL + Auth）
- **ORM**: Drizzle ORM
- **型安全**: Hono RPC による End-to-End Type Safety
- **Lint**: ESLint
- **Runtime**: Node.js（npm / `package-lock.json` あり）
- **デプロイ**: Vercel（フロント）, Cloudflare Workers（API）

## 2. リポジトリの主要ディレクトリ
- `src/`: フロントエンド（Next.js アプリ本体）
- `src/app/`: App Router 配下（ルーティング/レイアウト/ページ）
- `src/app/global.css`: グローバルスタイル（アニメーション含む）
- `src/app/components/`: 画面固有コンポーネント
- `components/` / `lib/`: 共通コンポーネントやユーティリティ（実態に合わせて更新）
- `lib/utils.ts`: `cn` ユーティリティ（`clsx` + `tailwind-merge`）
- `types/`: 型定義
- `docs/`: 仕様・調整ガイド・運用ドキュメント
- （バックエンド）: Hono + Cloudflare Workers の配置はプロジェクト構成に合わせて追加（例: `api/` または別リポジトリ）
- （スキーマ）: Drizzle スキーマ定義（配置はプロジェクトに合わせて）

## 3. アーキテクチャ / データモデル

### 3.1 技術選定の経緯

**フロントエンド & ホスティング**
- **技術**: Next.js (App Router) + Vercel
- **選定理由**: React/Next.js のエコシステムを最大限活用するため。Vercelは個人開発のテスト環境から将来のWeb一般公開（本番）までシームレスにスケール可能で、移行の手間がないため。

**バックエンド API**
- **技術**: Hono + Cloudflare Workers
- **選定理由**: フロントエンド（UI）とバックエンド（データ処理）を分離するモダンで実務的なアーキテクチャを学ぶため。Cloudflareのエッジ環境で極限まで軽量かつ高速なAPIレスポンスを実現するため。Hono RPC でフロント・バック間の End-to-End 型安全を確保し、開発体験を向上させるため。

**データベース & 認証 (BaaS)**
- **技術**: Supabase (PostgreSQL)
- **選定理由**: Todo、ユーザー、タグなどのリレーショナルデータとPostgreSQLの相性が良いため。認証（Supabase Auth）が内包され、友人共有時のセキュアなログインを容易に実装できるため。無料枠が広く、コストを抑えつつスケール可能なため。

**ORM**
- **技術**: Drizzle ORM
- **選定理由**: サーバーレス・エッジ環境（Vercel/Cloudflare）において、Prisma等の「重いエンジンによるコールドスタートの遅延」を排除するため。PWAとしてスマホから起動した際の「もっさり感」を無くし、ネイティブアプリのようなサクサク感を実現するため。TypeScriptでSQLに近い構文で記述でき、モダンな開発体験を得られるため。

### 3.2 リクエストフロー
```
ブラウザ (Next.js) → Hono API (Cloudflare Workers) → Drizzle ORM → Supabase PostgreSQL
```

### 3.3 データモデル（Drizzle スキーマ想定）
```
Task
  id:               String (UUID, PK)
  title:            String
  category:         String          // "routine" | "health" | "physical" | "knowledge" | "activity" | "creative"
  points:           Int (default 0)
  done:             Boolean (default false)
  description:      String?
  deadline:         String?         // YYYY-MM-DD
  imageUrl:         String?
  estimatedMinutes: Int?
  screen:           String          // "today" | "next" | "overdue" | "buffs"
  createdAt:        DateTime (auto)
  updatedAt:        DateTime (auto)
```

- **DayLog**（将来追加予定）
  - date: YYYY-MM-DD
  - note: string（当日の自由メモ）
  - mood?: 1..5 / string（任意）

### 3.4 構築ステップ
1. Supabase プロジェクト作成 + 接続URL取得（手動）
2. Hono + Cloudflare Workers プロジェクト構築
3. Drizzle 導入 + スキーマ定義 + マイグレーション
4. Hono RPC 設定（フロント・バック間の型共有）
5. Next.js 側から Hono API を呼び出し（モックデータ → API経由に差し替え）
6. Vercel（フロント）・Cloudflare Workers（バック）環境変数設定

### 3.5 データ永続化ルール
- UI → Hono API (Cloudflare Workers) → Drizzle → Supabase DB の流れを守る。
- フロントエンドが直接DBを触る実装は避け、必ずバックエンド API 経由にする。
- バックエンドの `.env` に Supabase 接続情報（`DATABASE_URL` 等）を設定する。

## 4. ルーティング（App Router）
ディレクトリ: `src/app/`

- `/today` → `src/app/today/page.tsx` — 当日のTodo（現状はプレースホルダー）
- `/buffs` → `src/app/buffs/page.tsx` — 「Suggest」タブ相当（現状はプレースホルダー）
- `/overdue` → `src/app/overdue/page.tsx` — 未達成タスク（現状はプレースホルダー）
- `/next` → `src/app/next/page.tsx` — 作成済み（現状はプレースホルダー）
- `/profile` → `src/app/profile/page.tsx` — プロフィール/設定（現状はプレースホルダー）
- `/` → `src/app/page.tsx` — 現状はサンプル。将来は `/today` へリダイレクト/案内にする想定

未作成:
- `/login`（将来追加、ログイン→演出→`/today`）

## 5. 画面レイアウト（レイヤー構成）
ファイル: `src/app/layout.tsx`

- **背景（最背面 z-0）**: オーロラ風のぼかし要素（紫/青）
- **SpaceNavigator（z-10）**: タブ4画面を宇宙空間に同時配置し、カメラ移動で切り替える（後述）
- **children フォールバック（z-5）**: SpaceNavigator 対象外のルート（`/profile` 等）は従来の `children` で表示
- **フローティングUI（z-50）**:
  - 右上: `TopMenu`（三本線メニュー → Profile等）
  - 下部: `GooeyNav`（タブナビ）

### 5.1 SpaceNavigator（カメラ移動式ナビゲーション）
ファイル: `src/app/components/SpaceNavigator.tsx`

- **考え方**: 4つの画面（Today/Next/Overdue/Buffs）が宇宙空間に**常に同時描画**されている。タブを押すと、カメラ（`motion.div` の `x/y`）がスプリングアニメーションでその画面の位置まで移動する。
- **座標マップ**: `src/app/components/page-space.ts` に各ルートの 2D 座標を定義。
  - `/today`: `(0, 0)` — 中心
  - `/next`: `(-1, 0)` — 左
  - `/overdue`: `(0, 1)` — 下
  - `/buffs`: `(1, 0.5)` — 右下
- **画面間の間隔**: viewport幅/高さの 115%（`SPACING = 1.15`）。画面同士が重ならないように余白を確保。
- **`/` へのアクセス**: `src/app/page.tsx` で `/today` にリダイレクト。SpaceNavigator内でも `/` は `/today` 扱い。
- **非タブルート**: SpaceNavigator は `null` を返し、layout の `{children}` が表示される（`/profile` 等）。
- **ScrollingText**: layout ではなく `TodayContent`（SpaceNavigator内）だけに配置。Today画面専用の演出。

## 6. コンポーネント仕様

### 6.1 GooeyNav（タブナビ）
ファイル: `src/app/components/GooeyNav.tsx`

**仕様（挙動）**:
- **ルート同期**: `usePathname()` で現在のパスを監視し、`items[].href` と一致するタブをアクティブ表示
  - `href` は内部で正規化され、`"today"` でも `"/today"` でも最終的に `"/today"` 扱いになる
- **遷移**: クリック/キーボード（Enter/Space）で `router.push()` する
- **アニメーション**:
  - pill（白いカプセル）が移動して、粒子が飛ぶ"グミ/スライム"風エフェクト
  - `ResizeObserver` でリサイズ時にエフェクト位置を再計算

**Gooeyフィルタ（液体っぽさ）**:
- `<filter id="gooey">` を定義し、`.effect.filter { filter: url("#gooey"); }` で適用

**粒子カラー（CSS変数依存）**:
- 粒子色は `var(--color-1..4)` を参照。`:root` に定義（`src/app/global.css`）

### 6.2 ScrollingText（背景演出）
ファイル: `src/app/components/ScrollingText.tsx`

- 2段の巨大テキストを、左右逆方向に流す
- 文言は `textLine1` / `textLine2` 配列
- 周期: `CYCLE_MS = 3800`

**重要**: CSS側のアニメーション時間と **必ず一致**させる（同期がズレると、切替と移動が噛み合わない）
- `CYCLE_MS = 3800ms` ↔ `global.css` の `.motivation-forward/.motivation-reverse` の duration `3.8s`
- 調整方法の詳細は `docs/explain/scrolling-text-tuning.md` を参照

### 6.3 SpaciousButton
ファイル: `src/app/components/SpaciousButton.tsx`

- グラデーション背景 + hover/active で光る"背面エフェクト"を持つボタン
- 背面の光るエフェクトは `div` を使って疑似要素的に表現している

### 6.4 GlassSurface（命名/配置に注意）
同等の実装が複数箇所に存在する:
- `components/GlassSurface.jsx`
- `src/app/components/GrassSurface.jsx`（中身は `GlassSurface`）

暫定ルール:
- 実装を進める前に、**どちらを正とするか**決める（`src/app/components` へ寄せる等）
- 片方を直すだけで満足せず、参照元（import先）も含めて統一する

## 7. グローバルCSS（テーマ / モーション / 色）
ファイル: `src/app/global.css`

### 7.1 Tailwind/shadcnのベース
- `@import "tailwindcss";`
- `@import "tw-animate-css";`
- `@import "shadcn/tailwind.css";`

### 7.2 カラートークン
- `:root` / `.dark` にOKLCHベースのトークンが定義されている

### 7.3 ScrollingText用のkeyframes
- `@keyframes motivation-burst-from-right`
- `@keyframes motivation-burst-from-left`
- `.motivation-forward` / `.motivation-reverse` が `3.8s linear both`

### 7.4 GooeyNav用ネオンパレット
`--color-1..4` が `:root` に定義されており、GooeyNavの粒子色に使われる。

## 8. コーディングルール（このプロジェクトの作法）

### 8.1 変更は「最小で筋の良い差分」
- 既存UI/モーション（特に `global.css` のアニメーション）に影響が出やすいので、変更範囲は狭く保つ。
- クラス名の衝突や副作用を避ける（グローバルCSSは影響範囲が広い）。

### 8.2 日付の扱い（必ずローカル日付を基準に）
- 1日の単位はユーザーのローカル日付（YYYY-MM-DD）で扱う。
- `Date` のUTC混入で日付がズレる事故を避ける（例: `toISOString()` の安易な利用をしない）。

### 8.3 ファイル分割とコンポーネント化
- 1つのファイルに複数の責務を詰め込みすぎない。ファイルが肥大化してきたら分割を検討する。
- 複数の画面やコンポーネントから使い回す可能性があるもの（UI部品、ユーティリティ関数、型定義、定数マップなど）は、早い段階で独立したファイル/コンポーネントに切り出す。
- 目安: 1ファイル 200行を超えたら分割の候補。ただし無理に分けて読みにくくなるなら据え置きも可。
- 例: モックデータ、カラーマップ（`CATEGORY_COLORS` 等）、フォーマット関数（`formatDeadline` 等）は共通 util に移せる候補。

### 8.4 型とバリデーション
- Todoテキストは空白のみ禁止、最大長（例: 200）などの制約を設ける（実装時に確定）。
- `id` は衝突しない生成（UUID等）。方式が決まるまで `crypto.randomUUID()` を第一候補。

### 8.5 プレースホルダー（後で差し替える前提）
以下には「仮のテキスト」「後でカッコいいUIに差し替え」などのコメントがある。
- `src/app/overdue/page.tsx`
- `src/app/buffs/page.tsx`

注意: `src/app/buffs/page.tsx` は関数名や表示文言が `Overdue` 系になっており、ページの意図（Suggest/Buffs）とズレている。実装を進める前に「表示/命名」を `buffs` に揃える。

## 9. 開発コマンド
- `npm run dev`
- `npm run lint`
- `npm run build`

## 10. ドキュメント運用
| ファイル | 役割 | AI の扱い |
|---|---|---|
| `docs/ai-dev-guide.md`（このファイル） | HOW: 技術・アーキテクチャ・コード仕様 | **全作業で自動読み込み** |
| `docs/ai-product-brief.md` | WHAT: プロダクト仕様・要件・ロードマップ | ユーザー指示時のみ読む/書く |
| `docs/ai-error-log.md` | エラー/事故ログ（再発防止） | 必要時に参照・追記 |
| `docs/explain/` | 特定実装の詳細解説（ユーザーが読む資料） | ユーザー指示時のみ書く |

### 更新ルール
- コード内コメントで「意図/制約/調整ポイント」が増えたら、まずここへ転記して"仕様"に昇格させる
- `docs/ai-product-brief.md`（プロダクト仕様）と矛盾しないよう、差分が出たら両方を更新する

## 11. AI応答の注意事項
- ユーザーは日本人。英語のエラーメッセージのみが入力された場合でも、**必ず日本語で返答する**。
- タスクに取り掛かる前に、**必ず `docs/ai-dev-guide.md`（このファイル）を読んでから**作業を開始する。

## 12. 追加するなら（後で）
- 手動テスト手順の固定化（Happy path / Edge cases）
- データエクスポート（JSON）とインポート
