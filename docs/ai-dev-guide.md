# 開発ガイド（技術スタック / 注意点 / 作法）

このファイルは、AIが実装・修正を始める前に参照する「開発の前提」をまとめます。

## 1. 技術スタック
- **Framework**: Next.js（App Router）
- **Language**: TypeScript
- **UI**: Tailwind CSS v4
- **UI utilities**: shadcn, Radix関連, Headless UI
- **Lint**: ESLint
- **Runtime**: Node.js（npm / `package-lock.json` あり）

## 2. リポジトリの主要ディレクトリ（把握してから触る）
- `src/`: アプリ本体
- `src/app/`: App Router 配下（ルーティング/レイアウト/ページ）
- `src/app/global.css`: グローバルスタイル（アニメーション含む）
- `components/` / `lib/`: 共通コンポーネントやユーティリティ（実態に合わせて更新）
- `docs/`: 仕様・調整ガイド・運用ドキュメント

## 3. コーディング時の注意点（このプロジェクトの作法）
### 3.1 変更は「最小で筋の良い差分」
- 既存UI/モーション（特に `global.css` のアニメーション）に影響が出やすいので、変更範囲は狭く保つ。
- クラス名の衝突や副作用を避ける（グローバルCSSは影響範囲が広い）。

### 3.2 日付の扱い（必ずローカル日付を基準に）
- 1日の単位はユーザーのローカル日付（YYYY-MM-DD）で扱う。
- `Date` のUTC混入で日付がズレる事故を避ける（例: `toISOString()` の安易な利用をしない）。

### 3.3 データ永続化（決まるまでの暫定ルール）
- 永続化方式が未決の場合でも、**保存I/F（Repository層）だけ先に固定**し、UI/ドメインから切り離す。
- UIが直接 `localStorage` を触る実装は避け、差し替え可能にする。

### 3.4 型とバリデーション
- Todoテキストは空白のみ禁止、最大長（例: 200）などの制約を設ける（実装時に確定）。
- `id` は衝突しない生成（UUID等）。方式が決まるまで `crypto.randomUUID()` を第一候補。

## 4. 実装方針（Todo核の設計指針）
- **ドメイン**: `Todo`, `DayLog` を中心に、日付で束ねる
- **状態**: 1画面だけで完結しないので、状態の置き場（Context/Store等）は早めに整理
- **UI**: 入力の軽さ最優先（追加・完了・メモが最短操作で済む）

## 5. 開発コマンド
- `npm run dev`
- `npm run lint`
- `npm run build`

## 6. ドキュメント運用
- 仕様/進捗: `docs/ai-product-brief.md`
- 開発前提: `docs/ai-dev-guide.md`（このファイル）
- エラー/事故ログ: `docs/ai-error-log.md`

## 7. 追加するなら（後で）
- 手動テスト手順の固定化（Happy path / Edge cases）
- データエクスポート（JSON）とインポート

