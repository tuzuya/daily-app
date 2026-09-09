"use client";

import { useMemo } from "react";
import type { Task } from "@/types/task";
import { categoryDesign, inferLevel } from "@/lib/task-design";
import { categorySpriteUrl, starsSize, starsUrl } from "@/lib/pixel-sprites";
import { holoStripe, PASTEL, platinumRays, sparkle } from "@/lib/pixel-foil";

/**
 * ピクセル調のタスクカード（150×200）。Figma の `TaskCard/Pixel` に対応。
 *
 * 難易度がそのままレア度エフェクトになる（docs/pixel-style-guide.md §9.7）。
 * 難しいタスクほど育つ = 難しいタスクほど豪華、という対応（ai-product-brief §1.1）。
 */

const W = 150;
const H = 200;

function formatTaskTime(min?: number): string | null {
  if (!min || min <= 0) return null;
  if (min < 60) return `のこり ${min}分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `のこり ${h}時間${m}分` : `のこり ${h}時間`;
}

export type TaskCardProps = {
  task: Task;
  onPress?: (task: Task) => void;
};

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const design = categoryDesign(task.category);
  const level = inferLevel(task.points);
  const starCount = { easy: 1, normal: 2, hard: 3, extra: 4 }[level];

  const isExtra = level === "extra";
  const isHard = level === "hard";
  const hasFoil = isHard || isExtra;

  // EXTRA の光線は2コマ。位相違いを CSS アニメーションで交互に見せる
  const rays = useMemo(
    () =>
      isExtra
        ? [platinumRays(144, 78, 0), platinumRays(144, 78, 1)]
        : null,
    [isExtra],
  );

  // 箔の上では明るいスプライトが消えるので暗いシルエットにする
  const spriteColor = hasFoil ? "#14100a" : design.hex;
  const sprite = categorySpriteUrl(task.category, spriteColor, 3);

  const inkOnFace = isExtra ? "var(--ink)" : "var(--ink-inverse)";

  return (
    <button
      type="button"
      onClick={() => onPress?.(task)}
      style={{ width: W, height: H }}
      className={[
        "relative block overflow-hidden border-[3px] border-ink-outline text-left",
        isExtra ? "bg-panel" : design.faceClass,
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light",
      ].join(" ")}
    >
      {/* --- EXTRA: 放射プリズム（プラチナ）--- */}
      {isExtra && rays && (
        <>
          <span
            className="absolute bg-[color:var(--plat-5)]"
            style={{ left: 3, top: 12, width: 144, height: 78 }}
            aria-hidden="true"
          />
          {rays.map((url, i) => (
            <span
              key={i}
              className="pixel-rays absolute"
              style={{
                left: 3,
                top: 12,
                width: 144,
                height: 78,
                backgroundImage: url,
                animationDelay: `${i * 0.32}s`,
              }}
              aria-hidden="true"
            />
          ))}
        </>
      )}

      {/* --- 上辺のベベル。光源は左上（§4.1）--- */}
      <span
        className="absolute"
        style={{ left: 3, top: 3, width: 144, height: 3, background: "var(--bevel-hi)" }}
        aria-hidden="true"
      />

      {/* カテゴリ帯。**高さ 18px**（Figma: strip y=6 h=18 / edge y=24）。
          42px にするとスプライト枠（y=36）に食い込む */}
      <span
        className={["absolute", design.stripClass].join(" ")}
        style={{ left: 3, top: 6, width: 144, height: 18 }}
        aria-hidden="true"
      />
      <span
        className="absolute bg-ink-outline"
        style={{ left: 3, top: 24, width: 144, height: 3 }}
        aria-hidden="true"
      />
      <span
        className="font-label absolute text-[10px] leading-[14px] text-ink"
        style={{ left: 9, top: 8 }}
      >
        {design.label ?? task.category.toUpperCase()}
      </span>

      {/* スプライト枠。**必ず不透明**にする。
          EXTRA で透明にすると背後の放射光が透けて絵柄が読めない */}
      <span
        className="absolute border-[3px] border-ink-outline bg-panel"
        style={{
          left: 51,
          top: 36,
          width: 48,
          height: 48,
          backgroundImage: isHard ? holoStripe() : undefined,
        }}
        aria-hidden="true"
      />
      <span
        className="absolute"
        style={{
          left: 57,
          top: 45,
          width: 36,
          height: 30,
          backgroundImage: sprite,
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />

      {/* --- NORMAL: 淡い箔の縁。辺ごとに色相を変える --- */}
      {level === "normal" && (
        <>
          <span className="absolute" style={{ left: 3, top: 3, width: 144, height: 3, background: PASTEL.cyan }} aria-hidden="true" />
          <span className="absolute" style={{ left: 3, top: 194, width: 144, height: 3, background: PASTEL.pink }} aria-hidden="true" />
          <span className="absolute" style={{ left: 3, top: 6, width: 3, height: 188, background: PASTEL.gold }} aria-hidden="true" />
          <span className="absolute" style={{ left: 144, top: 6, width: 3, height: 188, background: PASTEL.violet }} aria-hidden="true" />
        </>
      )}

      {/* --- HARD / EXTRA: 箔の枠 --- */}
      {hasFoil && (
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            // 枠だけを塗る。中身は clip-path で抜く
            backgroundImage: isExtra ? platinumRays(W, H, 0) : holoStripe(),
            clipPath: isExtra
              ? "polygon(0 0,100% 0,100% 100%,0 100%,0 6px,6px 6px,6px calc(100% - 6px),calc(100% - 6px) calc(100% - 6px),calc(100% - 6px) 6px,0 6px)"
              : "polygon(0 0,100% 0,100% 100%,0 100%,0 3px,3px 3px,3px calc(100% - 3px),calc(100% - 3px) calc(100% - 3px),calc(100% - 3px) 3px,0 3px)",
          }}
          aria-hidden="true"
        />
      )}

      {/* --- EXTRA: 名前帯。文字は板の上に載せる --- */}
      {isExtra && (
        <>
          <span className="absolute bg-panel" style={{ left: 3, top: 90, width: 144, height: 104 }} aria-hidden="true" />
          <span className="absolute bg-ink-outline" style={{ left: 3, top: 90, width: 144, height: 3 }} aria-hidden="true" />
        </>
      )}

      {/* --- HARD / EXTRA: キラ。柄と別レイヤーで、その場で明滅 --- */}
      {hasFoil &&
        [
          [12, 27],
          [129, 60],
          [39, 75],
        ].map(([x, y], i) => (
          <span
            key={i}
            className="pixel-sparkle absolute"
            style={{
              left: x,
              top: y,
              width: 9,
              height: 9,
              backgroundImage: sparkle(9),
              animationDelay: `${0.3 + i * 0.45}s`,
            }}
            aria-hidden="true"
          />
        ))}

      {/* 下辺のベベル */}
      <span
        className="absolute"
        style={{
          left: 3,
          top: 194,
          width: 144,
          height: 3,
          background: isExtra
            ? "var(--ink-outline)"
            : `var(${design.faceDarkVar})`,
        }}
        aria-hidden="true"
      />

      {/* --- 文字 --- */}
      <span
        className="absolute text-[14px] leading-[22px]"
        style={{ left: 9, top: 96, width: 132, color: inkOnFace }}
      >
        {task.title}
      </span>

      <span
        className="absolute"
        style={{
          left: 9,
          top: 147,
          width: 132,
          height: 3,
          background: isExtra
            ? "var(--ink-faint)"
            : `var(${design.faceDarkVar})`,
        }}
        aria-hidden="true"
      />

      <span
        className="absolute"
        style={{
          left: 9,
          top: 154,
          ...starsSize(starCount),
          backgroundImage: starsUrl(starCount, isExtra ? "#f4ecd8" : "#14100a"),
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />

      <span
        className="font-num absolute text-right text-[10px] leading-[16px]"
        style={{
          left: 81,
          top: 155,
          width: 60,
          color: isExtra ? "var(--points)" : "var(--ink-inverse)",
        }}
      >
        {task.points}XP
      </span>

      {formatTaskTime(task.estimatedMinutes) && (
        <span
          className="absolute text-[11px] leading-[16px]"
          style={{
            left: 9,
            top: 174,
            width: 132,
            color: isExtra
              ? "var(--ink-muted)"
              : `var(${design.faceDarkVar})`,
          }}
        >
          {formatTaskTime(task.estimatedMinutes)}
        </span>
      )}
    </button>
  );
}
