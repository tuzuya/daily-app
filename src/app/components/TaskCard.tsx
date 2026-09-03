"use client";

import type { Task } from "@/types/task";
import { categoryDesign } from "@/lib/task-design";

function formatTaskTime(min?: number): string | null {
  if (!min || min <= 0) return null;
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h < 24) return m ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const hh = h % 24;
  const parts = [`${d}d`];
  if (hh) parts.push(`${hh}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(" ");
}

export type TaskCardProps = {
  task: Task;
  onPress?: (task: Task) => void;
};

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const color = categoryDesign(task.category);
  const imageSrc = color.image;
  const taskTimeText = formatTaskTime(task.estimatedMinutes);

  return (
    <button
      type="button"
      onClick={() => onPress?.(task)}
      className={[
        "group relative aspect-[3/4] w-full overflow-hidden rounded-[14px] border text-left",
        "bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        "transition-all duration-300 ease-out",
        "hover:bg-white/[0.1] hover:shadow-[0_12px_40px_rgba(100,60,180,0.25)] hover:scale-[1.015]",
        "active:scale-[0.98]",
        color.border,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-[1px] rounded-[14px] bg-gradient-to-br from-white/10 via-transparent to-purple-400/10" />
      </div>

      <div className="relative flex h-full flex-col justify-between p-2.5">
        {/* Top: thumbnail + category */}
        <div className="flex items-start justify-between gap-1">
          <div
            className={[
              "relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-full",
              "bg-gradient-to-br shadow-md shadow-purple-900/40",
              color.gradient,
            ].join(" ")}
          >
            {imageSrc ? (
              <img src={imageSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[0.6rem] font-bold text-white/90">
                {task.title.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />
          </div>

          <span
            className={[
              "rounded-full bg-gradient-to-r px-1.5 py-px text-[0.5rem] font-semibold uppercase tracking-wider text-white shadow-sm",
              color.gradient,
            ].join(" ")}
          >
            {task.category}
          </span>
        </div>

        {/* Middle: title */}
        <p className="text-[0.7rem] font-medium leading-snug text-slate-50 line-clamp-3">
          {task.title}
        </p>

        {/* Bottom: task time + points */}
        <div className="flex items-end justify-between">
          {taskTimeText ? (
            <div className="flex items-center gap-1 text-[0.55rem] font-medium text-slate-300/80">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-2.5 w-2.5 text-slate-400"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                  clipRule="evenodd"
                />
              </svg>
              {taskTimeText}
            </div>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-0.5 text-[0.6rem] font-semibold text-amber-300/90">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-2.5 w-2.5"
            >
              <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 13.28l-4.77 2.51.91-5.33L2.27 6.69l5.34-.78L10 1z" />
            </svg>
            {task.points}
          </span>
        </div>
      </div>

      <div
        className={[
          "absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r opacity-40",
          color.gradient,
        ].join(" ")}
      />
    </button>
  );
}
