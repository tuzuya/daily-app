# コード仕様書（ルーティング / コンポーネント / パラメータ）

目的: コード内に散らばったコメント・意図を「AIと人間が読みやすい仕様」として集約する。

## 1. ルーティング（App Router）
ディレクトリ: `src/app/`

- `/today` → `src/app/today/page.tsx`
  - 当日のTodo（現状はプレースホルダー）
- `/buffs` → `src/app/buffs/page.tsx`
  - 「Suggest」タブ相当（現状はプレースホルダー）
- `/overdue` → `src/app/overdue/page.tsx`
  - 未達成タスク（現状はプレースホルダー）
- `/profile` → `src/app/profile/page.tsx`
  - プロフィール/設定（現状はプレースホルダー）
- `/` → `src/app/page.tsx`
  - 現状はサンプル。将来は `/today` へリダイレクト/案内にする想定。

未作成:
- `/login`（将来追加、ログイン→演出→`/today`）

作成済み:
- `/next` → `src/app/next/page.tsx`（現状はプレースホルダー）

## 2. ルートレイアウト（画面のレイヤー構成）
ファイル: `src/app/layout.tsx`

- **背景（最背面 z-0）**: オーロラ風のぼかし要素（紫/青）
- **SpaceNavigator（z-10）**: タブ4画面を宇宙空間に同時配置し、カメラ移動で切り替える（後述）
- **children フォールバック（z-5）**: SpaceNavigator 対象外のルート（`/profile` 等）は従来の `children` で表示
- **フローティングUI（z-50）**:
  - 右上: `TopMenu`（三本線メニュー → Profile等）
  - 下部: `GooeyNav`（タブナビ）

### 2.1 SpaceNavigator（カメラ移動式ナビゲーション）
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

## 3. タブナビ（GooeyNav）
ファイル: `src/app/components/GooeyNav.tsx`

### 3.1 仕様（挙動）
- **ルート同期**: `usePathname()` で現在のパスを監視し、`items[].href` と一致するタブをアクティブ表示
  - `href` は内部で正規化され、`"today"` でも `"/today"` でも最終的に `"/today"` 扱いになる
- **遷移**: クリック/キーボード（Enter/Space）で `router.push()` する
- **アニメーション**:
  - pill（白いカプセル）が移動して、粒子が飛ぶ“グミ/スライム”風エフェクト
  - `ResizeObserver` でリサイズ時にエフェクト位置を再計算

### 3.2 Gooeyフィルタ（液体っぽさ）
`<filter id="gooey">` を定義し、`.effect.filter { filter: url("#gooey"); }` で適用。

### 3.3 粒子カラー（CSS変数依存）
粒子色は `var(--color-1..4)` を参照する。
これらは `src/app/global.css` の `:root` に定義されている。

## 4. 背景演出（ScrollingText）
ファイル: `src/app/components/ScrollingText.tsx`

- 2段の巨大テキストを、左右逆方向に流す
- 文言は `textLine1` / `textLine2` 配列
- 周期: `CYCLE_MS = 3800`

重要:
- CSS側のアニメーション時間と **必ず一致**させる（同期がズレると、切替と移動が噛み合わない）
  - `CYCLE_MS = 3800ms` ↔ `global.css` の `.motivation-forward/.motivation-reverse` の duration `3.8s`
- 調整方法の詳細は `docs/scrolling-text-tuning.md` に集約済み

## 5. グローバルCSS（テーマ / モーション / 色）
ファイル: `src/app/global.css`

### 5.1 Tailwind/shadcnのベース
- `@import "tailwindcss";`
- `@import "tw-animate-css";`
- `@import "shadcn/tailwind.css";`

### 5.2 カラートークン
- `:root` / `.dark` にOKLCHベースのトークンが定義されている

### 5.3 ScrollingText用のkeyframes
- `@keyframes motivation-burst-from-right`
- `@keyframes motivation-burst-from-left`
- `.motivation-forward` / `.motivation-reverse` が `3.8s linear both`

### 5.4 GooeyNav用ネオンパレット
`--color-1..4` が `:root` に定義されており、GooeyNavの粒子色に使われる。

## 6. UIコンポーネント（現状）

### 6.1 `SpaciousButton`
ファイル: `src/app/components/SpaciousButton.tsx`

- グラデーション背景 + hover/active で光る“背面エフェクト”を持つボタン
- コメントとして「背面の光るエフェクト(::before)」とあるが、実装は `div` を使って疑似要素的に表現している

### 6.2 `GlassSurface`（※命名/配置に注意）
同等の実装が複数箇所に存在する:
- `components/GlassSurface.jsx`
- `src/app/components/GrassSurface.jsx`（中身は `GlassSurface`）

現状の読み取り:
- どちらも「ガラス/歪み」のSVGフィルタを生成し、対応ブラウザでは `backdropFilter: url(#filter)` を使う
- Safari/Firefox等でSVGフィルタが不安定な場合にフォールバックを持つ
- `ResizeObserver` が重複して定義されており、将来的な整理対象（挙動確認のうえ片方に統合）

暫定ルール（仕様として）
- 実装を進める前に、**どちらを正とするか**決める（`src/app/components` へ寄せる等）
- 片方を直すだけで満足せず、参照元（import先）も含めて統一する

## 7. `cn` ユーティリティ
ファイル: `lib/utils.ts`

- `clsx` + `tailwind-merge` によるクラス結合ヘルパー
- Tailwindの競合クラスのマージを安全にする目的で使用

## 8. プレースホルダー（後で差し替える前提）
以下には「仮のテキスト」「後でカッコいいUIに差し替え」などのコメントがある。

- `src/app/overdue/page.tsx`
- `src/app/buffs/page.tsx`

現状の注意（事実）:
- `src/app/buffs/page.tsx` は関数名や表示文言が `Overdue` 系になっており、ページの意図（Suggest/Buffs）とズレている。
  - 実装を進める前に「表示/命名」を `buffs` に揃える。

## 9. この仕様書の更新ルール
- コード内コメントで「意図/制約/調整ポイント」が増えたら、まずここへ転記して“仕様”に昇格させる
- `docs/ai-product-brief.md`（プロダクト仕様）と矛盾しないよう、差分が出たら両方を更新する

