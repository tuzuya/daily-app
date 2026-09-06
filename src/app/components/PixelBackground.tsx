/**
 * 画面の地。**水平の色帯 + 境界のディザリング**でできている
 * （docs/pixel-style-guide.md §2.1 の地色4種と §4.2）。
 *
 * これが無いと画面が単色になり、参考画像の「奥行きのある暖色の空間」が
 * 出ない。ピクセルアートではグラデーションを使わないので、
 * **帯を並べて境界を市松で散らす**のが唯一の階調表現になる（§1）。
 *
 * サーバーコンポーネント。状態を持たないので JS を送る必要がない。
 */

/** 6px セルの市松。上の色を下の帯に散らして境界をつなぐ */
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

/** 帯の境界。上の色を 12px（2行）ぶん下の帯へ散らす */
function Dither({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="block h-[12px] w-full"
      style={{ backgroundImage: ditherUrl(color), backgroundSize: "12px 12px" }}
    />
  );
}

/**
 * 帯の構成（上から）:
 *   deep → ground → warm（カードが乗る明るい帯）→ ground → deep
 * warm の上端に lift のハイライトを 3px 入れて「棚」に見せる。
 */
export default function PixelBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 flex flex-col bg-ground"
    >
      <span className="block h-[64px] w-full shrink-0 bg-ground-deep" />
      <Dither color="var(--ground-deep)" />

      <span className="block w-full flex-1 bg-ground" />

      {/* 棚の上端。光が当たっている縁 */}
      <Dither color="var(--ground)" />
      <span className="block h-[3px] w-full shrink-0 bg-ground-lift" />

      {/* カードが乗る明るい暖色帯 */}
      <span className="block h-[168px] w-full shrink-0 bg-ground-warm" />

      <Dither color="var(--ground-warm)" />
      <span className="block h-[96px] w-full shrink-0 bg-ground" />

      <Dither color="var(--ground)" />
      <span className="block h-[40px] w-full shrink-0 bg-ground-deep" />
    </div>
  );
}
