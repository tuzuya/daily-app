/**
 * 箔（レア度エフェクト）の生成。docs/pixel-style-guide.md §9.7。
 *
 * **CSS のグラデーションは使わない。** `repeating-linear-gradient` で斜め縞を
 * 作ると、境界がブラウザにアンチエイリアスされて階段が消える。
 * 代わりに**階段状に矩形を並べた SVG を data URI にして敷き詰める**。
 * 1周期ぶんのタイルなので継ぎ目なく繰り返せる（Figma は209ノードで描いていたが、
 * コードでは背景1枚で済む）。
 */

const ART = 3; // 1アートピクセル = 3px
const W = 3; // 帯の幅（アートピクセル）

const HOLO = [
  "#e0464e",
  "#ef8a3c",
  "#f2d24a",
  "#5ec25c",
  "#45c7d6",
  "#4a72cc",
  "#9358c9",
];

/** プラチナは明暗の山と谷。等間隔にするとただの灰色になる */
const PLAT = [
  "#ffffff",
  "#eef2f7",
  "#cdd6e0",
  "#6b7787",
  "#414b5a",
  "#6b7787",
  "#cdd6e0",
  "#eef2f7",
];

function svgUrl(width: number, height: number, body: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * 45度の斜めストライプ。`t = ax + ay` が同じ画素が1本の斜線になる。
 * 帯の先頭1ドットだけ隣の色と市松に混ぜて、疑似的な移行を作る。
 */
function stripeTile(palette: string[]): string {
  const n = palette.length;
  const cells = n * W; // 1周期（アートピクセル）
  const size = cells * ART;
  let body = "";

  for (let ay = 0; ay < cells; ay++) {
    let start = 0;
    let cur = -1;
    for (let ax = 0; ax <= cells; ax++) {
      let h = -1;
      if (ax < cells) {
        const t = ax + ay;
        const band = Math.floor(t / W);
        const pos = ((t % W) + W) % W;
        h = ((band % n) + n) % n;
        if (pos === 0 && ax % 2 === 0) h = ((band - 1) % n + n) % n;
      }
      if (cur === -1) {
        cur = h;
        continue;
      }
      if (h !== cur) {
        body +=
          `<rect x="${start * ART}" y="${ay * ART}" ` +
          `width="${(ax - start) * ART}" height="${ART}" fill="${palette[cur]}"/>`;
        start = ax;
        cur = h;
      }
    }
  }
  return svgUrl(size, size, body);
}

let stripeCache: { holo?: string; plat?: string } = {};

/** HARD の虹の箔。背景として敷き詰める */
export function holoStripe(): string {
  stripeCache.holo ??= stripeTile(HOLO);
  return stripeCache.holo;
}

/** 淡い箔（NORMAL の縁）。辺ごとに色相を変えるので単色で返す */
export const PASTEL = {
  cyan: "#a8e4ea",
  violet: "#c9b6ea",
  pink: "#f0bcd4",
  gold: "#f0dfa8",
} as const;

/**
 * EXTRA の放射光。角度で階調を決め、一本おきに抜いて光線にする。
 * 位相違いの2コマを作り、`HOLD` で交互に見せてコマ送りにする
 * （回転させるとドットの格子が崩れる）。
 */
export function platinumRays(
  width: number,
  height: number,
  phase: number,
): string {
  const cols = Math.ceil(width / ART);
  const rows = Math.ceil(height / ART);
  const cx = cols / 2;
  const cy = rows / 2;
  const rayCount = 28;
  const n = PLAT.length;

  const rowsBody: string[] = [];
  for (let ay = 0; ay < rows; ay++) {
    let start = -1;
    let cur = -1;
    for (let ax = 0; ax <= cols; ax++) {
      let idx = -1;
      if (ax < cols) {
        const dx = ax - cx + 0.5;
        const dy = ay - cy + 0.5;
        if (Math.sqrt(dx * dx + dy * dy) >= 4) {
          let a = Math.atan2(dy, dx) / (Math.PI * 2);
          if (a < 0) a += 1;
          const sector = Math.floor(a * rayCount + phase);
          if (((sector % 2) + 2) % 2 === 0) {
            idx = ((Math.floor(sector / 2) % n) + n) % n;
          }
        }
      }
      if (idx !== cur) {
        if (cur !== -1 && start !== -1) {
          rowsBody.push(
            `<rect x="${start * ART}" y="${ay * ART}" ` +
              `width="${(ax - start) * ART}" height="${ART}" fill="${PLAT[cur]}"/>`,
          );
        }
        start = idx === -1 ? -1 : ax;
        cur = idx;
      }
    }
  }
  return svgUrl(width, height, rowsBody.join(""));
}

/** キラ（十字の閃光）。ハイライトは柄と別レイヤーで、動かさない */
export function sparkle(size = 9, color = "#ffffff"): string {
  const u = size / 3;
  return svgUrl(
    size,
    size,
    `<rect x="${u}" y="0" width="${u}" height="${size}" fill="${color}"/>` +
      `<rect x="0" y="${u}" width="${size}" height="${u}" fill="${color}"/>`,
  );
}
