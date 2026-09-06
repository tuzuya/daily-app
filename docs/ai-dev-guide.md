# 開発ガイド（技術・アーキテクチャ・コード仕様）

このファイルは **「どう作るか」（HOW）** をまとめた開発の前提です。
プロダクト要件・画面定義・ロードマップは `docs/ai-product-brief.md` を参照。

---

## 1. 技術スタック
- **フロントエンド**: Next.js（App Router）+ Vercel
- **Language**: TypeScript
- **UI**: Tailwind CSS v4
- **UI utilities**: shadcn, Radix関連, Headless UI
- **バックエンドAPI**: **Next.js Route Handlers**（`src/app/api/**/route.ts`）
- **DB**: **Neon**（PostgreSQL）★2026-09-06 決定・**移行未実行**
  - `postgres-js` で直接接続する。ORM 以外のベンダー機能は使わない
  - 旧: Supabase。Auth / Storage / Realtime を一つも使っておらず、無料枠の
    1週間休止が痛点だったため乗り換え（`docs/backend-implementation-plan.md` §4）
  - **移行作業は `DATABASE_URL` の差し替えのみ。** コード変更は不要
- **認証**: **未実装かつ方針も未決。** 以前は「Supabase Auth を使う」前提だったが、
  DB 乗り換えの検討でこの前提が崩れた。実装する前に方針を決めること
- **ORM**: Drizzle ORM
- **Lint**: ESLint
- **Runtime**: Node.js（npm / `package-lock.json` あり）
- **デプロイ**: Vercel（フロント・API まとめて）

> **Hono + Cloudflare Workers は「将来やるかもしれない案」であって、現在の構成ではない。**
> Workers から Supabase に繋ぐのに Hyperdrive 等の追加構成が要り環境依存が大きかったため、
> API は Next.js 側に置く判断をした（経緯: `docs/backend-implementation-plan.md`）。

## 2. リポジトリの主要ディレクトリ
- `src/`: フロントエンド（Next.js アプリ本体）
- `src/app/`: App Router 配下（ルーティング/レイアウト/ページ）
- `src/app/global.css`: **デザイントークンの正本** + グローバルスタイル（§7 参照）
- `src/app/components/`: 画面固有コンポーネント
- `src/app/api/`: Route Handlers（DB に触れてよい唯一の層。§3.5 参照）
- `lib/`: 共通ユーティリティ・定数
- `lib/utils.ts`: `cn` ユーティリティ（`clsx` + `tailwind-merge`）
- `lib/task-design.ts`: **カテゴリ色・レベル定義の正本**（§7.5 参照）
- `lib/db/`: Drizzle スキーマ（`schema.ts`）と接続（`index.ts`）
- `types/`: 型定義（`types/task.ts`）
- `docs/`: 仕様・調整ガイド・運用ドキュメント（AI 向け正本は §10）
- `CLAUDE.md`（リポジトリ直下）: Claude Code 用。`@docs/*.md` で §10 の正本をインポート（本文は `docs/` に置かない）
- `docs/explain/`: 特定実装の詳細解説。**旧デザイン時代のものが混ざっている**ので、
  現在の指針として読まない（各ファイル冒頭の注記を見る）

## 3. アーキテクチャ / データモデル

### 3.1 技術選定の経緯

**フロントエンド & ホスティング**
- **技術**: Next.js (App Router) + Vercel
- **選定理由**: React/Next.js のエコシステムを最大限活用するため。Vercelは個人開発のテスト環境から将来のWeb一般公開（本番）までシームレスにスケール可能で、移行の手間がないため。

**バックエンド API**
- **技術**: Next.js Route Handlers（`src/app/api/**/route.ts`）
- **選定理由**: 当初は Hono + Cloudflare Workers への分離を狙ったが、Workers から Supabase(PostgreSQL) に接続するには Hyperdrive 等が必要で環境依存が大きかった。まず Next.js 内に API 層を置いて CRUD を通し、デプロイも Vercel にまとめる形にした。将来 Workers へ切り出す場合は、同じインターフェースを写して fetch 先を変える。

**データベース & 認証 (BaaS)**
- **技術**: Supabase (PostgreSQL)
- **選定理由（当時）**: Todo、ユーザー、タグなどのリレーショナルデータとPostgreSQLの相性が良いため。認証（Supabase Auth）が内包され、友人共有時のセキュアなログインを容易に実装できるため。無料枠が広く、コストを抑えつつスケール可能なため。
- **その後（2026-09-05）**: 実際には **Supabase Auth を使わないまま**、`postgres-js` で
  Postgres に直接繋ぐ形になった。つまり選定理由のうち「認証が内包される」は**効いていない**。
  加えて無料枠は1週間の無操作で休止するため、**Neon への乗り換えを検討中**
  （`docs/backend-implementation-plan.md` §4）。

**ORM**
- **技術**: Drizzle ORM
- **選定理由**: サーバーレス・エッジ環境（Vercel/Cloudflare）において、Prisma等の「重いエンジンによるコールドスタートの遅延」を排除するため。PWAとしてスマホから起動した際の「もっさり感」を無くし、ネイティブアプリのようなサクサク感を実現するため。TypeScriptでSQLに近い構文で記述でき、モダンな開発体験を得られるため。

### 3.2 リクエストフロー
```
ブラウザ (Next.js) → Route Handlers (/api/tasks) → Drizzle ORM → Neon (PostgreSQL)
```

### 3.3 データモデル（Drizzle スキーマ想定）
```
Task
  id:               String (UUID, PK)
  title:            String
  category:         String          // 現在のコード: "routine" | "health" | "physical" | "knowledge" | "activity" | "creative"（旧6種）
                                    // 変更予定: "vitality" | "intelligence" | "creative" | "recovery" | "quest"（新5種）
                                    // 一括変更の影響範囲は docs/pixel-style-guide.md §7
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

**現状は `tasks` テーブル1つだけ**（`lib/db/schema.ts`）。
`userId` カラムは将来の認証用に空けてあるが、`users` テーブルは存在しない。

#### 追加が必要なカラム（未実装 / 2026-09-05 決定）

```
todayDate:   varchar(10)?   // Today に置いた日 YYYY-MM-DD。必ずローカル日付（§8.2）
completedAt: timestamp?     // 達成した瞬間
```

この2つが無いと、**日跨ぎの仕分け（`ai-product-brief.md` §4.6）も
ふりかえり（同 §4.3）も実装できない**。`createdAt` は「作った日」であって
「どの日の Today に置かれたか」ではないため代用できない。

追加後の各画面の条件:

| 画面 | 条件 |
|---|---|
| Today | `todayDate = 今日` かつ `done = false` |
| 日跨ぎの仕分け対象 | `todayDate < 今日` かつ `done = false` |
| 今日の達成 | `done = true` かつ `completedAt` が今日 |

**`GET /api/tasks?screen=today` は `done = false` で絞る必要がある。**
現在は絞っていないため、達成してリロードすると Today に戻ってくる。

- **DayLog**（将来追加予定）
  - date: YYYY-MM-DD
  - note: string（当日の自由メモ）
  - mood?: 1..5 / string（任意）

- **LV / EXP / コイン**: **未決**。Figma は表示しているが供給元が無い。
  集計で出すか `users` テーブルを持つか（`ai-product-brief.md` §7.1 (c)）

### 3.4 構築ステップ（完了済み）
1. Supabase プロジェクト作成 + 接続URL取得（手動）
2. Drizzle 導入 + スキーマ定義（`lib/db/schema.ts`）+ マイグレーション
3. Route Handlers 実装（`GET/POST /api/tasks`、`PATCH/DELETE /api/tasks/[id]`）
4. フロントから `fetch("/api/tasks")` で取得（モックデータは撤去済み）
5. Vercel の環境変数に `DATABASE_URL` を設定

### 3.5 データ永続化ルール
- UI → Route Handlers (`/api/tasks`) → Drizzle → Neon の流れを守る。
- フロントエンドが直接DBを触る実装は避け、必ずバックエンド API 経由にする。
- `.env.local` に `DATABASE_URL`（Neon の **pooled** 接続文字列）を設定する。

## 4. ルーティング（App Router）
ディレクトリ: `src/app/`

- `/today` → `src/app/today/page.tsx` — 当日のタスク（HOME）
- `/next` → `src/app/next/page.tsx` — 今後やるタスクの一覧
- `/overdue` → `src/app/overdue/page.tsx` — 未達成タスクの一覧
- `/buffs` → `src/app/buffs/page.tsx` — AI提案タスクの一覧
- `/profile` → `src/app/profile/page.tsx` — プロフィール/ステータス
- `/login` → `src/app/login/page.tsx` — 未実装（見出しのみ）
- `/` → **存在しない。`src/app/page.tsx` が無いため 404 になる**
  （`/today` へのリダイレクトを置く必要がある）

**各ページファイルが自分の画面を描画する。**
リデザイン前は SpaceNavigator が描画を一元管理し、タブルートのページは
`return null` のスタブだったが、その構成は廃止した（§5.1）。

## 5. 画面レイアウト
ファイル: `src/app/layout.tsx`

- **背景（最背面 z-0）**: ピクセル調の色帯 + ディザリング（`docs/pixel-style-guide.md` §4.2）
  - リデザイン前はオーロラ風の radial-gradient。さらにその前は `blur-[120px]` の
    巨大 blur だったが、モバイル負荷のため段階的に置き換えられた（`docs/ai-error-log.md`）
- **ページ内容（z-10）**: 各ルートの `page.tsx`
- **下部ナビ（z-50）**: 4タブ（Today / Next / Overdue / Buffs）
- **オーバーレイ（z-60）**: 詳細・作成モーダル、達成エフェクト（§5.2）

### 5.1 画面遷移は通常のルーティング ★リデザインで変更

**タブを押したら `router.push()` で普通に画面を切り替える。** それだけ。

リデザイン前は `SpaceNavigator` が4画面を2次元空間に同時配置し、
カメラをパンさせて切り替えていた（`page-space.ts` に座標を定義）。
**この空間モデルは廃止した。**

廃止に伴い、次が不要になる:

| 対象 | 扱い |
|---|---|
| `src/app/components/SpaceNavigator.tsx` | 削除。描画は各 `page.tsx` へ戻す |
| `src/app/components/page-space.ts` | 削除（座標マップ） |
| `src/app/components/FallbackMain.tsx` | 削除（SpaceNavigator 対象外ルートを出すためだけの存在） |
| フリックでの画面切り替え | 廃止。タブのみ |
| `content-visibility` によるオフスクリーン最適化 | 不要（同時描画しなくなるため） |
| `today/page.tsx` 等の `return null` スタブ | 解消。実内容を持たせる |

**副次的な効果**: `docs/ai-error-log.md` に記録された iOS クラッシュの主因は
「ページファイルの重複レンダリング」と「4画面同時描画の負荷」だった。
どちらも構造的に消える。ただし §8.6 の他の制約（`100dvh`、`touch-action`、
blur の常時描画）は引き続き守ること。

`SpaceNavigator` 内にあったデータ取得（`useTasksForScreen`）と
`moveToToday()` は、各ページまたは共通フックへ移す。ロジック自体は流用できる。

### 5.2 オーバーレイ

ルート遷移を伴わず、現在の画面の上に重ねる。

| オーバーレイ | 開く操作 | 閉じる操作 |
|---|---|---|
| タスク詳細 | カード / 行をタップ | ✕ ・ 背景タップ |
| タスク作成 | 「タスクを追加」 | ✕ ・ 背景タップ |
| 達成エフェクト（FX） | カードを下にドラッグ | TAP TO CONTINUE |

**達成エフェクトはルートを持たない。** Today の上に重なる状態であって、
別の画面ではない。ルートにすると戻る操作で再表示できてしまう。

## 6. コンポーネント仕様

### 6.1 下部ナビ ★リデザインで置き換え

**現行**: `src/app/components/GooeyNav.tsx` — SVGフィルタで液体風に融合する
pill と粒子エフェクト。粒子色は `var(--particle-1..4)`。

**リデザイン後**: Figma の `NavItem/Pixel`（State: Active / Inactive）に置き換える。
角丸なしの 87×48、3px 輪郭、アクティブは金地に反転。
ピクセル調では滑らかな融合や粒子は使わないため、**Gooeyフィルタごと不要**になる。
`--particle-1..4` トークンも合わせて削除できる。

置き換え時に引き継ぐ挙動:
- `usePathname()` でアクティブなタブを判定する
- `href` の正規化（`"today"` でも `"/today"` でも `/today` 扱い）
- クリックとキーボード（Enter / Space）の両方で `router.push()`

**既知のlintエラー**: `setActiveIndex` を `useEffect` 内で同期的に呼ぶため
`react-hooks/set-state-in-effect` が出る。置き換えで解消する
（`usePathname()` から導出できるので `useState` 自体が不要）。

### 6.2 TaskCarousel / TaskCard / TaskCardDetail / TaskCardCreate
- `TaskCarousel.tsx`: 3D遠近のカードカルーセル。ドラッグ・慣性スナップを自前実装（調整の詳細は `docs/explain/carousel-3d-depth-tuning.md`）
- `TaskCard.tsx`: カルーセル内の1枚。中央のカードだけタップで詳細が開く
- `TaskCardDetail.tsx`: 詳細モーダル。Level/所要時間の変更を `PATCH /api/tasks/:id` に即時保存
- `TaskCardCreate.tsx`: 作成モーダル。`POST /api/tasks` 後に一覧を再取得

**重複に注意**: `MetaChip` / `SliderRow` / `Starburst` / 時間フォーマット関数が `TaskCardDetail` と `TaskCardCreate` に二重定義されたまま。リデザイン時に共通化する（カテゴリ色と `LEVELS` は §7.5 に一本化済み）。

### 6.3 HexagonStatus
ファイル: `src/app/components/HexagonStatus.tsx`

- 完了タスクのポイントをカテゴリ別に集計し、六角形レーダーチャートで表示
- `/profile` から使用。`GET /api/tasks`（screen 指定なし=全件）を取得して集計
- SVG の `fill` には Tailwind クラスが使えないため `CATEGORY_DESIGNS[].hex` を使う

### 6.4 削除済みコンポーネント（履歴）
以下は「どこからも import されていない死んだコード」だったため削除した。
`git log` から復元できるので、必要になったら履歴を参照する。

- `GlassSurface.jsx` — §6.4 で「重複をどちらに寄せるか決める」としていたが、実際には両方とも未使用だったため削除で解決
- `ScrollingText.tsx` — 連動していた `motivation-*` keyframes も `global.css` から削除。
  解説だった `docs/explain/scrolling-text-tuning.md` も削除済み
- `SpaciousButton.tsx` / `MockTodoCard.tsx` / `PageTransition.tsx`

## 7. デザイントークン（正本: `src/app/global.css`）

> **リデザイン進行中**: ピクセルゲーム調への変更を進めている。
> 1アートピクセル=3px、枠線3px、角丸0、6px刻みの余白、ディザリング、書体の役割分担などの
> **再現可能な規則は `docs/pixel-style-guide.md` が正本**。
> 下記 §7.2〜7.5 は現行（リデザイン前）のトークン層の仕様。

### 7.1 Tailwind/shadcnのベース
- `@import "tailwindcss";`
- `@import "tw-animate-css";`
- `@import "shadcn/tailwind.css";`

### 7.2 このアプリはダーク専用
以前は shadcn のライト値が `:root`、ダーク値が `.dark` に入っていたが、**`.dark` はどこにも付与されておらず実質未使用**だった（見た目は `layout.tsx` の `bg-slate-950` 直書きで作られていた）。

現在は `:root` がダークパレットの単一ソース。shadcn 互換トークン（`--background` 等）もそこへ委譲しているので、shadcn コンポーネントを追加してもダーク前提で正しく描画される。

**ライトモードを追加する場合**は、`:root` の値を差し替えるのではなく、テーマクラス（または `prefers-color-scheme`）で上書きするブロックを足す。

### 7.3 トークン一覧と対応ユーティリティ
`:root` に生の値、`@theme inline` で Tailwind ユーティリティへ写している。

| 役割 | CSS変数 | ユーティリティ例 |
|---|---|---|
| 地色 | `--ground` | `bg-ground` |
| 背景演出 | `--aurora-1` / `--aurora-2` | `var()` で直接参照 |
| ガラス面（4段） | `--surface-1`〜`--surface-4` | `bg-surface-2` |
| モーダル・コントロール | `--veil` / `--veil-bar` / `--veil-panel` / `--control` / `--field` / `--scrim` | `bg-veil` |
| 罫線（3段） | `--line-faint` / `--line` / `--line-strong` | `border-line` |
| 文字（5段） | `--ink` / `--ink-soft` / `--ink-muted` / `--ink-faint` / `--ink-inverse` | `text-ink-muted` |
| 意味を持つ色 | `--success` / `--danger` / `--points` | `text-success` |
| カテゴリ6色 | `--category-{key}` | `bg-category-health` |
| 角丸 | `--r-card` / `--r-chip` / `--r-control` / `--r-sheet` | `rounded-card` |
| 影 | `--e-card` / `--e-card-hover` / `--e-control` / `--e-panel` / `--e-sheet` | `shadow-sheet` |
| GooeyNav粒子 | `--particle-1..4` | JS から `var()` で組み立て |

### 7.4 Figma → コード のトークン対応（リデザイン運用）
Figma の variables 名を下の規約で付けておけば、実装は `global.css` の値差し替えだけで済む。

| Figma variable | CSS変数 |
|---|---|
| `color/ground` | `--ground` |
| `color/surface/1`〜`4` | `--surface-1`〜`--surface-4` |
| `color/veil`, `color/veil/bar`, `color/veil/panel` | `--veil`, `--veil-bar`, `--veil-panel` |
| `color/line/faint`, `color/line`, `color/line/strong` | `--line-faint`, `--line`, `--line-strong` |
| `color/ink`, `color/ink/soft`, `color/ink/muted`, `color/ink/faint`, `color/ink/inverse` | 同名の `--ink*` |
| `color/category/{routine\|health\|physical\|knowledge\|activity\|creative}` | `--category-{key}` |
| `radius/card`, `radius/chip`, `radius/control`, `radius/sheet` | `--r-card`, `--r-chip`, `--r-control`, `--r-sheet` |
| `shadow/card`, `shadow/sheet` … | `--e-card`, `--e-sheet` … |

**運用ルール**:
- 値は Figma からコピーしやすい **hex / rgba** で書く（oklch にしない）
- 半透明はアルファ付き hex か `rgba()`。`--surface-*` は「暗い地色に重ねる白」の前提
- **コンポーネント側に色を直書きしない**。新しい色が必要になったらまずトークンを足す
- カテゴリ色は CSS と `lib/task-design.ts` の両方にあるので、**必ず両方**更新する（§7.5）

### 7.5 カテゴリ色・レベルの正本（`lib/task-design.ts`）
以前はカテゴリ色が `TaskCard` / `TaskCardDetail` / `TaskCardCreate` / `HexagonStatus` の**4ファイル**に、`LEVELS` が2ファイルに重複していた。現在は `lib/task-design.ts` に一本化。

- `CATEGORY_DESIGNS`: `key` / `label` / `hex` / `gradient` / `border` / `modalGradient` / `accent` / `image`
- `categoryDesign(category)`: 大文字小文字を無視して引き、未知の値はフォールバックを返す
  （DB の `category` は `varchar` なので型外の値が入り得る）
- `LEVELS` / `inferLevel(points)`: 難易度とポイントの対応

`hex` は SVG の `fill` など Tailwind クラスが使えない箇所用。`--category-*` と同じ値を保つ。

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
- カラーマップ（旧 `CATEGORY_COLORS` 等）は `lib/task-design.ts` に移設済み（§7.5）。
- **残っている重複**: `MetaChip` / `SliderRow` / `Starburst` / 時間フォーマット関数が `TaskCardDetail` と `TaskCardCreate` に二重定義。リデザインでこれらの見た目が変わるタイミングで共通化する。

### 8.6 モバイル（iOS Safari）で守る制約 ★リデザイン時は必読
`docs/ai-error-log.md` に記録された**実機で起きた事故**の再発防止ルール。
デスクトップでは問題が出ないため、破ると気付かないまま壊れる。

- **`100vh` を使わない** → `100dvh`。`layout.tsx` の `viewportFit: "cover"` と、ボトムバーの `pb-[max(1rem,env(safe-area-inset-bottom))]` も維持する
- **`touch-action: none`（Tailwind `touch-none`）を全画面要素に付けない** → タッチイベント自体が発火しなくなる。`manipulation` を使う。ドラッグハンドル等の小要素に限定するなら可
- **ランタイム blur を常時描画しない** → 巨大な `blur-[120px]` や `backdrop-blur` の常用は避ける。背景は静的グラデーションかピクセルの色帯で代替する
- ~~タブルートの `page.tsx` に UI を置かない~~ → **この制約は SpaceNavigator の廃止で解消**（§5.1）。ページは自分の画面を描画してよい
- **1回のタップ操作のハンドラ内で重い同期処理をしない** → 大量の `createElement`、`getBoundingClientRect`、`offsetWidth` は `requestAnimationFrame` に逃がす
- **3D transform / SVG filter / blur / パーティクルを同時に多用しない** → 同時使用数の上限を決めておく
- **`useEffect` 内で直接 DOM を操作する場合は `try-catch` で保護する**
- タッチ操作やレイアウトに関わる変更をしたら、**必ず iOS 実機（またはデプロイ後のスマホ）で確認**する

**ピクセル調ではこの制約が自動的に満たされる**: `docs/pixel-style-guide.md` §1 が
blur / backdrop-filter / グラデーション / ぼかし影を**すべて禁止**しているため、
規則どおりに作れば上の重い表現は最初から出てこない。
逆に言うと、**ガラス/グラスモーフィズム風の案が出てきたら、それは旧デザインの発想**なので
ピクセルスタイルガイドの表現（ベベル・ディザリング・単色のずらし矩形）に置き換える。

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
- `npm run lint` — **既知のエラー5件あり**（`GooeyNav` / `SpaceNavigator` / `TaskCarousel` の `react-hooks/refs` と `react-hooks/set-state-in-effect`）。新しく増やさないことを基準にする
- `npm run build`
- `npm run db:push` — Drizzle スキーマを Supabase に反映

## 9.5 Figma 連携（design → code）

**Figma ファイル**: `daily-app Redesign`
https://www.figma.com/design/yp8EzSlzOom9KwycPKKSaD

### 手順
1. Figma でデザイン/トークンを作る。variables の命名は §7.4 の規約に合わせる
2. 実装したい画面・コンポーネントの **node を選択した状態の URL**（`?node-id=...` 付き）を渡す
3. Claude 側は `figma-design-to-code` スキルを読んでから `get_design_context` を呼ぶ
   （スキルを飛ばすと、既存のトークンやコンポーネントを無視したコードが出る）
4. トークンだけ先に取り込む場合は `get_variable_defs` → `global.css` の値を差し替える

### 実装時の原則
- Figma が返す生の値（`#ffffff0f` 等）を**そのままコンポーネントに書かない**。§7.4 の対応表に従ってトークンへ落とし、コンポーネントはユーティリティ（`bg-surface-2` 等）を使う
- Figma のオートレイアウトは `flex` + `gap` に写す。要素ごとの margin で間隔を作らない
- **§8.6 のモバイル制約が Figma のデザインより優先**。ただしピクセル調では blur も
  グラデーションも使わない（`docs/pixel-style-guide.md` §1）ので、通常この衝突は起きない
- 画面の描画責務は各 `page.tsx` にある（§5.1）。詳細・作成・達成エフェクトは
  ルートを持たないオーバーレイとして実装する（§5.2）

## 10. ドキュメント運用
| ファイル | 役割 | AI の扱い |
|---|---|---|
| `docs/ai-dev-guide.md`（このファイル） | HOW: 技術・アーキテクチャ・コード仕様 | **コード編集・機能/UIの検討のたびに参照する正本**（下記「エージェント共通」） |
| `docs/ai-product-brief.md` | WHAT: プロダクト仕様・要件・ロードマップ | **WHAT に触れるとき**、または**ユーザーがパス・`@` で明示したとき**に Read。編集は要件変更時のみ |
| `docs/ai-error-log.md` | エラー/事故ログ（再発防止） | 必要時に参照・追記。**中身は旧デザイン時代の事故**なので、有効なのは教訓（§8.6 に抽出済み）だけ |
| `docs/pixel-style-guide.md` | ピクセルスタイルの再現可能な規則（寸法・パレット・書体・パーツの作り方・カテゴリ5種） | **ピクセルUIを足す/直すたびに参照する正本**。Figma と CSS の両方の値を持つ |
| `docs/design-refs/` | デザイン参考画像（ユーザーが置く） | 指示があったときに読む。命名規則は同ディレクトリの README |
| `docs/backend-implementation-plan.md` | バックエンド構成の決定記録 + **DB 選定の検討** | 「なぜ Workers ではなく Route Handlers なのか」（§1）、「DB をどこに置くか」（§4）を判断するときに読む |
| `docs/explain/` | 特定実装の詳細解説（ユーザーが読む資料） | ユーザー指示時のみ読む・書く。自動では追加しない。**旧デザイン時代のものが残っている**ので、冒頭の注記を必ず確認する |

> **⚠️ 旧デザインの情報を新しい実装に持ち込まない**
> このアプリは **ピクセルゲーム調**（`docs/pixel-style-guide.md`）で作る。
> 空間モデル（カメラ移動・フリック遷移）／Gooey・液体風の融合／ガラス・グラスモーフィズム／
> オーロラ背景／巨大 blur は**すべて廃止した方針**。
> 上表以外の場所（`docs/explain/`、`docs/ai-error-log.md`、既存のコンポーネント実装）に
> それらの記述が残っていても、**新しい設計の参考にしない**。

### エージェント共通（Cursor / Claude Code）

- **正本は `docs/` 配下の上表のみ**。リポジトリ直下の `CLAUDE.md` や各エージェントの設定ファイルに仕様本文を重複させない。
- **`docs/ai-dev-guide.md`（必須）**: コードの編集、機能や UI の追加・変更・設計を行う**直前**に、**Read** で読む（[Claude Code の memory](https://code.claude.com/docs/en/memory) の `@` インポートでも可）。**同一セッション内で直前のメッセージまでに全文が既にコンテキストに載っている場合**は読み直し不要。
- **`docs/ai-product-brief.md`（WHAT のとき）**: **常時は読み込まない**。次のいずれかのときに Read する。
  - ユーザーが `docs/ai-product-brief.md` を `@` やパスで**明示したとき**
  - **WHAT に触れる**作業（要件・画面・ロードマップ・プロダクトの約束を変えうる実装や判断）をするとき
- **WHAT に触れない例**: タイポ修正、Lint、既存仕様どおりのバグ修正、内部リファクタ、**既存 brief と矛盾しない**見た目の微調整など。
- **Cursor**: `.cursor/rules/` は削除済み。使う場合は「本文を書かず `docs/ai-dev-guide.md` を Read させるだけ」の薄いルールを置く。
- **Claude Code**: リポジトリ直下の **`CLAUDE.md`** は **`@docs/ai-dev-guide.md` のみ**を起動時に展開する。`ai-product-brief.md` は **`@` による常時展開は行わない**（WHAT 時・ユーザー明示時に Read）。

### 更新ルール
- コード内コメントで「意図/制約/調整ポイント」が増えたら、まずここへ転記して"仕様"に昇格させる
- `docs/ai-product-brief.md`（プロダクト仕様）と矛盾しないよう、差分が出たら両方を更新する

## 11. AI応答の注意事項
- ユーザーは日本人。英語のエラーメッセージのみが入力された場合でも、**必ず日本語で返答する**。
- コード編集・機能/UIの検討に入る前に、**§10「エージェント共通」** に従い **`docs/ai-dev-guide.md` を参照**する。`docs/ai-product-brief.md` は §10 のとおり **WHAT のときまたはユーザー明示のときだけ**参照する。

## 12. 追加するなら（後で）
- 手動テスト手順の固定化（Happy path / Edge cases）
- データエクスポート（JSON）とインポート
