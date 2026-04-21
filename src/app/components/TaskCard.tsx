"use client";

import { useId } from "react";
import type { Task } from "@/types/task";

// Tailwind クラス用（サムネイル・バッジの色）
const CATEGORY_COLORS: Record<string, { gradient: string }> = {
  routine:   { gradient: "from-amber-400/80 to-orange-500/80" },
  health:    { gradient: "from-emerald-400/80 to-teal-500/80" },
  physical:  { gradient: "from-blue-400/80 to-indigo-500/80" },
  knowledge: { gradient: "from-violet-400/80 to-purple-500/80" },
  activity:  { gradient: "from-lime-400/80 to-green-500/80" },
  creative:  { gradient: "from-pink-400/80 to-rose-500/80" },
};
const DEFAULT_COLOR = { gradient: "from-slate-400/80 to-slate-500/80" };

// SVG 用（カードシェイプの stroke + グラデーション）
const CATEGORY_SVG: Record<string, { stroke: string; glow: string }> = {
  routine:   { stroke: "rgba(251,191,36,0.5)",   glow: "rgba(251,191,36,0.2)"  },
  health:    { stroke: "rgba(52,211,153,0.5)",   glow: "rgba(52,211,153,0.2)"  },
  physical:  { stroke: "rgba(96,165,250,0.5)",   glow: "rgba(96,165,250,0.2)"  },
  knowledge: { stroke: "rgba(167,139,250,0.5)",  glow: "rgba(167,139,250,0.2)" },
  activity:  { stroke: "rgba(163,230,53,0.5)",   glow: "rgba(163,230,53,0.2)"  },
  creative:  { stroke: "rgba(244,114,182,0.5)",  glow: "rgba(244,114,182,0.2)" },
};
const DEFAULT_SVG = { stroke: "rgba(148,163,184,0.5)", glow: "rgba(148,163,184,0.2)" };

const CATEGORY_IMAGES: Record<string, string> = {
  routine:   "/task-images/routine.png",
  health:    "/task-images/health.png",
  physical:  "/task-images/physical.png",
  knowledge: "/task-images/knowledge.png",
  activity:  "/task-images/activity.png",
  creative:  "/task-images/creative.png",
};

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category.toLowerCase()] ?? DEFAULT_COLOR;
}
function getSvgColor(category: string) {
  return CATEGORY_SVG[category.toLowerCase()] ?? DEFAULT_SVG;
}

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

/**
 * 凹辺カードシェイプ (viewBox 0 0 100 133 = 3:4 比)
 *
 * 角は完全に尖らせ (0,0) / (100,0) / (100,133) / (0,133) に配置。
 * 各辺は 3次ベジェで内側へ緩やかに凹む（中点で約 6px 凹む）。
 *
 *   top    : (0,0)→(100,0)   CP:(33,8)(67,8)    → 中点が y≈6 まで凹む
 *   right  : (100,0)→(100,133) CP:(92,44)(92,89) → 中点が x≈94 まで凹む
 *   bottom : (100,133)→(0,133) CP:(67,125)(33,125)→ 中点が y≈127 まで凹む
 *   left   : (0,133)→(0,0)   CP:(8,89)(8,44)    → 中点が x≈6 まで凹む
 */
const CARD_SHAPE =
  "M 0,0 C 33,8 67,8 100,0 C 92,44 92,89 100,133 C 67,125 33,125 0,133 C 8,89 8,44 0,0 Z";

export type TaskCardProps = {
  task: Task;
  onPress?: (task: Task) => void;
};

export default function TaskCard({ task, onPress }: TaskCardProps) {
  // 複数カードが同時にある場合の ID 衝突を防ぐ
  const uid = useId().replace(/:/g, "");
  const gradId = `card-grad-${uid}`;

  const color    = getCategoryColor(task.category);
  const svgColor = getSvgColor(task.category);
  const categoryKey = task.category.toLowerCase();
  const imageSrc    = CATEGORY_IMAGES[categoryKey];
  const taskTimeText = formatTaskTime(task.estimatedMinutes);

  return (
    <button
      type="button"
      onClick={() => onPress?.(task)}
      className="group relative aspect-[3/4] w-full cursor-pointer text-left transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]"
      style={{
        // drop-shadow はシェイプ（SVG パス）の輪郭に沿って落ちる
        filter: "drop-shadow(0 5px 18px rgba(0,0,0,0.55))",
      }}
    >
      {/* ── SVG: カード背景（凹辺シェイプ） ───────────────────────── */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 133"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/* カテゴリカラーのグラデーション（下から上へ淡く） */}
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor={svgColor.glow} />
            <stop offset="70%"  stopColor="rgba(20,10,40,0)" />
          </linearGradient>
        </defs>

        {/* ① ベース（暗いガラス面） */}
        <path d={CARD_SHAPE} fill="rgba(12,6,28,0.80)" />

        {/* ② カテゴリグラデーション */}
        <path d={CARD_SHAPE} fill={`url(#${gradId})`} />

        {/* ③ ホバー時の白ハイライト */}
        <path
          d={CARD_SHAPE}
          fill="rgba(255,255,255,0.07)"
          className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* ④ カテゴリカラーの輪郭線 */}
        <path
          d={CARD_SHAPE}
          fill="none"
          stroke={svgColor.stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* ⑤ ホバー時に輪郭線を強調 */}
        <path
          d={CARD_SHAPE}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </svg>

      {/* ── カードコンテンツ ──────────────────────────────────────── */}
      {/* absolute inset-0: aspect-ratio 由来の親高さは h-full で参照できない場合があるため */}
      <div className="absolute inset-0 flex flex-col justify-between p-2.5">
        {/* 上: サムネイル + カテゴリバッジ */}
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

        {/* 中: タイトル */}
        <p className="text-[0.7rem] font-medium leading-snug text-slate-50 line-clamp-3">
          {task.title}
        </p>

        {/* 下: 所要時間 + ポイント */}
        <div className="flex items-end justify-between">
          {taskTimeText ? (
            <div className="flex items-center gap-1 text-[0.55rem] font-medium text-slate-300/80">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5 text-slate-400">
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
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5">
              <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 13.28l-4.77 2.51.91-5.33L2.27 6.69l5.34-.78L10 1z" />
            </svg>
            {task.points}
          </span>
        </div>
      </div>
    </button>
  );
}
