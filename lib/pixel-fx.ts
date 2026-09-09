/**
 * 達成エフェクトの描画部品（docs/pixel-style-guide.md §8.3）。
 *
 * 集中線もスタンプも **SVG を data URI にして背景に敷く**。
 * pixel-foil.ts と同じ理由で、CSS のグラデーションや円弧は
 * ブラウザにアンチエイリアスされて階段が消えるため使わない。
 */

const ART = 3;

function svgUrl(w: number, h: number, body: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
    `viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * 集中線。中心から放射状に伸びる楔形を、角度で1本おきに描く。
 * 回転させるとドットの格子が崩れるので、**回すのは低速のときだけ**
 * （§8.3 は 2.4秒で -9度 = ほぼ静止に近い速度なので許容範囲）。
 */
export function speedLines(
  size: number,
  color = "#ffd966",
  rays = 24,
): string {
  const cells = Math.ceil(size / ART);
  const c = cells / 2;
  const parts: string[] = [];

  for (let ay = 0; ay < cells; ay++) {
    let start = -1;
    for (let ax = 0; ax <= cells; ax++) {
      let on = false;
      if (ax < cells) {
        const dx = ax - c + 0.5;
        const dy = ay - c + 0.5;
        const r = Math.sqrt(dx * dx + dy * dy);
        // 中心は空ける。カードとテキストを載せる場所
        if (r > cells * 0.22) {
          let a = Math.atan2(dy, dx) / (Math.PI * 2);
          if (a < 0) a += 1;
          const sector = Math.floor(a * rays);
          // 外側ほど太く見えるよう、内側は間引く
          const density = r / (cells * 0.5);
          on = sector % 2 === 0 && density > 0.35;
        }
      }
      if (on && start === -1) start = ax;
      if (!on && start !== -1) {
        parts.push(
          `<rect x="${start * ART}" y="${ay * ART}" ` +
            `width="${(ax - start) * ART}" height="${ART}" fill="${color}"/>`,
        );
        start = -1;
      }
    }
  }
  return svgUrl(size, size, parts.join(""));
}

/** EXP バーの1マス。10個並べて経験値を見せる */
export const EXP_SEGMENTS = 10;

/**
 * star / burst のスタンプ。達成時に叩きつける印。
 * 8方向に伸びる棘を持つ多角形を、階段で描く。
 */
export function burstStamp(size: number, color: string): string {
  const cells = Math.ceil(size / ART);
  const c = cells / 2;
  const parts: string[] = [];

  for (let ay = 0; ay < cells; ay++) {
    let start = -1;
    for (let ax = 0; ax <= cells; ax++) {
      let on = false;
      if (ax < cells) {
        const dx = ax - c + 0.5;
        const dy = ay - c + 0.5;
        const r = Math.sqrt(dx * dx + dy * dy) / (cells * 0.5);
        const a = Math.atan2(dy, dx);
        // 8つの棘。cos(8θ) が大きいほど遠くまで伸びる
        const spike = 0.62 + 0.38 * Math.cos(8 * a);
        on = r <= spike;
      }
      if (on && start === -1) start = ax;
      if (!on && start !== -1) {
        parts.push(
          `<rect x="${start * ART}" y="${ay * ART}" ` +
            `width="${(ax - start) * ART}" height="${ART}" fill="${color}"/>`,
        );
        start = -1;
      }
    }
  }
  return svgUrl(size, size, parts.join(""));
}
