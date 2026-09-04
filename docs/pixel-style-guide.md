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
