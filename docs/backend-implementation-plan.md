# バックエンド構成の記録（タスク CRUD）

> **状態: Phase 1〜2 は実装済み**（2026-09-05 時点）。
> このファイルは「これから作る手順書」ではなく、**何をどう決めて作ったかの記録**。
> 現在のコード仕様は `docs/ai-dev-guide.md` §3 が正本。

## 1. 決定事項（なぜ今の形になったか）

当初は `api/` に **Hono + Cloudflare Workers** を分離して置く計画だったが、
Workers から Supabase(PostgreSQL) に繋ぐには Hyperdrive などの追加構成が要り、
環境依存が大きかった。そのため次の判断をした。

| 論点 | 決定 |
|---|---|
| API の置き場所 | **Next.js の Route Handlers**（`src/app/api/**/route.ts`）に置く |
| ORM | Drizzle ORM（`lib/db/schema.ts` / `lib/db/index.ts`） |
| DB | Supabase PostgreSQL |
| 認証 | 後回し。`user_id` は nullable で先にスキーマへ入れてある |
| デプロイ | フロントと API をまとめて Vercel |

**Hono + Cloudflare Workers への分離は「将来やるかもしれない案」として残っているだけで、
現時点の構成ではない。** 移行する場合は Route Handlers と同じインターフェースを
`api/` 側に写し、フロントの fetch 先を差し替える。

### 1.1 判断が混ざっていた点（2026-09-05 整理）

当初の計画は、**独立した2つの決定を1つに束ねてしまっていた**。

| 軸 | 選択肢 | 影響するもの |
|---|---|---|
| **① どこで動かすか** | Vercel Functions / Cloudflare Workers | 起動速度・レイテンシ・DB接続・運用コスト |
| **② どう書くか** | Next.js の `route.ts` / Hono | 型安全（RPC）・ミドルウェア・書き味 |

元の選定理由にあった「Hono RPC で End-to-End 型安全を得たい」は **②の理由**なのに、
**①の Workers 移行**とセットで語られていた。**この2つは切り離せる**（§1.3）。

### 1.2 Workers を見送った理由

| 理由 | 内容 |
|---|---|
| **エッジ + 単一リージョン DB は速くならない** | Worker はユーザーの最寄りで動くが、**Supabase は1箇所にしかない**。Worker が近くても DB が遠ければ、毎回そこまで往復する。DB と同居した1リージョンの関数のほうが速いケースが普通にある |
| **DB 接続に構成要素が増える** | Workers は本来 TCP を張れない環境。実務上は Hyperdrive（接続プール + クエリキャッシュ）を挟むのが定石で、構成が1段増える。`postgres-js` の Workers 対応も `nodejs_compat` 前提で詰まりやすい |
| **運用が2倍になる** | リポジトリ / CI / 環境変数 / プレビュー環境がフロントとバックで別々になる。`DATABASE_URL` を2箇所で管理し、CORS を設定し、どのフロントとどの API バージョンが対応するかを自分で揃える必要がある。**個人開発ではここが一番重い** |
| **認証で効いてくる** | Supabase Auth を入れると、フロントで取った JWT を別オリジンの API に渡して検証する手間が増える。同一オリジンならほぼ何もしなくていい部分 |

**規模の話**: 現状の想定は自分 + 友人数人で、1画面あたり1クエリ。
エッジ配信で稼げる数十 ms より、**コールドスタートの数百 ms のほうが支配的**。
Workers の「コールドスタートほぼゼロ」は本物の利点だが、それを取るために
上の4つを払う段階ではない。

### 1.3 型安全が欲しくなったら（Workers に行かずに解決する）

**Hono は Next.js の Route Handler の中にそのまま載る。** インフラを分離せずに
Hono RPC の型安全だけを取れる。

```ts
// src/app/api/[[...route]]/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api");
const routes = app
  .get("/tasks", (c) => c.json(tasks))
  .post("/tasks", (c) => c.json(created));

export type AppType = typeof routes;   // ← フロントが import する
export const GET = handle(app);
export const POST = handle(app);
```

```ts
// フロント側: fetch の戻り値に型が付き、API を変えるとここがコンパイルエラーになる
const client = hc<AppType>("/");
const res = await client.api.tasks.$get();
```

| 欲しいもの | Hono on Vercel | Workers が必要 |
|---|---|---|
| End-to-End 型安全（RPC） | ✅ | — |
| Hono の書き味・ミドルウェア | ✅ | — |
| CORS 不要・デプロイ1回 | ✅（維持） | ❌ 失われる |
| コールドスタートほぼゼロ | ❌ | ✅ |
| エッジ配信 | ❌ | ✅ |

Hono は実行環境をアダプタで差し替える設計なので、**先に Vercel で Hono を書いておくことは
Workers 移行の遠回りではなく下ごしらえになる**（ルート定義はそのまま動く）。

### 1.4 Workers に移行してよい条件

次のどちらかが**実際に**当てはまったときだけ検討する。推測で動かさない。

- **コールドスタートが体感で問題になった**（PWA の初回起動が明確に遅い、と実機で確認できた）
- **フロント/バック分離の実務経験を積むこと自体が目的になった**（これは正当な理由。ただし性能改善とは切り離して考える）

移行するなら **Hyperdrive 前提で設計する**こと。素の TCP 接続のまま移すと、
§1.2 の「エッジ + 遠い DB」で**今より遅くなる**可能性がある。
Hyperdrive の無料枠の条件は変動しているので、着手直前に公式ドキュメントで確認する。

## 2. 実装済みのエンドポイント

- `GET /api/tasks?screen=today` — 一覧取得（`screen` 省略で全件）
- `POST /api/tasks` — 作成
- `PATCH /api/tasks/[id]` — 更新（完了トグル・編集・画面間の移動）
- `DELETE /api/tasks/[id]` — 削除

バリデーション:
- `category` は `CATEGORIES` 配列のいずれか
  （**現在はまだ旧6種**。5種への変更は `docs/pixel-style-guide.md` §7 の影響範囲を参照）
- `screen` は `today` | `next` | `overdue` | `buffs`
- `title` は必須・最大長制限

## 3. 残っている作業

UI 側の話なので、詳細は `docs/ai-product-brief.md` §7 を見る。

- **完了トグルと削除の UI** — API は両方対応済みだが、導線がまだ無い
  （ピクセル版では「カードを下にドラッグして達成」＋ 詳細オーバーレイの削除ボタン）
- **カテゴリ5種化** — DB / API / 型の一括変更（`docs/pixel-style-guide.md` §7）
- **Supabase への接続不良**（`tenant/user ... not found`）の解消
  → **無料プランの休止が原因の可能性が高い**。乗り換えを検討中（§4）
- **認証の実装方針が未決に戻った** — `docs/ai-dev-guide.md` §1 と
  `docs/ai-product-brief.md` §4.5 は「認証は Supabase Auth」を前提に書かれているが、
  §4 の乗り換えを実行すると**この前提が崩れる**。DB を移すより先に、
  ログインをどう実装するか（Neon Auth / Clerk / Auth.js など）を決める必要がある
- **リージョン未指定** — Vercel の関数（`src/app/api/**/route.ts`）は
  既定で `iad1`（米東部ワシントンD.C.）で動く。
  **DB のリージョンと合っていないと、毎回そこまで往復する。**
  1リクエストで複数クエリを投げると、その回数ぶん往復が増える。
  **ユーザー↔関数の距離より、関数↔DB の距離のほうが効く。**

  > **`preferredRegion` は使わない。** Next.js 16 で deprecated。
  > 一時期この文書に書いていたが誤り（2026-09-07 訂正）。

  正しい指定方法は次の3つ。**リポジトリから見える** `vercel.json` を採る。

  ```json
  // vercel.json
  { "regions": ["sin1"] }   // シンガポール。Neon と同じ場所
  ```

  - ダッシュボード: Settings → Functions → Function Regions
  - CLI: `vercel --regions sin1`

  Hobby プランは**1リージョンのみ**。静的ファイル（ビルド出力の `○`）は
  元々CDN配信なので、この設定の影響を受けない。効くのは API（`ƒ`）だけ。

---

## 4. DB は Neon に決定（2026-09-06）★未実行

> **決定**: **Neon を採用**。作業は `DATABASE_URL` の差し替えのみ。
> 認証の宿題は残る（§3）が、Supabase Auth は元々使っていないので
> **今より悪くはならない**。

### 4.0 実行手順

1. [Neon](https://neon.tech) でプロジェクト作成
   - **リージョンは Singapore `ap-southeast-1`**（2026-09-07 時点で東京が無かった）
   - 日本からは東京比で往復が 60〜80ms ほど増える。**ユーザー↔関数**の遅延は
     1往復ぶんだが、**関数↔DB**はクエリ回数ぶん効くので、
     **Vercel の関数も Singapore (`sin1`) に寄せる**（§3 のリージョン指定）
2. **Pooled connection string** を取得（`-pooler` が付いたほう）
3. `.env.local` の `DATABASE_URL` を差し替え
4. `npm run db:push` でスキーマを反映
5. 動作確認（`GET /api/tasks` が 200 を返すか）

**コードの変更は不要。** `lib/db/index.ts` の `postgres(url, { prepare: false })` は
そのまま使える（`prepare: false` は Supavisor 用だが、Neon のプーラーでも必要）。
`schema.ts` / `drizzle.config.ts` も変更なし。

**旧 Supabase のデータは捨てる**（開発用のモックのみで、残す価値のあるデータが無い）。

### 4.1 前提：現状の Supabase は「ただの Postgres」

`package.json` に `@supabase/supabase-js` は無く、`postgres-js` で直接接続しているだけ。
**Auth / Storage / Realtime を一つも使っていない。** テーブルも `tasks` 1枚（13カラム）。

→ **Supabase へのロックインは実質ゼロ**。Postgres 系への移行なら接続文字列の差し替えで済む。

### 4.2 乗り換えたい動機

`tenant or user not found` は Supavisor（Supabase のプーラー）が返すエラーで、
**無料プランのプロジェクトが休止されたとき**の典型的な症状。
無料枠は1週間アクセスが無いと自動停止し、手動で復帰させる必要がある。

個人開発では、この「久しぶりに触ると DB が止まっている」が実質的に一番の痛点。

### 4.3 比較

| | **Supabase**（現状） | **Neon** | **Turso** | **Cloudflare D1** | **Firebase (Firestore)** |
|---|---|---|---|---|---|
| 種類 | PostgreSQL | PostgreSQL | libSQL（SQLite系） | SQLite | **ドキュメント型 NoSQL** |
| 無料枠の目安 | 500MB / 2プロジェクト | 0.5GB + 月190コンピュート時間 | 数GB + 月10億行読み取り級 | 5GB / 日500万行読み取り | 1GB / 日5万読み・2万書き |
| **無操作時** | **1週間で休止**（手動復帰） | 数分でゼロにスケール、**アクセスで即復帰** | 休止なし | 休止なし | 休止なし |
| Drizzle 対応 | ✅ | ✅ | ✅（sqlite-core） | ✅（sqlite-core） | ❌ **非対応** |
| 認証の同梱 | ✅ Supabase Auth | ❌ | ❌ | ❌ | ✅ 強力 |
| オフライン対応 | ❌ | ❌ | ✅ 埋め込みレプリカ | ❌ | ✅ 強力 |
| 有料の入口 | $25/月 | $19/月 | 数ドル〜 | Workers $5/月 | 従量課金 |

**無料枠の数値は頻繁に変わるので、実行する直前に公式で確認する。**
この表で効いているのは**桁と「休止の有無」**であって、細かい数値ではない。

### 4.4 移行コストは3段階

| 段階 | 移行先 | 作業量 |
|---|---|---|
| **①** | Postgres → Postgres（**Neon**） | **ほぼゼロ。** `.env` の `DATABASE_URL` 差し替えだけ。`schema.ts` / `drizzle.config.ts` / `lib/db/index.ts` はそのまま（`prepare: false` は Supabase プーラー用なので外してよいが、残しても動く） |
| **②** | Postgres → SQLite（**Turso / D1**） | **1〜2時間。** SQLite に `uuid` / `boolean` / `timestamp` 型が無いので `schema.ts` を全面書き換え + ドライバ変更 + マイグレーション作り直し |
| **③** | Postgres → **Firestore** | **データ層を捨てる。** Drizzle が使えず、`lib/db/` と `src/app/api/**/route.ts` が丸ごと不要になる。`docs/ai-dev-guide.md` §3.5 の「フロントが直接DBを触らない」ルールも崩れる |

②の具体例:

```ts
// 今                                    → SQLite では
uuid("id").primaryKey().defaultRandom()  → text("id").primaryKey().$defaultFn(() => crypto.randomUUID())
boolean("done")                          → integer("done", { mode: "boolean" })
timestamp("created_at")                  → integer("created_at", { mode: "timestamp" })
```

### 4.5 Firebase を選ぶとしたら、理由は「安さ」ではない

**オフライン対応と認証**。日次タスクの PWA と Firestore のオフライン永続化は相性が良く、
電波が無くてもタスクを完了でき、復帰後に自動同期される。今の構成
（`fetch` → API → DB）では**オフラインだと何もできない**。

代償は、SQL・リレーショナル設計・Drizzle の型安全・実装済みの API 層すべて。
将来 DayLog をタスクに紐づける設計（`docs/ai-product-brief.md` §4.2）も、
NoSQL では非正規化を自分で設計する話になる。

**「今の構成を維持したまま安い DB に移りたい」という動機なら、Firebase は候補から外れる。**
これは DB の乗り換えではなくアーキテクチャの作り直しなので、別の意思決定として扱う。

### 4.6 判断 ★2026-09-06 決定

**Neon を採用。** 動機（休止・無料枠）を移行コストほぼゼロで解消でき、失うものが無い。
Supabase の付加機能を一つも使っていないため、純粋に Postgres ホスティングとして
比較でき、そこでは Neon の「ゼロスケール + 即復帰」が明確に優位。

**Turso は Cloudflare Workers に移るならセットで検討する**のが筋（§1.4 のとおり当面見送り）。
SQLite への書き換えコストを今払う理由がない。

**実行前に決めること**: 認証（§3）。Supabase を離れると `Supabase Auth` 前提が崩れる。
