"use client";

/**
 * 空 / 読込中 / エラー の表示。Figma の `State/Pixel` に対応（§9.10）。
 *
 * **エラーの枠は必ず danger 色にする。** 旧実装は fetch 失敗を
 * `setTasks([])` で握りつぶしていて、通信エラーと0件が区別できなかった。
 */

type Kind = "empty" | "loading" | "error";

const SPRITES: Record<Kind, string[]> = {
  // からっぽの箱
  empty: [
    "..xxxxxxxxxx..",
    ".x..........x.",
    "x............x",
    "x............x",
    "x............x",
    "x............x",
    "x............x",
    ".x..........x.",
    "..xxxxxxxxxx..",
  ],
  // 砂時計
  loading: [
    "xxxxxxxx",
    "x......x",
    ".x....x.",
    "..x..x..",
    "...xx...",
    "..x..x..",
    ".x....x.",
    "x......x",
    "xxxxxxxx",
  ],
  // ビックリマーク
  error: [
    "..xxxx..",
    "..xxxx..",
    "..xxxx..",
    "..xxxx..",
    "..xxxx..",
    "........",
    "..xxxx..",
    "..xxxx..",
  ],
};

function spriteUrl(kind: Kind, color: string, cell = 6): string {
  const rows = SPRITES[kind];
  const w = rows[0].length * cell;
  const h = rows.length * cell;
  let body = "";
  rows.forEach((row, y) => {
    let run = -1;
    for (let x = 0; x <= row.length; x++) {
      const on = row[x] === "x";
      if (on && run === -1) run = x;
      if (!on && run !== -1) {
        body += `<rect x="${run * cell}" y="${y * cell}" width="${
          (x - run) * cell
        }" height="${cell}" fill="${color}"/>`;
        run = -1;
      }
    }
  });
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
    `viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const SPRITE_SIZE: Record<Kind, { w: number; h: number }> = {
  empty: { w: 84, h: 54 },
  loading: { w: 48, h: 54 },
  error: { w: 48, h: 48 },
};

export type StateBlockProps = {
  kind: Kind;
  title?: string;
  sub?: string;
  onRetry?: () => void;
};

const DEFAULTS: Record<Kind, { title: string; sub?: string; color: string }> = {
  empty: {
    title: "まだ なにもない",
    sub: "＋ から クエストを ついかしよう",
    color: "var(--ink-faint)",
  },
  loading: { title: "よみこみ中", color: "var(--ink-muted)" },
  error: {
    title: "よみこめませんでした",
    sub: "つうしんを かくにんしてください",
    color: "var(--danger)",
  },
};

export default function StateBlock({
  kind,
  title,
  sub,
  onRetry,
}: StateBlockProps) {
  const d = DEFAULTS[kind];
  const size = SPRITE_SIZE[kind];

  return (
    <div
      className={[
        "flex flex-col items-center justify-center border-[3px] bg-panel px-3 py-[30px]",
        kind === "error" ? "border-danger" : "border-ink-outline",
      ].join(" ")}
      role={kind === "error" ? "alert" : undefined}
      aria-busy={kind === "loading" || undefined}
    >
      <span
        aria-hidden="true"
        className={kind === "loading" ? "pixel-hourglass" : undefined}
        style={{
          width: size.w,
          height: size.h,
          backgroundImage: spriteUrl(kind, d.color),
          backgroundRepeat: "no-repeat",
        }}
      />

      <p className="mt-6 text-[14px] text-ink">{title ?? d.title}</p>
      {(sub ?? d.sub) && (
        <p className="mt-2 text-[11px] text-ink-muted">{sub ?? d.sub}</p>
      )}

      {kind === "error" && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 border-[3px] border-ink-outline bg-panel-raised px-6 py-2 text-[11px] text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light"
        >
          もういちど
        </button>
      )}
    </div>
  );
}
