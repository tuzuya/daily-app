import type { TaskCategory } from "@/types/task";

/**
 * カテゴリのドット絵。`x` が塗り、`.` が透明（docs/pixel-style-guide.md §4.3）。
 * Figma 側のスプライトと同じセル定義を持つ。
 */

const CELLS: Record<TaskCategory, string[]> = {
  // ハート
  vitality: [
    "..xx....xx..",
    ".xxxx..xxxx.",
    "xxxxxxxxxxxx",
    "xxxxxxxxxxxx",
    "xxxxxxxxxxxx",
    ".xxxxxxxxxx.",
    "..xxxxxxxx..",
    "...xxxxxx...",
    "....xxxx....",
    ".....xx.....",
  ],
  // 本
  intelligence: [
    ".xxxxxxxxxx.",
    ".x........x.",
    ".x.xxxxxx.x.",
    ".x........x.",
    ".x.xxxxxx.x.",
    ".x........x.",
    ".x.xxxx...x.",
    ".x........x.",
    ".xxxxxxxxxx.",
    "............",
  ],
  // きらめき
  creative: [
    ".....xx.....",
    ".....xx.....",
    "....xxxx....",
    "...xxxxxx...",
    "xxxxxxxxxxxx",
    "xxxxxxxxxxxx",
    "...xxxxxx...",
    "....xxxx....",
    ".....xx.....",
    ".....xx.....",
  ],
  // ポーション（輪郭だけだと小さいとき印刷機に見えるので塗りのシルエット）
  recovery: [
    ".....xx.....",
    "....xxxx....",
    ".....xx.....",
    ".....xx.....",
    "...xxxxxx...",
    "..xxxxxxxx..",
    ".xxxxxxxxxx.",
    ".xxxxxxxxxx.",
    "..xxxxxxxx..",
    "...xxxxxx...",
  ],
  // ビックリマーク
  quest: [
    "....xxxx....",
    "....xxxx....",
    "....xxxx....",
    "....xxxx....",
    "....xxxx....",
    "....xxxx....",
    "............",
    "............",
    "....xxxx....",
    "....xxxx....",
  ],
};

/** ひし形。難易度の数だけ並べる */
const GEM = ["..x..", ".xxx.", "xxxxx", ".xxx.", "..x.."];

function toSvg(rows: string[], cell: number, color: string): string {
  const w = rows[0].length * cell;
  const h = rows.length * cell;
  let body = "";
  rows.forEach((row, y) => {
    let runStart = -1;
    for (let x = 0; x <= row.length; x++) {
      const on = row[x] === "x";
      if (on && runStart === -1) runStart = x;
      if (!on && runStart !== -1) {
        body += `<rect x="${runStart * cell}" y="${y * cell}" width="${
          (x - runStart) * cell
        }" height="${cell}" fill="${color}"/>`;
        runStart = -1;
      }
    }
  });
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
    `viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>`
  );
}

export function categorySpriteUrl(
  category: string,
  color: string,
  cell = 3,
): string {
  const rows = CELLS[category as TaskCategory] ?? CELLS.quest;
  return `url("data:image/svg+xml,${encodeURIComponent(
    toSvg(rows, cell, color),
  )}")`;
}

export function categorySpriteSize(cell = 3): { w: number; h: number } {
  return { w: 12 * cell, h: 10 * cell };
}

/** 難易度のひし形を count 個ぶん並べた SVG */
export function gemsUrl(count: number, color: string, cell = 3): string {
  const pitch = 6 * cell;
  const w = count * pitch - cell;
  const h = 5 * cell;
  let body = "";
  for (let i = 0; i < count; i++) {
    GEM.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (row[x] === "x") {
          body += `<rect x="${i * pitch + x * cell}" y="${
            y * cell
          }" width="${cell}" height="${cell}" fill="${color}"/>`;
        }
      }
    });
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
    `viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function gemsSize(count: number, cell = 3): { w: number; h: number } {
  return { w: count * 6 * cell - cell, h: 5 * cell };
}
