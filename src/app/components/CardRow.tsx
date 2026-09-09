"use client";

import type { Task } from "@/types/task";
import { categoryDesign, inferLevel } from "@/lib/task-design";
import { categorySpriteUrl, difficultySize, difficultyUrl } from "@/lib/pixel-sprites";

/**
 * 一覧用のコンパクトなタスクカード（354×72）。
 * Figma の `CardRow/Pixel` に対応（docs/pixel-style-guide.md §9.3）。
 *
 * **カテゴリ帯は持たない。** カテゴリはタブ側が示しているので冗長で、
 * 省いたぶんを一覧性に回している。
 */

export type CardRowProps = {
  task: Task;
  /** 期限や経過を示す文字列。画面ごとに意味が違うので呼び出し側が決める */
  meta?: string;
  onPress?: (task: Task) => void;
};

export default function CardRow({ task, meta, onPress }: CardRowProps) {
  const design = categoryDesign(task.category);
  const level = inferLevel(task.points);
  const markCount = { easy: 1, normal: 2, hard: 3, extra: 4 }[level];

  return (
    <button
      type="button"
      onClick={() => onPress?.(task)}
      className={[
        "relative block h-[72px] w-full border-[3px] border-ink-outline text-left",
        design.faceClass,
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light",
      ].join(" ")}
    >
      {/* ベベル。光源は左上 */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-[3px] w-full bg-bevel-hi"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[3px] w-full"
        style={{ background: `var(${design.faceDarkVar})` }}
      />

      {/* スプライト枠 */}
      <span
        aria-hidden="true"
        className="absolute border-[3px] border-ink-outline bg-panel"
        style={{ left: 12, top: 12, width: 48, height: 48 }}
      />
      <span
        aria-hidden="true"
        className="absolute"
        style={{
          left: 18,
          top: 21,
          width: 36,
          height: 30,
          backgroundImage: categorySpriteUrl(task.category, "#f4ecd8", 3),
          backgroundRepeat: "no-repeat",
        }}
      />

      <span
        className="absolute truncate text-[14px] leading-[22px] text-ink-inverse"
        style={{ left: 72, top: 14, width: 162 }}
      >
        {task.title}
      </span>

      {meta && (
        <span
          className="absolute text-[11px] leading-[16px]"
          style={{ left: 72, top: 42, width: 162, color: "rgba(20,16,10,0.6)" }}
        >
          {meta}
        </span>
      )}

      <span
        aria-hidden="true"
        className="absolute"
        style={{
          left: 255,
          top: 16,
          ...difficultySize(markCount),
          backgroundImage: difficultyUrl(markCount, "#14100a"),
          backgroundRepeat: "no-repeat",
        }}
      />

      <span
        className="font-num absolute text-right text-[10px] leading-[16px] text-ink-inverse"
        style={{ left: 246, top: 40, width: 96 }}
      >
        {task.points}XP
      </span>
    </button>
  );
}
