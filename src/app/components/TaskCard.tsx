"use client";

import type { Task } from "@/types/task";

const CATEGORY_COLORS: Record<string, { gradient: string; border: string }> = {
  skill: {
    gradient: "from-violet-400/80 to-fuchsia-500/80",
    border: "border-violet-400/25",
  },
  study: {
    gradient: "from-sky-400/80 to-blue-500/80",
    border: "border-sky-400/25",
  },
  health: {
    gradient: "from-emerald-400/80 to-teal-500/80",
    border: "border-emerald-400/25",
  },
  routine: {
    gradient: "from-amber-400/80 to-orange-500/80",
    border: "border-amber-400/25",
  },
  creative: {
    gradient: "from-pink-400/80 to-rose-500/80",
    border: "border-pink-400/25",
  },
};

const DEFAULT_COLOR = {
  gradient: "from-slate-400/80 to-slate-500/80",
  border: "border-slate-400/25",
};

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category.toLowerCase()] ?? DEFAULT_COLOR;
}

function formatDeadline(deadline?: string): string | null {
  if (!deadline) return null;
  const d = new Date(deadline + "T00:00:00");
  const now = new Date();
  const diff = Math.ceil(
    (d.getTime() - now.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${diff}d left`;
}

export type TaskCardProps = {
  task: Task;
  onPress?: (task: Task) => void;
};

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const deadlineText = formatDeadline(task.deadline);
  const color = getCategoryColor(task.category);

  return (
    <button
      type="button"
      onClick={() => onPress?.(task)}
      className={[
        "group relative aspect-square w-full overflow-hidden rounded-[20px] border text-left",
        "bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        "transition-all duration-300 ease-out",
        "hover:bg-white/[0.1] hover:shadow-[0_12px_40px_rgba(100,60,180,0.25)] hover:scale-[1.015]",
        "active:scale-[0.98]",
        color.border,
      ].join(" ")}
    >
      {/* Hover shimmer */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-[1px] rounded-[20px] bg-gradient-to-br from-white/10 via-transparent to-purple-400/10" />
      </div>

      <div className="relative flex h-full flex-col justify-between p-4">
        {/* Top: thumbnail + category */}
        <div className="flex items-start justify-between">
          <div
            className={[
              "relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full",
              "bg-gradient-to-br shadow-lg shadow-purple-900/40",
              color.gradient,
            ].join(" ")}
          >
            {task.imageUrl ? (
              <img
                src={task.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/90">
                {task.title.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />
          </div>

          <span
            className={[
              "rounded-full bg-gradient-to-r px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-white shadow-sm",
              color.gradient,
            ].join(" ")}
          >
            {task.category}
          </span>
        </div>

        {/* Middle: title */}
        <p className="text-[0.9rem] font-medium leading-snug text-slate-50 line-clamp-3">
          {task.title}
        </p>

        {/* Bottom: deadline + points */}
        <div className="flex items-end justify-between">
          {deadlineText ? (
            <div className="flex items-center gap-1 text-[0.65rem] text-slate-400">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3 w-3 text-slate-500"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                  clipRule="evenodd"
                />
              </svg>
              {deadlineText}
            </div>
          ) : (
            <span />
          )}

          <span className="flex items-center gap-1 text-[0.7rem] font-semibold text-amber-300/90">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3 w-3"
            >
              <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 13.28l-4.77 2.51.91-5.33L2.27 6.69l5.34-.78L10 1z" />
            </svg>
            {task.points}
          </span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className={[
          "absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r opacity-40",
          color.gradient,
        ].join(" ")}
      />
    </button>
  );
}
