# エラー/事故ログ（再発防止メモ）

目的: **同じミスを繰り返さない**。解決したら必ず「原因」「検知方法」「恒久対策」まで残す。

## 書き方テンプレ

### YYYY-MM-DD: タイトル（例: `next build`でCSSが壊れる）
- **症状**:
- **発生条件**:
- **原因**:
- **その場しのぎの対処**（あれば）:
- **恒久対策**:
- **再発防止チェック**（PR/作業前に見る）:
- **関連ファイル/コミット**:
- **参考**:

---

## ログ

### 2026-03-11: iPhone (iOS Safari) でタスクカード遅延表示・入力不能・タブバー見切れ

#### 症状1: タスクカードが遅れて表示される
- **症状**: Today画面で TaskCarousel のカードが一瞬表示されず、遅れてポップインする
- **発生条件**: 初回ロード時（SSR → クライアントハイドレーション）
- **原因**: `SpaceNavigator` の `viewport` state が `null` で初期化されており、`useEffect` で `window.innerWidth/Height` をセットするまで `return null` していたため、クライアントハイドレーション完了まで何もレンダリングされなかった
- **恒久対策**: `viewport` の初期値を `{ w: 0, h: 0 }` にし、`mounted` ref で初期化完了を追跡。`useEffect` が走った直後にレンダリングされるようになり遅延を最小化
- **再発防止チェック**: `useState(null)` + `if (!state) return null` パターンはクライアントでフラッシュを起こすので、可能な限り非null初期値 + mounted フラグで対処する
- **関連ファイル**: `src/app/components/SpaceNavigator.tsx`

#### 症状2: フリック操作・ボタン入力が一切受け付けられない
- **症状**: スマホでタブバー、カード、フリック、すべてのタッチ操作が無反応
- **発生条件**: iPhone (iOS Safari) でのみ再現。Vercel デプロイ環境。デスクトップブラウザ（Chrome/Firefox等）では再現しない
- **実装時の意図（なぜ `touch-none` を付けたか）**:
  - SpaceNavigator にフリック操作（指を動かした方向に画面遷移）を実装した際、`onPointerDown` / `onPointerUp` でカスタムのスワイプ検知を行っていた
  - ブラウザのデフォルトのタッチ挙動（ページスクロール、ピンチズーム、プルトゥリフレッシュ等）がカスタムのスワイプ検知と**競合することを防ぐ**目的で、SpaceNavigator のルート要素（`fixed inset-0` の全画面 div）に Tailwind の `touch-none` クラス（= CSS `touch-action: none`）を適用した
  - デスクトップブラウザではマウスイベントがタッチイベントとは独立して処理されるため、開発環境では問題が顕在化しなかった
- **原因**: `touch-action: none` は「この要素上でブラウザのデフォルトのタッチ操作を一切行わない」という指示だが、iOS Safari ではこれが**タッチイベント自体の発火にも影響**する。結果として:
  1. SpaceNavigator の `onPointerDown` / `onPointerUp` が発火しない → フリック遷移が動かない
  2. SpaceNavigator は `fixed inset-0`（画面全体を覆う）ため、その上にある z-50 のフローティング UI（GooeyNav タブバー、TopMenu）へのタッチも間接的にブロックされた
  3. TaskCarousel 内の framer-motion の `drag` もタッチイベントに依存しているため動作しなかった
  - デスクトップではマウスの `click` / `mousedown` / `mouseup` は `touch-action` に影響されないため、ローカル開発で問題に気づけなかった
- **そもそもの設計ミス**: `touch-action: none` は「ドラッグ可能なスライダー」「キャンバスお絵描き」など**その要素自体が独自のジェスチャー処理を完全に担当する場合**に使うもの。今回は画面遷移のスワイプ検知（閾値 40px 以上の大きなジェスチャー）だけが目的だったので、ブラウザデフォルトの挙動を完全にブロックする必要はなかった
- **恒久対策**: `touch-none` を削除し、代わりに `touch-action: manipulation` を適用。`manipulation` はダブルタップズームだけを無効化し、通常のタップ・スワイプ・スクロールは許可する。カスタムの `onPointerDown` / `onPointerUp` はそのまま動作する
- **再発防止チェック**:
  - `touch-action: none`（Tailwind `touch-none`）は原則使わない
  - 使う場合は `fixed inset-0` のような全画面要素には絶対に付けず、ドラッグハンドル等の小さな要素に限定する
  - タッチ操作に関わる変更をした場合は、デスクトップだけでなく**必ず iOS 実機（または Vercel デプロイ後のスマホ）で動作確認**する
  - デスクトップのマウス操作で問題なくても、iOS Safari のタッチは別の挙動をすることを常に意識する
- **関連ファイル**: `src/app/components/SpaceNavigator.tsx`

#### 症状3: 下のタブバーが画面の下に見切れている
- **症状**: GooeyNav タブバーの下部が画面外に隠れて操作できない
- **発生条件**: iPhone (iOS Safari) — アドレスバー/ホームインジケーターがある端末
- **原因**: 3つの問題が重なっていた
  1. `100vh` が iOS Safari では**アドレスバーを含む**高さを返すため、実際の表示領域より大きい値になる
  2. `viewport` meta に `viewport-fit=cover` が無く、safe area inset が使えなかった
  3. nav 要素の bottom padding がホームインジケーター（safe area）を考慮していなかった
- **恒久対策**:
  1. `h-screen` / `min-h-screen` / `100vh` を全て `h-[100dvh]` / `min-h-[100dvh]` に置換（`dvh` = Dynamic Viewport Height: アドレスバーの表示/非表示に追従する）
  2. `layout.tsx` に `export const viewport: Viewport = { viewportFit: "cover" }` を追加
  3. nav の padding-bottom を `pb-[max(1rem,env(safe-area-inset-bottom))]` に変更
- **再発防止チェック**:
  - 新しいコンポーネントで `h-screen` / `100vh` を使わない → `100dvh` を使う
  - iOS 実機（またはデプロイ後のスマホ確認）でボトムバー付近の UI は必ず safe-area を確認
  - `viewport-fit=cover` が layout.tsx にあることを確認
- **関連ファイル**: `src/app/layout.tsx`, `src/app/components/SpaceNavigator.tsx`, `src/app/components/FallbackMain.tsx`, `src/app/login/page.tsx`
- **参考**: [webkit.org - Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

### 2026-03-11: iPhone でタブ押下時に「問題が繰り返し起きました」クラッシュ
- **症状**: タブボタンを押すと iOS Safari が「問題が繰り返し起きました」と表示してページがクラッシュし、リロードループに陥る
- **発生条件**: iPhone (iOS Safari) でタブボタン（GooeyNav）を押して画面遷移しようとした時
- **原因（複合的）**:
  1. **ページファイルの重複レンダリング**: `today/page.tsx`, `next/page.tsx` 等のページファイルが `ScrollingText` + `MockTodoCard` をフル描画する内容のまま残っていた。SpaceNavigator が表示を担当し、`FallbackMain` がタブルートでは `null` を返すため**画面上は見えない**が、Next.js App Router はナビゲーション時にページコンポーネントの RSC ペイロードを処理する。この無駄な処理がメモリ負荷を増大させていた
  2. **iOS での同時レンダリング負荷**: SpaceNavigator（4画面同時描画 + 3Dカルーセル + spring アニメーション）+ GooeyNav（SVG filter + パーティクル DOM 操作）+ 背景 blur（120px/150px）が同時に動作し、iPhone の WebKit レンダラーを圧迫
  3. **DOM 操作のエラー伝播**: GooeyNav の routeIndex 変化時エフェクト（`useEffect` 内の DOM 操作）でエラーが発生した場合、catch されずに React のレンダリングサイクルに影響し、クラッシュ → リロード → 同じ URL で同じエラー → クラッシュのループに陥った可能性
- **恒久対策**:
  1. タブルートのページファイル（`today/page.tsx` 等）を `return null` の最小シェルに変更。表示は SpaceNavigator が一元管理し、ページファイルは Next.js のルーティング用のスタブとしてのみ存在
  2. GooeyNav の routeIndex 監視 `useEffect` 内の DOM 操作を `try-catch` で保護し、エラーがレンダリングサイクルに波及しないようにした
- **再発防止チェック**:
  - SpaceNavigator で描画を担当するルートのページファイルには、UI コンポーネントを置かない（`return null` にする）
  - `useEffect` 内で直接 DOM を操作する場合（`document.createElement` 等）は必ず `try-catch` で保護する
  - iOS Safari はデスクトップより大幅にメモリ/GPU リソースが限られることを常に意識し、blur, 3D transform, SVG filter, パーティクルの同時使用量に注意する
  - デプロイ後は必ず iOS 実機でタブ遷移を含む基本操作を確認する
- **関連ファイル**: `src/app/today/page.tsx`, `src/app/next/page.tsx`, `src/app/overdue/page.tsx`, `src/app/buffs/page.tsx`, `src/app/components/GooeyNav.tsx`

