# デザイン参考画像

リデザインの参考画像を置く場所。Claude はここのファイルを直接読める。

## 使い方

1. 画像をこのディレクトリに置く（`.png` / `.jpg` / `.jpeg`）
2. Claude に「`docs/design-refs/` の画像を見て」と伝える。
   一部だけ見せたいときはファイル名かパスを指定する

## ファイル名の付け方

Claude が「これは何の参考なのか」を推測しなくて済むように、
用途がわかる名前を付ける。

| 用途 | 例 |
|---|---|
| 全体の方向性・トンマナ | `direction-01.png` |
| 特定画面 | `screen-today.png` / `screen-profile.png` |
| 特定コンポーネント | `component-taskcard.png` / `component-nav.png` |
| 配色だけ | `palette-01.png` |
| モーション（動画から切り出したコマ等） | `motion-carousel-01.png` |

複数案を比較したい場合は末尾に連番（`direction-01` / `direction-02`）。

## 補足

- 参考画像は「そのまま真似る」対象ではなく方向性の指示として扱う。
  「この画像のどこを取り入れたいか」を一言添えてもらえると精度が上がる
- 実装時の制約は `docs/ai-dev-guide.md` §8.6（モバイル制約）が
  参考画像より優先される。特に blur を多用したデザインは iPhone で重くなる
- 他アプリのスクリーンショット等をリポジトリに含めたくない場合は、
  `.gitignore` に `docs/design-refs/*.png` を追加する
