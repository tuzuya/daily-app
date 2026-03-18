"use client";

import { useMemo, useRef, useState } from "react";
import type { TaskCategory, TaskScreen } from "@/types/task";

type Level = "easy" | "normal" | "hard" | "extra";

const LEVELS: { value: Level; label: string; points: number }[] = [
  { value: "easy", label: "Easy", points: 5 },
  { value: "normal", label: "Normal", points: 10 },
  { value: "hard", label: "Hard", points: 20 },
  { value: "extra", label: "Extra", points: 30 },
];

const CATEGORY_GRADIENTS: Record<string, string> = {
  routine: "from-amber-600/60 via-orange-500/40 to-yellow-500/30",
  health: "from-emerald-600/60 via-teal-500/40 to-cyan-600/30",
  physical: "from-blue-600/60 via-indigo-500/40 to-violet-500/30",
  knowledge: "from-violet-600/60 via-purple-500/40 to-fuchsia-500/30",
  activity: "from-lime-600/60 via-green-500/40 to-emerald-500/30",
  creative: "from-pink-600/60 via-rose-500/40 to-red-500/30",
};

const CATEGORY_ACCENTS: Record<string, string> = {
  routine: "text-amber-300",
  health: "text-emerald-300",
  physical: "text-blue-300",
  knowledge: "text-violet-300",
  activity: "text-lime-300",
  creative: "text-pink-300",
};

const DEFAULT_GRADIENT = "from-slate-600/60 via-slate-500/40 to-slate-400/30";
const DEFAULT_ACCENT = "text-slate-300";

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: "routine", label: "ルーティン" },
  { value: "health", label: "健康" },
  { value: "physical", label: "体" },
  { value: "knowledge", label: "学び" },
  { value: "activity", label: "活動" },
  { value: "creative", label: "創作" },
];

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

function formatEstimate(min?: number): string | null {
  if (!min) return null;
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function taskTimeToMinutes(t: { d: number; h: number; m: number }): number {
  const d = Math.max(0, Math.min(3, Math.trunc(t.d)));
  const h = Math.max(0, Math.min(24, Math.trunc(t.h)));
  const m = Math.max(0, Math.min(60, Math.trunc(t.m)));
  return d * 24 * 60 + h * 60 + m;
}

function formatTaskTime(t: { d: number; h: number; m: number }): string {
  const parts: string[] = [];
  if (t.d) parts.push(`${t.d}d`);
  if (t.h) parts.push(`${t.h}h`);
  if (t.m) parts.push(`${t.m}m`);
  return parts.length ? parts.join(" ") : "0m";
}

function MetaChip({
  icon,
  label,
  value,
  right,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/[0.06] px-3 py-2.5 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {icon}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[0.6rem] uppercase tracking-wider text-slate-500">
              {label}
            </p>
            {right}
          </div>
          <p className="truncate text-xs font-medium text-slate-200">{value}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_38px] items-center gap-2">
      <div className="min-w-0">
        <span className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="h-2 w-full cursor-pointer accent-white/80"
        />
      </div>
      <span className="text-right text-xs font-semibold text-slate-200">
        {value}
      </span>
    </div>
  );
}

export type TaskCardCreateProps = {
  screen: TaskScreen;
  onClose: () => void;
  onCreated: () => void;
};

export default function TaskCardCreate({
  screen,
  onClose,
  onCreated,
}: TaskCardCreateProps) {
  const [category, setCategory] = useState<TaskCategory>("routine");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<Level>("normal");
  const points = useMemo(
    () => LEVELS.find((l) => l.value === level)?.points ?? 0,
    [level],
  );
  const [taskTime, setTaskTime] = useState({ d: 0, h: 0, m: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);

  const estimate = formatEstimate(taskTimeToMinutes(taskTime) || undefined);

  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-[26px] border border-white/10 shadow-[0_22px_70px_rgba(0,0,0,0.55)] max-h-[calc(100dvh-12rem)]">
      <div className="absolute inset-0 bg-slate-950/80" />
      <div
        className={[
          "absolute inset-0 bg-gradient-to-br opacity-70",
          CATEGORY_GRADIENTS[category] ?? DEFAULT_GRADIENT,
        ].join(" ")}
      />
      <div className="pointer-events-none absolute -top-[30%] -left-[20%] h-[70%] w-[70%] rounded-full bg-purple-500/25 blur-[40px]" />
      <div className="pointer-events-none absolute -bottom-[20%] -right-[20%] h-[60%] w-[60%] rounded-full bg-blue-500/20 blur-[40px]" />

      <Starburst className="pointer-events-none absolute top-8 right-6 h-24 w-24 text-white/30" />

      <form
        className="relative z-10 flex min-h-0 flex-col"
        onSubmit={async (e) => {
          e.preventDefault();
          const t = title.trim();
          if (!t) {
            setError("タイトルを入力してください");
            titleRef.current?.focus();
            return;
          }
          setSubmitting(true);
          setError(null);
          try {
            const body: Record<string, unknown> = {
              title: t,
              category,
              screen,
              points,
            };
            const minutes = taskTimeToMinutes(taskTime);
            if (minutes > 0) body.estimatedMinutes = minutes;
            if (description.trim()) body.description = description.trim();

            const res = await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            if (!res.ok) {
              const j = await res.json().catch(() => ({}));
              setError(typeof j.error === "string" ? j.error : "保存に失敗しました");
              return;
            }
            onCreated();
            onClose();
          } catch {
            setError("通信に失敗しました");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {/* Header (sticky) */}
        <div className="sticky top-0 z-20 flex items-start justify-between gap-3 bg-slate-950/35 p-5 pt-6 backdrop-blur-xl">
          <div className="space-y-1">
            <span
              className={[
                "text-sm font-bold uppercase tracking-widest",
                CATEGORY_ACCENTS[category] ?? DEFAULT_ACCENT,
              ].join(" ")}
            >
              {category}
            </span>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
              Create
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Scroll area */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 pb-4 pr-4">
          {error && (
            <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-200">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-500">
              Title
            </p>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="やることを入力"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-500">
              Memo
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="任意のメモ"
              className="w-full resize-none rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
          <MetaChip
            icon={
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5 text-white/70"
              >
                <path d="M10 2l2.2 4.6 5.1.7-3.7 3.6.9 5.1L10 13.6 5.5 16l.9-5.1L2.7 7.3l5.1-.7L10 2z" />
              </svg>
            }
            label="Level"
            value={LEVELS.find((l) => l.value === level)?.label ?? "—"}
            right={
              <span className="text-[10px] font-semibold text-slate-400">
                {points}pt
              </span>
            }
          >
            <div className="mt-2 flex flex-wrap gap-2">
              {LEVELS.map((l) => {
                const active = l.value === level;
                return (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setLevel(l.value)}
                    className={[
                      "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                      active
                        ? "border-white/25 bg-white/15 text-white"
                        : "border-white/12 bg-white/[0.06] text-slate-200 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </MetaChip>

          <MetaChip
            icon={
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5 text-slate-300"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                  clipRule="evenodd"
                />
              </svg>
            }
            label="Task time"
            value={estimate ?? "—"}
            right={
              <span className="text-[10px] font-semibold text-slate-400">
                {formatTaskTime(taskTime)}
              </span>
            }
          >
            <div className="mt-2 space-y-2">
              <SliderRow
                label="Days"
                value={taskTime.d}
                min={0}
                max={3}
                onChange={(v) => setTaskTime((t) => ({ ...t, d: v }))}
              />
              <SliderRow
                label="Hours"
                value={taskTime.h}
                min={0}
                max={24}
                onChange={(v) => setTaskTime((t) => ({ ...t, h: v }))}
              />
              <SliderRow
                label="Min"
                value={taskTime.m}
                min={0}
                max={60}
                onChange={(v) => setTaskTime((t) => ({ ...t, m: v }))}
              />
            </div>
          </MetaChip>
        </div>

        <MetaChip
          icon={
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 text-slate-300"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm8-8a8 8 0 01-8 8V2a8 8 0 018 8z"
                clipRule="evenodd"
              />
            </svg>
          }
          label="Category"
          value={CATEGORIES.find((c) => c.value === category)?.label ?? category}
        >
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = c.value === category;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                    active
                      ? "border-white/25 bg-white/15 text-white"
                      : "border-white/12 bg-white/[0.06] text-slate-200 hover:bg-white/10",
                  ].join(" ")}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </MetaChip>

        </div>

        {/* Footer (sticky) */}
        <div className="sticky bottom-0 z-20 bg-slate-950/35 p-5 pt-3 backdrop-blur-xl">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-white/95 disabled:opacity-60"
          >
            {submitting ? "保存中…" : "Create task"}
          </button>
        </div>
      </form>
    </div>
  );
}

