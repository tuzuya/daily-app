"use client";

import type { Task } from "@/types/task";

const CATEGORY_GRADIENTS: Record<string, string> = {
  skill: "from-violet-600/60 via-purple-500/40 to-fuchsia-500/30",
  study: "from-sky-600/60 via-blue-500/40 to-indigo-500/30",
  health: "from-emerald-600/60 via-teal-500/40 to-cyan-600/30",
  routine: "from-amber-600/60 via-orange-500/40 to-yellow-500/30",
  creative: "from-pink-600/60 via-rose-500/40 to-red-500/30",
};

const CATEGORY_ACCENTS: Record<string, string> = {
  skill: "text-violet-300",
  study: "text-sky-300",
  health: "text-emerald-300",
  routine: "text-amber-300",
  creative: "text-pink-300",
};

const DEFAULT_GRADIENT = "from-slate-600/60 via-slate-500/40 to-slate-400/30";
const DEFAULT_ACCENT = "text-slate-300";

function Starburst({ className }: { className?: string }) {
  const lines = 18;
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {Array.from({ length: lines }).map((_, i) => {
        const angle = (360 / lines) * i;
        const rad = (angle * Math.PI) / 180;
        const x2 = 50 + Math.cos(rad) * 44;
        const y2 = 50 + Math.sin(rad) * 44;
        return (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity={0.5 + (i % 3) * 0.15}
          />
        );
      })}
    </svg>
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatEstimate(min?: number): string | null {
  if (!min) return null;
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export type TaskCardDetailProps = {
  task: Task;
  onClose?: () => void;
};

export default function TaskCardDetail({ task, onClose }: TaskCardDetailProps) {
  const estimate = formatEstimate(task.estimatedMinutes);

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
      {/* Gradient background with aurora blobs */}
      <div className="absolute inset-0 bg-slate-950/80" />
      <div
        className={[
          "absolute inset-0 bg-gradient-to-br opacity-70",
          CATEGORY_GRADIENTS[task.category.toLowerCase()] ?? DEFAULT_GRADIENT,
        ].join(" ")}
      />
      <div className="pointer-events-none absolute -top-[30%] -left-[20%] h-[70%] w-[70%] rounded-full bg-purple-500/25 blur-[40px]" />
      <div className="pointer-events-none absolute -bottom-[20%] -right-[20%] h-[60%] w-[60%] rounded-full bg-blue-500/20 blur-[40px]" />

      {/* Starburst decoration */}
      <Starburst className="pointer-events-none absolute top-8 right-6 h-24 w-24 text-white/30" />

      <div className="relative z-10 flex flex-col gap-5 p-6 pt-7">
        {/* Header: type label + close */}
        <div className="flex items-start justify-between">
          <span
            className={[
              "text-sm font-bold uppercase tracking-widest",
              CATEGORY_ACCENTS[task.category.toLowerCase()] ?? DEFAULT_ACCENT,
            ].join(" ")}
          >
            {task.category}
          </span>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>

        {/* Image area */}
        {task.imageUrl && (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <img
              src={task.imageUrl}
              alt=""
              className="h-44 w-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h2 className="text-[1.65rem] font-bold leading-tight tracking-tight text-white">
          {task.title}
        </h2>

        {/* Description */}
        {task.description && (
          <p className="text-sm leading-relaxed text-slate-300/90">
            {task.description}
          </p>
        )}

        {/* Meta info grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Points */}
          <MetaChip
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-amber-300">
                <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 13.28l-4.77 2.51.91-5.33L2.27 6.69l5.34-.78L10 1z" />
              </svg>
            }
            label="Points"
            value={String(task.points)}
          />

          {/* Deadline */}
          {task.deadline && (
            <MetaChip
              icon={
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-slate-400">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              label="Deadline"
              value={task.deadline}
            />
          )}

          {/* Estimated time */}
          {estimate && (
            <MetaChip
              icon={
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-purple-300">
                  <path
                    fillRule="evenodd"
                    d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.39 6.342a.75.75 0 01.948.474l1.5 4.5a.75.75 0 01-.474.948l-4.5 1.5a.75.75 0 01-.474-.948l1.5-4.5a.75.75 0 01.474-.474l1.026-.5z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              label="Estimate"
              value={estimate}
            />
          )}

          {/* Created */}
          <MetaChip
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-slate-400">
                <path
                  fillRule="evenodd"
                  d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                  clipRule="evenodd"
                />
              </svg>
            }
            label="Created"
            value={formatDate(task.createdAt)}
          />
        </div>

        {/* Done badge */}
        {task.done && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-300">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
            Completed
          </div>
        )}
      </div>
    </div>
  );
}

function MetaChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2.5 backdrop-blur-sm">
      {icon}
      <div className="min-w-0">
        <p className="text-[0.6rem] uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="truncate text-xs font-medium text-slate-200">{value}</p>
      </div>
    </div>
  );
}
