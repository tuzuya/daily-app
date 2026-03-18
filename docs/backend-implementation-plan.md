# バックエンド実装手順（タスク CRUD）

モノレポ構成で `api/` に Hono + Cloudflare Workers + Drizzle + Supabase を構築する。

## 前提・意思決定済み

- **モノレポ**: `daily-app/` 内に `api/` を配置
- **認証**: 後回し。`user_id` は将来用に nullable でスキーマに含める
- **Task 型**: `types/task.ts` をベースに、`screen` と `updatedAt` を追加して API/DB と整合

---

## Phase 1: 基盤構築

### Step 1.1: Supabase プロジェクト作成（手動）

1. [Supabase](https://supabase.com) でプロジェクト作成
2. Settings → Database から接続情報を取得
   - **Connection string (URI)** または **Connection pooling** の URL をコピー
3. ローカル用 `.env.example` に `DATABASE_URL` のプレースホルダーを記載し、`.env` を gitignore する

### Step 1.2: api/ ディレクトリと初期セットアップ

```
api/
├── src/
│   ├── index.ts        # Hono アプリエントリ
│   ├── routes/
│   │   └── tasks.ts    # タスク CRUD
│   └── db/
│       └── schema.ts   # Drizzle スキーマ
├── drizzle.config.ts
├── wrangler.toml
├── package.json
└── .env               # gitignore（DATABASE_URL）
```

**実施内容:**
- `api/` ディレクトリ作成
- `npm init` 相当で `package.json` を作成
- 依存関係インストール: `hono`, `drizzle-orm`, `@libsql/client`（または `postgres`）、`wrangler`（devDep）
- `wrangler.toml` で Workers 設定（KV / D1 は使わず、Supabase に直接接続する場合は Node 互換が必要 → `pg` または Supabase クライアントを検討）
- Drizzle は `postgres` ドライバで Supabase (Neon 互換の接続) を使用可能

**補足:** Cloudflare Workers は Node.js の `pg` をそのまま使えないため、以下のいずれかを用いる:
- **D1**（Cloudflare の SQLite）で始める（スキーマは D1 用に調整）
- **Hyperdrive** で Supabase に接続（Cloudflare の機能）
- または、**API を Node.js ランタイム**で動かす（Vercel Serverless / Node など）→ 構成が変わる

**推奨:** Cloudflare Workers + Supabase の組み合わせでは、**Hyperdrive** を使うか、一旦 **Next.js API Routes / Server Actions** で Drizzle + Supabase を直接呼ぶ形で先行実装し、後で Workers に移すか、が現実的。  
→ 本手順では **Workers + Hyperdrive 経由で Supabase に接続**する方針とする。Hyperdrive が未利用の場合は、**一時的に Next.js API Routes で Drizzle** を使い、後で Workers へ移行する選択肢もあり。

**簡易案（実装しやすい）:**  
最初から Workers ではなく **Next.js の Server Actions / Route Handlers** で Drizzle + Supabase を実装し、本番デプロイも Vercel にまとめる。将来 Workers へ移行する場合は、API のインターフェースを揃えておく。

**ユーザー確認が必要:** Workers + Supabase の接続方法（Hyperdrive / 一時的に Next.js 内で Drizzle）をどちらで進めるか決める必要あり。

→ 手順は **「Next.js 内に API レイヤー（Route Handlers または Server Actions）を置き、Drizzle + Supabase で DB 接続」** とする。Workers への分離は後フェーズで行う。

---

## Phase 1（改訂）: Next.js 内で Drizzle + Supabase を先行構築

Cloudflare Workers + Supabase の接続が環境依存になるため、**まずは Next.js 内で Drizzle + Supabase** を実装し、タスク CRUD を動かす。

### Step 1.1: Supabase プロジェクト作成（手動）

- 上記と同様

### Step 1.2: Drizzle + Supabase を Next.js プロジェクトに追加

1. ルートで `drizzle-orm`, `drizzle-kit`, `postgres` をインストール
2. `lib/db/` にスキーマ・クライアントを配置
3. `.env` に `DATABASE_URL` を設定（Supabase の connection string）
4. `drizzle.config.ts` を作成し、マイグレーション実行

### Step 1.3: Task スキーマ定義

```ts
// lib/db/schema.ts
// tasks テーブル: id, title, category, points, done, description, deadline, imageUrl, estimatedMinutes, screen, createdAt, updatedAt
// user_id は nullable（認証後対応）
```

### Step 1.4: Task 型の整合（types/task.ts）

- `screen` を追加
- `updatedAt` を追加（任意、API で返す用）
- `createdAt` を `number` (unix ms) のまま DB は `timestamp` → 変換レイヤーで揃える

---

## Phase 2: API 層（Next.js Route Handlers）

### Step 2.1: タスク API エンドポイント

- `GET /api/tasks?screen=today` — 一覧取得
- `POST /api/tasks` — 作成
- `PATCH /api/tasks/[id]` — 更新（完了トグル、編集）
- `DELETE /api/tasks/[id]` — 削除

### Step 2.2: バリデーション

- カテゴリは 6 種類のいずれか
- screen は `today` | `next` | `overdue` | `buffs`
- title は必須・最大長制限

---

## Phase 3: フロントエンド連携

### Step 3.1: モックから API に差し替え

- `SpaceNavigator.tsx` の `MOCK_TODAY` 等を、`fetch('/api/tasks?screen=today')` 等で取得したデータに差し替え
- 状態管理: React state または Context でタスク一覧を保持
- 追加・編集・削除・完了の操作時に API を呼び出し、取得し直す

### Step 3.2: エラーハンドリング・ローディング

- ローディング状態の表示
- エラー時のトーストやリトライ

---

## 実行順序（改訂版）

| # | 内容 |
|---|------|
| 1 | Supabase プロジェクト作成 + DATABASE_URL 取得 |
| 2 | Drizzle + postgres インストール、スキーマ定義 |
| 3 | マイグレーション実行、tasks テーブル作成 |
| 4 | Next.js Route Handlers（/api/tasks）実装 |
| 5 | types/task.ts に screen, updatedAt 追加 |
| 6 | SpaceNavigator を API 呼び出しに差し替え |
| 7 | タスク追加 UI 実装 |
| 8 | タスク編集・削除・完了トグル UI 実装 |

---

## 補足: Workers への移行（将来）

- Hono を `api/` に置き、Wrangler でデプロイ
- Hyperdrive または別の手段で Supabase に接続
- フロントの fetch 先を Vercel の API から Cloudflare の URL に変更
