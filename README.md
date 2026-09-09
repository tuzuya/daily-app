# daily-app

Todo を核にした日常記録アプリ。スマホ（PWA）での利用がメイン。
日々のタスクを **RPG のクエスト**として扱い、達成を演出で報いる **ピクセルゲーム調 UI** で作っている。

## 開発

```bash
npm run dev      # http://localhost:3000
npm run lint
npm run build
npm run db:push  # Drizzle スキーマを Supabase に反映
```

## ドキュメント（AI エージェントもここを正本にする）

| ファイル | 役割 |
|---|---|
| [`docs/ai-dev-guide.md`](docs/ai-dev-guide.md) | **HOW**: 技術スタック・アーキテクチャ・コード仕様 |
| [`docs/ai-product-brief.md`](docs/ai-product-brief.md) | **WHAT**: プロダクト仕様・要件・ロードマップ |
| [`docs/pixel-style-guide.md`](docs/pixel-style-guide.md) | **デザインの正本**: ピクセルスタイルの寸法・色・書体・モーション |
| [`docs/ai-error-log.md`](docs/ai-error-log.md) | エラー/事故ログ（主に iOS Safari の再発防止） |

構成: Next.js (App Router) + Tailwind v4 / Next.js Route Handlers + Drizzle ORM + Supabase PostgreSQL / Vercel

> **リデザイン進行中**: 旧デザイン（空間モデルのカメラ遷移・Gooey ナビ・オーロラ背景）は
> **廃止済み**。`docs/explain/` 配下にはその時代の解説が残っているので、
> 現在の指針として読まないこと。
