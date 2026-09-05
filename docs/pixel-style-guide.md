# ピクセルスタイル仕様（daily-app Redesign）

参考画像の暖色トンマナを、ピクセルゲーム調に落とし込むための**再現可能な規則**。
新しい画面やコンポーネントを足すときは必ずこの規則に従う。

- Figma ファイル: [daily-app Redesign](https://www.figma.com/design/yp8EzSlzOom9KwycPKKSaD)
- Figma 変数コレクション: `daily-app / pixel`（モード名 `Pixel`）
- 参考画像: `docs/design-refs/tone-manner-design.png`
- コード側トークンの正本: `src/app/global.css`（§7 を参照）

---

## 1. 基準（これを外すとピクセル感が崩れる）

| 項目 | 値 | 理由 |
|---|---|---|
| **1アートピクセル** | **3px** | 画面上で1ドットに見える最小単位。全ての寸法はこの倍数 |
| **枠線** | **3px**（= 1アートピクセル） | 太さを混ぜない。2pxや1pxは使わない |
| **角丸** | **0**（例外なし） | ピクセルUIに丸みはない。丸くしたいときは階段状に切る |
| **余白の刻み** | **6px**（= 2アートピクセル） | 6/12/18/24/36/48。中間値を使わない |
| **画面サイズ** | 390 × 844 | iPhone 論理サイズ。390 = 130アートピクセル |
| **影** | 使わない | ぼかし影の代わりに「3pxずらした単色の矩形」 |
| **グラデーション** | 使わない | 色帯 + ディザリング（§4.2）で代替 |
| **blur / backdrop-filter** | 使わない | `docs/ai-dev-guide.md` §8.6 の iOS 制約とも一致 |

**この規則の副作用として、旧デザインのモバイル性能問題は構造的に消える。**
ピクセルアートは blur も滑らかなグラデーションも使わないため。

---

## 2. カラーパレット

限定パレット。**ここに無い色を新しく使わない**（必要ならまずトークンを足す）。

### 2.1 地色・面

| Figma variable | hex | 用途 |
|---|---|---|
| `color/ground/deep` | `#221c12` | 画面の上下端の暗い帯 |
| `color/ground` | `#3b3122` | 基本の地色 |
| `color/ground/warm` | `#5c4d33` | カードが乗る明るい暖色帯（参考画像の中央部） |
| `color/ground/lift` | `#7a6743` | 棚の上端のハイライト |
| `color/panel` | `#2b2419` | 暗いパネル内側（スプライト枠など） |
| `color/panel/raised` | `#4a3d28` | 一段持ち上がったパネル |

### 2.2 輪郭・文字

| Figma variable | hex | 用途 |
|---|---|---|
| `color/ink/outline` | `#14100a` | **全ての3px枠線**。ほぼ黒の茶 |
| `color/ink` | `#f4ecd8` | 主要文字（羊皮紙色） |
| `color/ink/soft` | `#d8c9a8` | 副次的な文字 |
| `color/ink/muted` | `#a2906d` | 補助情報 |
| `color/ink/faint` | `#6f6047` | 非活性 |
| `color/ink/inverse` | `#14100a` | 明るい面の上の文字 |

### 2.3 ゴールド = 操作の合図

参考画像でトレイと指示テキストに使われている色。**「ここを操作せよ」以外に使わない。**

| Figma variable | hex |
|---|---|
| `color/gold/light` | `#ffd966` |
| `color/gold` | `#e8a52c` |
| `color/gold/dark` | `#a06a14` |

### 2.4 カード面のアクセント（明色 / ベベル暗色のペア）

| Figma variable | hex | ペアの暗色 | hex |
|---|---|---|---|
| `color/accent/mint` | `#9ad6cf` | `color/accent/mint-dark` | `#4f8c86` |
| `color/accent/olive` | `#97a855` | `color/accent/olive-dark` | `#5c6b33` |
| `color/accent/rust` | `#c4663a` | `color/accent/rust-dark` | `#7d3a1c` |
| `color/accent/sand` | `#d9b382` | `color/accent/sand-dark` | `#8f6b3d` |
| `color/accent/lilac` | `#b3a3d9` | `color/accent/lilac-dark` | `#6b5c96` |

明色 = カード面、暗色 = 下辺ベベル・区切り線・カード上の副次文字。

### 2.5 意味を持つ色

| Figma variable | hex | 用途 |
|---|---|---|
| `color/success` | `#7fc36a` | 達成 |
| `color/danger` | `#d1564b` | エラー・期限超過 |
| `color/points` | `#ffd966` | XP・コイン |

---

## 3. タイポグラフィ

3書体を役割で固定する。**混ぜて使わない。**

| 書体 | 役割 | 日本語 | 備考 |
|---|---|---|---|
| **Press Start 2P** | 数値・英字の見出し | ✗ | 字幅が非常に広い。長い文には使えない |
| **DotGothic16** | **日本語すべて** + 本文 | ✓ | 日本語グリフを持つ唯一のピクセルフォント |
| **Silkscreen** | 小さい英字ラベル | ✗ | Press Start 2P が入らない狭い場所用 |

### Figma テキストスタイル

| スタイル名 | 書体 | サイズ / 行送り |
|---|---|---|
| `pixel/display` | Press Start 2P | 20 / 30 |
| `pixel/display-sm` | Press Start 2P | 14 / 22 |
| `pixel/num-lg` | Press Start 2P | 16 / 24 |
| `pixel/num` | Press Start 2P | 10 / 16 |
| `pixel/title-jp` | DotGothic16 | 24 / 34 |
| `pixel/heading-jp` | DotGothic16 | 17 / 26 |
| `pixel/body-jp` | DotGothic16 | 14 / 22 |
| `pixel/caption-jp` | DotGothic16 | 11 / 16 |
| `pixel/label` | Silkscreen Bold | 10 / 14（字間 8%） |
| `pixel/label-sm` | Silkscreen Regular | 8 / 12（字間 6%） |

### コード実装時の必須設定

ピクセルフォントはアンチエイリアスが掛かるとぼやける。**必ず切る。**

```css
/* ピクセルフォントを使う要素に適用 */
-webkit-font-smoothing: none;
-moz-osx-font-smoothing: grayscale;
text-rendering: geometricPrecision;
```

ドット絵画像を使う場合:

```css
image-rendering: pixelated;
```

---

## 4. パーツの作り方

### 4.1 立体パネル（ベベル）

ピクセルUIの基本。光源は常に**左上**。

```
┌──────────────┐  ← 3px 輪郭 (ink/outline)
│▔▔▔▔▔▔▔▔▔▔▔▔│  ← 3px ハイライト (白 45% or 明色)
│              │  ← 面
│▁▁▁▁▁▁▁▁▁▁▁▁│  ← 3px シャドウ (accent-dark)
└──────────────┘
```

押下状態はハイライトとシャドウを**入れ替える**（へこんで見える）。

### 4.2 ディザリング（グラデーションの代替）

色帯の境界を6px市松模様でつなぐ。**上側の色**を下の帯に散らす。

- セルサイズ: 6px（= 2アートピクセル）
- 帯の高さ: 12px（2行）
- 実装: `(row + col) % 2 === 0` のセルを塗る

Figma では市松を65個の矩形にせず、**SVGとして1ノードでインポート**する
（`figma.createNodeFromSvg`）。コードでは `repeating-conic-gradient` または
インラインSVGの背景で再現できる（ランタイム blur なしを維持）。

### 4.3 スプライト

セル文字列から生成する。`x` が塗り、`.` が透明。

```js
const heart = [
  "..xx....xx..",
  ".xxxx..xxxx.",
  "xxxxxxxxxxxx",
  // ...
];
```

- セル 3px、12×10セル = 36×30px が標準サイズ
- 枠（`sprite/slot`）は 48×48px、`color/panel` 塗り + 3px 輪郭
- スプライトは枠の中央に配置（枠の左上 +6px）

### 4.4 セグメントバー（EXP / HP）

RPG のゲージは連続バーではなく**分割ブロック**で表現する。
ブロック 9px 幅 + 3px 間隔、枠は 3px 輪郭。

---

## 5. タスクカテゴリ（5種）

RPG のステータス名に統一。**カード面の色は「カテゴリ色を彩度を落としたもの」**という対応。

| カテゴリ | 意味 | カテゴリ色 | カード面 |
|---|---|---|---|
| **Vitality** | 体を動かす・活力 | `#d1564b`（HP赤） | `accent/rust` |
| **Intelligence** | 学び・知性 | `#5b8fd4`（MP青） | `accent/mint` |
| **Creative** | 創作 | `#d4638f`（マゼンタ） | `accent/lilac` |
| **Recovery** | 休息・回復 | `#7fc36a`（回復緑） | `accent/olive` |
| **Quest** | やるべきこと | `#e8a52c`（クエスト金） | `accent/sand` |

赤=HP / 青=MP / 緑=回復 / 金=クエスト は RPG の共通言語なので、
説明なしで意味が伝わる。カード上のラベルは英字のまま（`pixel/label`）。

> **注意**: 旧6種（routine / health / physical / knowledge / activity / creative）
> からの変更。ステータスチャートは6角形 → **5角形**になる
> （`HexagonStatus.tsx` は名称ごと要変更）。コード側の影響範囲は §7 を参照。

---

## 6. Figma ↔ CSS 対応

`docs/ai-dev-guide.md` §7.4 の命名規約に従う。

| Figma variable | CSS変数 | Tailwind |
|---|---|---|
| `color/ground` | `--ground` | `bg-ground` |
| `color/ground/warm` | `--ground-warm` | `bg-ground-warm` |
| `color/panel` | `--panel` | `bg-panel` |
| `color/ink/outline` | `--ink-outline` | `border-ink-outline` |
| `color/ink` | `--ink` | `text-ink` |
| `color/gold` | `--gold` | `bg-gold` |
| `color/accent/mint` | `--accent-mint` | `bg-accent-mint` |
| `color/category/vitality` | `--category-vitality` | `bg-category-vitality` |
| `size/px` = 3 | `--px-unit` | — |
| `size/border` = 3 | `--border-w` | `border-[length:var(--border-w)]` |
| `space/2` = 12 | `--space-2` | `gap-[var(--space-2)]` |

---

## 7. コード実装時の影響範囲（カテゴリ5種化）

Figma 側の確認が済んだあと、コードでは以下を**まとめて**変更する必要がある。

- `types/task.ts` — `TaskCategory` の union（6→5）
- `lib/task-design.ts` — `CATEGORY_DESIGNS`（色・面・スプライト）
- `src/app/global.css` — `--category-*` トークン
- `src/app/api/tasks/route.ts` と `[id]/route.ts` — `CATEGORIES` バリデーション配列
- `src/app/components/HexagonStatus.tsx` — `VERTEX_COUNT` 6→5、**ファイル名も要変更**
- `docs/ai-product-brief.md` §4.1 — カテゴリ定義（WHAT の変更）
- `docs/ai-dev-guide.md` §3.3 — データモデルのコメント
- **DB**: `tasks.category` は `varchar` なので制約はないが、既存行は旧カテゴリ名のまま残る

---

## 8. モーション

Figma の Motion（キーフレーム）で実装済み。**下の数値がそのまま実装の指定値**。

### 8.1 原則

| ルール | 理由 |
|---|---|
| **色の変化・出現・消失は必ず `HOLD`（補間しない）** | ピクセルアートに中間色は存在しない。フェードすると一気に安っぽくなる |
| 移動と拡縮は spring（`BOUNCY` / `EASE_OUT_BACK`） | 重さと弾みを出す。ピクセルゲームの手触りはここで決まる |
| 落下は `EASE_IN` で加速、着地は `EASE_OUT_BACK` | 引っ張られて落ち、枠にハマる感じを出す |
| 関連要素は時間差（stagger）で出す | 一斉に出すと情報の優先順位が消える |

### 8.2 ドラッグして達成（HOME画面 / 全体 1.5s）

| 対象 | プロパティ | キーフレーム（秒: 値, easing） |
|---|---|---|
| カード | `TRANSLATION_Y` | 0: 0 → 0.1: -12 `EASE_OUT` → 0.45: 220 `EASE_IN` → 0.58: **234** `EASE_OUT_BACK` |
| カード | `SCALE_XY` | 0: 1 → 0.1: 1.04 → 0.45: 0.46 `EASE_IN` → 0.58: 0.40 → 0.64: 0.34 `EASE_IN` |
| カード | `ROTATION` | 0: 0 → 0.1: 2 → 0.45: -5 `EASE_IN` → 0.58: 0 `EASE_OUT_BACK` |
| カード | `OPACITY` | 0.62: 1 → 0.66: 0 **`HOLD`** |
| 矢印 | `OPACITY` | 0: 1 → 0.28: 0 `EASE_IN` |
| 発光帯 ×2 | `SCALE_XY` | 0.56: 1 → 0.6: 1.06 → 0.84: 1.34 / 1.22 `EASE_OUT` → 1.0: 1 |
| 発光帯 ×2 | `OPACITY` | 0.56: 1 → 0.6: 1 `HOLD` → 0.84: 0 → 1.0: 1 |
| 枠の床 | `fills[0]` | 0.56: `#a06a14` → 0.6: `#ffd966` **`HOLD`** → 0.68: `#e8a52c` **`HOLD`** → 0.78: `#a06a14` **`HOLD`** |
| CLEAR! | `SCALE_XY` | 0.58: 1 → 0.68: 1.35 `EASE_OUT_BACK` → 0.9: 1 `BOUNCY` |
| EXP 10個目 | `fills[0]` | 0.82: `#14100a` → 0.88: `#e8a52c` **`HOLD`** |
| +10 XP | `OPACITY` | 0.6: 0 → 0.66: 1 **`HOLD`** → 1.1: 1 → 1.45: 0 `EASE_OUT` |
| +10 XP | `TRANSLATION_Y` | 0.66: 0 → 1.45: -72 `EASE_OUT` |

**移動距離 234px の根拠**: カード中心 (195, 362) → ドロップ枠中心 (195, 596)。
枠の高さ 88px に収めるため 0.4 倍（200 × 0.4 = 80px）まで縮小する。

### 8.3 達成エフェクト（FX画面 / 全体 2.4s）

| 対象 | プロパティ | キーフレーム |
|---|---|---|
| 集中線 | `SCALE_XY` | 0: 0.25 → 0.32: 1.12 `EASE_OUT` → 0.5: 1 |
| 集中線 | `ROTATION` | 0: 0 → 2.4: -9 `LINEAR`（ゆっくり回り続ける） |
| ラベル | `OPACITY` / `TRANSLATION_Y` | 0.06: 0 / -14 → 0.3: 1 / 0 `EASE_OUT` |
| CLEAR! | `SCALE_XY` | 0.1: 0.2 → 0.3: 1.3 `EASE_OUT` → 0.52: 1 `BOUNCY` |
| CLEAR! | `OPACITY` | 0.1: 0 → 0.14: 1 **`HOLD`** |
| カード | `SCALE_XY` | 0.24: 0.55 → 0.54: 1 `EASE_OUT_BACK` |
| スタンプ | `SCALE_XY` | 0.58: **2.4** → 0.7: 1 `EASE_IN` → 0.8: 1 `BOUNCY`（叩きつける） |
| ステータス行 ×4 | `OPACITY` / `TRANSLATION_X` | 0.86 / 0.90 / 0.98 / 1.02 から各 +0.2s で 0→1 / -18→0 |
| EXP 10個目 | `fills[0]` | 1.2 → 1.28: `#e8a52c` **`HOLD`** |
| 続行プロンプト | `OPACITY` | 1.78: 0 → 2.02: 1 → 2.26: 0（すべて **`HOLD`** で点滅） |

### 8.4 コード実装時の対応（framer-motion）

| Figma easing | framer-motion |
|---|---|
| `EASE_OUT_BACK` | `ease: [0.34, 1.56, 0.64, 1]` |
| `BOUNCY` | `type: "spring", stiffness: 300, damping: 12` |
| `EASE_IN` | `ease: [0.42, 0, 1, 1]` |
| `HOLD` | `ease: "steps(1, end)"` または該当時刻で値を直接切り替える |

**`HOLD` を安易に補間へ置き換えないこと。** ここがピクセル感の分かれ目になる。

---

## 9. 画面レイアウト

### 9.1 HOME（Today）— 扇状カルーセル

参考画像の構図。中央のカードを下のドロップ枠に引っ張って達成する。

| 領域 | y |
|---|---|
| ステータスバー | 0–44 |
| 上部バー（LV / コイン / ☰） | 52–88 |
| EXP ゲージ | 118–142 |
| 見出し（中央寄せ） | 172–252 |
| カルーセル（中央 150×200、左右は傾けて画面外へ） | 262–480 |
| ページ表示 | 482–491 |
| ドロップ枠（`CLEAR!`） | 552–640 |
| 下部ナビ | 744–844 |

### 9.2 Next / Overdue / Buffs — 一覧（3画面で共通）

**カテゴリタブで種類を切り替え、その種類のカードを並べ、選んで Today に持ってくる。**
一覧性を優先するため、HOME の 150×200 カードではなく横長の行を使う。

| 領域 | y | 備考 |
|---|---|---|
| ステータスバー | 0–44 | |
| 見出し（eyebrow / タイトル / 補足） | 56–126 | 左寄せ |
| 帯の境界（ディザ） | 148–160 | |
| **カテゴリタブ** | 168–222 | 66×54 を pitch 72 で5つ |
| **一覧** | 234 から pitch 84 | 行は 354×72、6行入る |
| 下部ナビ | 744–844 | |

**カテゴリタブはアイコンのみ。** 390px を5等分すると1枠78pxだが、
Silkscreen で `INTELLIGENCE` は約84px あり**文字が入らない**。
§2.4 のカテゴリスプライト（ハート / 本 / きらめき / ポーション / ! ）を使う。
選択中のタブは金地 + 暗いスプライトに反転する。

**行にカテゴリ帯は持たない。** カテゴリはタブ側が示しているため冗長で、
省いたぶんを一覧性に回せる。

### 9.3 行コンポーネント `CardRow/Pixel`（354×72）

| 要素 | 位置 |
|---|---|
| スプライト枠 48×48 | (12, 12) |
| スプライト 36×30 | (18, 21) |
| タイトル（DotGothic16 14、幅162） | (72, 14) |
| 所要時間 / 期限（caption 11、`ink/inverse` 60%） | (72, 42) |
| 難易度のひし形 | (255, 16) |
| XP（Press Start 2P 10、右寄せ） | (246, 40) |

タイトルは幅162pxで**日本語11文字が上限**。超えると折り返して所要時間と重なるので、
実装では省略表示（`text-overflow: ellipsis`）にする。

### 9.4 3画面の差分

レイアウトは同一で、変えるのは次の3点だけ。

| 画面 | eyebrow の色 | 見出し | 操作の文言 |
|---|---|---|---|
| Next | `gold` | これからやること | えらんで Today に送る |
| Overdue | `danger` | まだ終わっていないこと | えらんで Today に戻す |
| Buffs | `gold` | 今日をちょっと良くする | えらんで Today に追加する |

「Today に持ってくる」処理はコード側に既にある。現状は
`src/app/components/SpaceNavigator.tsx` の `moveToToday()` が
`PATCH /api/tasks/:id` に `{ screen: "today" }` を送っている。
SpaceNavigator は廃止するが（`docs/ai-dev-guide.md` §5.1）、
**この関数の中身はそのまま移設して使える**。

### 9.5 Figma のコンポーネント一覧

| 名前 | 用途 |
|---|---|
| `TaskCard/Pixel` | HOME のカルーセル用（Category 5バリアント） |
| `CardRow/Pixel` | 一覧の行 |
| `NavItem/Pixel` | 下部ナビのタブ（State: Active / Inactive） |
| `Overlay/Detail` | タスク詳細（Source: List / Today） |
| `Overlay/Create` | タスク作成 |

---

## 10. 画面遷移とオーバーレイ

### 10.1 遷移は2層

| 層 | 対象 | 挙動 |
|---|---|---|
| **ルート** | Today / Next / Overdue / Buffs / Profile | 下部タブで `router.push()`。**普通の画面切り替え** |
| **オーバーレイ** | タスク詳細 / タスク作成 / 達成エフェクト | 現在の画面の上に重なる。**ルートを持たない** |

**空間モデル（カメラ移動・フリック遷移）は廃止した。**
`docs/ai-dev-guide.md` §5.1 に廃止対象のファイル一覧がある。

### 10.2 画面ごとのアクション

**HOME (Today)**

| 操作 | 結果 |
|---|---|
| カードを横にドラッグ | 隣のカードへ（慣性スナップ） |
| 中央のカードをタップ | 詳細オーバーレイ |
| **カードを下にドラッグ** | 達成 → 達成エフェクト（§8.2） |
| 「タスクを追加」 | 作成オーバーレイ |
| 下部タブ | 各画面へ |
| ☰ | Profile へ |

**達成エフェクト (FX)**

| 操作 | 結果 |
|---|---|
| TAP TO CONTINUE | Today へ戻る。カードが1枚減り EXP が増えた状態 |

**一覧 (Next / Overdue / Buffs)**

| 操作 | 結果 |
|---|---|
| カテゴリタブ | 一覧を絞り込む |
| 行をタップ | 詳細オーバーレイ |
| 詳細の「Today へ送る」 | `screen` を `today` に更新して Today へ |

### 10.3 オーバーレイの見せ方

ピクセル調を保つため、以下を守る:

- **背景の暗幕に blur をかけない**。`--scrim`（黒 70%）のベタ塗りのみ
- モーダルは 3px 輪郭 + ベベル（§4.1）。角丸なし
- 出現は**下からせり上がる**。`EASE_OUT_BACK` で軽く行き過ぎてから収まる
- 閉じるときは逆再生でよい（`EASE_IN`）
- **フェードで薄く消さない**。透明度を使うなら `HOLD` で一段階（§8.1）

### 10.4 オーバーレイの中身

**`Overlay/Detail`（Source: List = 354×540 / Today = 354×468）**

| 位置 | 要素 |
|---|---|
| (3, 6) 348×42 | カテゴリ帯。`Overlay/Create` では金地の `NEW QUEST` |
| (312, 12) 30×30 | 閉じる ✕ |
| (12, 66) | タイトル（heading-jp） |
| (12, 102) | 説明（body-jp） |
| (12, 190) | LEVEL チップ 4つ（78×42、pitch 84） |
| (12, 266) / (12, 314) | TASK TIME のステッパー（時間 / 分） |
| (12, 390) 330×60 | 主アクション（`List` のみ）／ 削除（`Today`） |
| (12, 462) 330×60 | 削除（`List` のみ） |

**削除はどの画面から開いても常にある。** カードは自分自身を削除する手段を
持つべきで、それが Today からしか使えないのは誤り（2026-09-05 に修正）。

フッターの構成:

| Source | 主アクション | 削除 |
|---|---|---|
| `List` | 「Today へ送る」金ボタン（y=390） | **常にある**（y=462） |
| `Today` | なし（完了はドラッグ） | **常にある**（y=390） |

- 主アクション → `PATCH /api/tasks/:id` `{ screen: "today" }`
- 削除 → `DELETE /api/tasks/:id`

**削除は必ずフッターの最下段**に置き、`delete/button` / `delete/text` という
同じ名前で持つ。位置は主アクションの有無でずれるが、
「最後の要素が削除」という関係は変わらない。

**所要時間はスライダーではなくステッパー**（◀ 値 ▶）。
現行コードは Days / Hours / Min の3スライダーだが、つまみのある
スライダーはピクセル調に合わない。RPGメニュー風のステッパーに置き換える。
**Days は廃止**し 時間 / 分 の2軸にした（1日を超えるタスクは日次アプリの
想定外のため）。`estimatedMinutes` の型は変わらない。

**削除の導線をここに置いた理由**: `DELETE /api/tasks/:id` は実装済みだが
UI が無かった（`docs/ai-product-brief.md` §7）。タスクの詳細は、そのタスクに
対してできることが集まる場所なので、削除もここに属する。
押し間違いを避けるため、ベベルを付けず「押したくなる見た目」にしていない。

**`Overlay/Create`（354×636）**
詳細と同じ骨格。違いは次の3点だけ。
- ヘッダーが金地の `NEW QUEST`
- タイトル / メモが入力欄（`--field` 塗り + 3px 輪郭）
- **CATEGORY の選択行**（60×48 のアイコンボタン5つ、pitch 66）

### 10.5 エントリポイント

| 操作 | 場所 | 開くもの |
|---|---|---|
| ＋ ボタン | HOME 上部バー (288, 52) 36×36 | `Overlay/Create` |
| カードをタップ | HOME のカルーセル中央 | `Overlay/Detail` (Source=Today) |
| 行をタップ | 一覧3画面 | `Overlay/Detail` (Source=List) |

**ドラッグ操作は Today のカードだけに使う。** 一覧では使わない
（世界観に合わないため。決定: 2026-09-05）。

既存の `TaskCarousel.tsx` は framer-motion の `drag` とスプリングを自前調整済みなので、
ドラッグ検知はそれを流用し、**下方向のドラッグでドロップ枠に入れる**分岐を追加する形になる。
完了時は `PATCH /api/tasks/:id` に `{ done: true }` を送る（API は既に対応済み）。
