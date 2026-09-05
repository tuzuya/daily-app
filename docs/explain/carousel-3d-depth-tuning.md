# タスクカルーセル 3D奥行き 調整ガイド

タスクカードのカルーセル（横スクロールのカード列）に追加した「奥行き・傾き」エフェクトの解説です。
数値をどう変えると見た目がどう変わるか、を中心にまとめています。

> ⚠️ **これは旧デザイン（空間を感じる 3D 表現）の解説です（2026-09-05 追記）**
> `TaskCarousel.tsx` は現存するが、ピクセルゲーム調へのリデザインで
> **HOME のカルーセルは扇状（`docs/pixel-style-guide.md` §9.1）に変わる**。
> ここに書かれている perspective / rotateY / translateZ の数値は
> **新デザインの指針ではない**。
> リデザイン後も流用するのは **ドラッグ検知と慣性スナップのロジックだけ**で、
> そこに「下方向ドラッグで達成」の分岐を足す（同 §10.5）。

---

## 1. 編集するファイル

```
src/app/components/TaskCarousel.tsx
```

ファイルの先頭付近に、調整用の定数がまとまっています。

---

## 2. アーキテクチャ：「帯方式」（共有パースペクティブ）

### 現在の実装方針

カルーセルは **全カードが同一の消失点を共有する「1枚の湾曲した帯」** として描画されます。

```
        奥（画面の奥）
           ↑
    [左端]   [左]   [中心]   [右]   [右端]
       ↘      ↘       |      ↙      ↙
        z=-110  z=-55  z=0  z=-55  z=-110
              ＼    ＼  |  ／    ／
               ←────消失点（中央）────→
```

- **中心カード**：一番手前（z=0）、傾きなし（正面向き）
- **隣のカード**：少し奥（z=-55px）、少し斜め向き（±18°）
- **端のカード**：さらに奥（z=-110px）、さらに斜め向き（±36°）

「斜め向き」とは、左のカードが「少し右を向いている」状態です。
横から見ると物理的なカード棚のようなイメージです。

### 「帯方式」と「カード個別方式」の違い

| 比較 | 帯方式（現在） | カード個別方式（旧） |
|---|---|---|
| パースペクティブの起点 | **カルーセル中央（共有）** | 各カードの中心（個別） |
| 消失点 | 全カード共通 | カードごとに独立 |
| 見た目 | 1枚の湾曲した帯 | 独立した3Dオブジェクトが並ぶ |
| 実装キー | 親 div の `perspective` + `transform-style: preserve-3d` | 各カードの `transformPerspective` |

### CSS 実装の構造

```
<div overflow="clip">                         ← クリップのみ（スタッキングコンテキストなし）
  <div perspective="800px">                   ← 消失点を1箇所に固定（帯の基点）
    <motion.div transform-style="preserve-3d"> ← 子を同一 3D 空間に展開
      <motion.div rotateY translateZ ...>      ← 各カードは帯面上の位置を持つ
      <motion.div rotateY translateZ ...>
      ...
    </motion.div>
  </div>
</div>
```

> **注意**: `overflow: hidden` は内部でスタッキングコンテキストを生成し `preserve-3d` を
> 無効化することがある。そのため外側のクリップには `overflow: clip` を使用している。

---

## 3. 調整できるパラメーター一覧

### `PERSPECTIVE`

```ts
const PERSPECTIVE = 800; // px
```

**役割**: 遠近感の強さ。「視点の距離」です。

| 値を小さくすると | 値を大きくすると |
|---|---|
| 遠近感が強くなる（端カードが大きく縮む） | 遠近感が弱くなる（フラットに近づく） |
| 極端な3D感、ゲームっぽい | 落ち着いた奥行き感 |

**目安**: 500〜1200 の範囲で試してみてください。

---

### `ROTATE_Y_PER_CARD`

```ts
const ROTATE_Y_PER_CARD = 18; // deg
```

**役割**: カードが中心から1枚離れるごとに傾く角度（度数）です。

| 値を小さくすると | 値を大きくすると |
|---|---|
| カードがほぼ正面向き（傾きが少ない） | カードが大きく横を向く |
| フラットなカルーセルに近い | より立体的、棚感が強い |

**目安**: 10〜25 の範囲が自然です。0 にすると傾きなしになります。

---

### `ROTATE_Y_MAX`

```ts
const ROTATE_Y_MAX = 52; // deg
```

**役割**: 傾きの上限値（何枚目以降は固定になるか）です。

端のカードがあまりにも横向きになりすぎないための「ストッパー」です。
`ROTATE_Y_PER_CARD × 3枚` を超えたあたりで頭打ちになるよう設定しています。

**目安**: `ROTATE_Y_PER_CARD` の 2.5〜3倍くらいが自然です。

---

### `DEPTH_PER_CARD`

```ts
const DEPTH_PER_CARD = 55; // px
```

**役割**: カードが中心から1枚離れるごとに奥に下がる距離（ピクセル）です。

| 値を小さくすると | 値を大きくすると |
|---|---|
| 奥行きが浅い（ほぼ同じ平面に並ぶ） | 奥行きが深い（端カードが大きく遠ざかる） |

**目安**: 30〜100 の範囲で試してみてください。

---

### `SCALE_SIDE`

```ts
const SCALE_SIDE = 0.92;
```

**役割**: 中心以外のカードの「大きさの倍率」です（1.0 = 等倍）。

PERSPECTIVE による自然な縮小に加えて、手動でさらに小さく見せるための調整です。

| 値を小さくすると | 値を大きくすると（1.0に近づけると） |
|---|---|
| 端カードが小さく、中心カードが目立つ | すべてほぼ同じサイズになる |

**目安**: 0.85〜0.95 の範囲が自然です。

---

## 4. 「なめらか・物理的な動き」のパラメーター

3Dとは別に、ドラッグしたときの「動き方」も調整できます。

### 初期抵抗（じわっと動き出す感覚）

```ts
const RESIST_ZONE = 35;  // px: 抵抗が効く距離
const RESIST_START = 0.3; // ドラッグ開始時の動き量（0〜1、小さいほど重い）
```

- `RESIST_ZONE` を大きくする → より長い距離「重さ」が続く
- `RESIST_START` を小さくする → 動き始めがより重くなる
- `RESIST_START = 1.0` にすると抵抗なし（等速で動く）

### 離したときのスナップ速度

```ts
// springForVelocity 関数内
if (abs > 1500) {
  return { stiffness: 180, damping: 22, mass: 1.2, ... }; // 速いフリック
}
if (abs > 600) {
  return { stiffness: 240, damping: 26, mass: 1.0, ... }; // 中速
}
return { stiffness: 340, damping: 32, mass: 0.9, ... };   // ゆっくり
```

各パラメーターの意味：

| パラメーター | 役割 |
|---|---|
| `stiffness`（バネの硬さ） | 高いほど速くスナップする。低いほどゆっくり収束 |
| `damping`（摩擦） | 高いほどピタッと止まる。低いほどふわふわ揺れる |
| `mass`（重さ） | 高いほど慣性が大きく、ゆったり動く |

### ⚠️ velocity はプロパティごとに分離すること

`springForVelocity` が返す `velocity` は **`x`（横位置）にのみ** 適用してください。

`scale` / `opacity` / `rotateY` / `z` に同じ velocity を渡すと、
速いフリック時にこれらのプロパティが大きくオーバーシュートします。
（`scale` は 0.75〜1.0 という狭い値域なのに、数百〜数千 px/s の初速が注入されるため）

```tsx
transition={{
  // x だけ velocity を引き継ぐ
  x: { type: "spring", stiffness, damping, mass, velocity },
  // それ以外は velocity なしで同じ stiffness/damping/mass を使う
  scale:   { type: "spring", stiffness, damping, mass },
  opacity: { type: "spring", stiffness, damping, mass },
  rotateY: { type: "spring", stiffness, damping, mass },
  z:       { type: "spring", stiffness, damping, mass },
}}
```

---

## 5. よくある調整パターン

### 「もっとフラットにしたい（3Dを弱めたい）」

```ts
const PERSPECTIVE = 1200;     // 大きく（遠近感を弱める）
const ROTATE_Y_PER_CARD = 8;  // 小さく（傾きを減らす）
const DEPTH_PER_CARD = 25;    // 小さく（奥行きを浅くする）
```

### 「もっと立体的にしたい（3Dを強めたい）」

```ts
const PERSPECTIVE = 600;      // 小さく（遠近感を強める）
const ROTATE_Y_PER_CARD = 25; // 大きく（傾きを増やす）
const DEPTH_PER_CARD = 80;    // 大きく（奥行きを深くする）
```

### 「傾きは残しつつ、奥行きだけなくしたい」

```ts
const DEPTH_PER_CARD = 0; // 奥行きだけ 0 にする
```

### 「3D効果を完全にオフにしたい」

```ts
const PERSPECTIVE = 99999;    // 実質無限遠（影響なし）
const ROTATE_Y_PER_CARD = 0;  // 傾きなし
const DEPTH_PER_CARD = 0;     // 奥行きなし
```

---

## 6. パラメーターの場所（ファイル内の先頭付近）

```
src/app/components/TaskCarousel.tsx
```

```
1行目付近:
  CARD_WIDTH, CARD_GAP ...（カードサイズ）
  SCALE_SIDE ...（端カードの大きさ）

  ↓ここが3D設定↓
  PERSPECTIVE
  ROTATE_Y_PER_CARD
  ROTATE_Y_MAX
  DEPTH_PER_CARD

  ↓ここがドラッグ設定↓
  RESIST_ZONE
  RESIST_START
  springForVelocity 関数内の stiffness / damping / mass
```

変更はこのブロックだけ触れば OK です。他の部分は触らなくて大丈夫です。
