/**
 * 画面の地。**水平の色帯 + 境界のディザリング**でできている。
 *
 * 帯の高さ・色・境界の位置は Figma の `HOME — Today (Pixel)` の
 * `bg/*` レイヤーから写した実測値（390×844 基準）。
 * 目分量で置くと参考画像の奥行きが出ないので、**数値は Figma を正**とする。
 *
 * | 帯 | y | 色 |
 * |---|---|---|
 * | deep-top | 0–148 | `#221c12` |
 * | mid | 148–250 | `#3b3122` |
 * | warm | 250–500 | `#5c4d33` ← カードが乗る |
 * | lower | 500–744 | `#3b3122` |
 * | 棚の縁 | 616 / 619 | `#7a6743` / `#14100a` |
 *
 * ピクセルアートではグラデーションを使わないので（§1）、
 * **帯を並べて境界を市松で散らす**のが唯一の階調表現になる（§4.2）。
 *
 * サーバーコンポーネント。状態を持たないので JS を送らない。
 */

/** 6px セルの市松。**上の帯の色**を下の帯へ散らして境界をつなぐ（§4.2） */
function ditherUrl(color: string, cell = 6): string {
  const s = cell * 2;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" ` +
    `viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges">` +
    `<rect x="0" y="0" width="${cell}" height="${cell}" fill="${color}"/>` +
    `<rect x="${cell}" y="${cell}" width="${cell}" height="${cell}" fill="${color}"/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function Dither({ color, top }: { color: string; top: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-0 block h-[12px]"
      style={{
        top,
        backgroundImage: ditherUrl(color),
        backgroundSize: "12px 12px",
      }}
    />
  );
}

export default function PixelBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 bg-ground"
    >
      <span
        className="absolute inset-x-0 top-0 block h-[148px] bg-ground-deep"
      />
      <span
        className="absolute inset-x-0 block h-[102px] bg-ground"
        style={{ top: 148 }}
      />
      {/* カードが乗る明るい暖色帯 */}
      <span
        className="absolute inset-x-0 block h-[250px] bg-ground-warm"
        style={{ top: 250 }}
      />
      {/* 残りは下端まで伸ばす。画面高が 844 でなくても破綻しないように */}
      <span
        className="absolute inset-x-0 bottom-0 block bg-ground"
        style={{ top: 500 }}
      />

      <Dither color="var(--ground-deep)" top={148} />
      <Dither color="var(--ground)" top={250} />
      <Dither color="var(--ground-warm)" top={500} />

      {/* 棚の縁。ドロップ枠の背後を通り、枠が棚に載って見える */}
      <span
        className="absolute inset-x-0 block h-[3px] bg-ground-lift"
        style={{ top: 616 }}
      />
      <span
        className="absolute inset-x-0 block h-[3px] bg-ink-outline"
        style={{ top: 619 }}
      />
    </div>
  );
}
