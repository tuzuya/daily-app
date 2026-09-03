"use client";

import { useEffect, useState, useMemo } from "react";
import type { Task, TaskCategory } from "@/types/task";

const CATEGORIES: { key: TaskCategory; label: string; color: string }[] = [
  { key: "routine", label: "Routine", color: "#f59e0b" },
  { key: "health", label: "Health", color: "#10b981" },
  { key: "physical", label: "Physical", color: "#3b82f6" },
  { key: "knowledge", label: "Knowledge", color: "#8b5cf6" },
  { key: "activity", label: "Activity", color: "#84cc16" },
  { key: "creative", label: "Creative", color: "#ec4899" },
];

const VERTEX_COUNT = 6;
const CX = 150;
const CY = 150;
const RADIUS = 110;
const GRID_STEPS = [0.25, 0.5, 0.75, 1.0];

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  index: number,
): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / VERTEX_COUNT - Math.PI / 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function hexagonPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: VERTEX_COUNT })
    .map((_, i) => {
      const p = polarToCartesian(cx, cy, r, i);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}

function statusPolygonPoints(
  cx: number,
  cy: number,
  maxR: number,
  ratios: number[],
): string {
  return ratios
    .map((ratio, i) => {
      const clamped = Math.max(0, Math.min(1, ratio));
      const r = maxR * Math.max(clamped, 0.03);
      const p = polarToCartesian(cx, cy, r, i);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}

type Props = {
  maxValue?: number;
};

export default function HexagonStatus({ maxValue = 1000 }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data && Array.isArray(data.tasks)) {
          setTasks(data.tasks as Task[]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryStats = useMemo(() => {
    const doneTasks = tasks.filter((t) => t.done);
    return CATEGORIES.map(({ key }) => {
      const total = doneTasks
        .filter((t) => t.category === key)
        .reduce((sum, t) => sum + t.points, 0);
      return { category: key, total, ratio: total / maxValue };
    });
  }, [tasks, maxValue]);

  const ratios = categoryStats.map((s) => s.ratio);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-[320px] aspect-square">
        <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-lg">
          <defs>
            <radialGradient id="hex-status-fill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(139,92,246,0.45)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0.25)" />
            </radialGradient>
            <filter id="hex-glow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            </filter>
          </defs>

          {GRID_STEPS.map((step) => (
            <polygon
              key={step}
              points={hexagonPoints(CX, CY, RADIUS * step)}
              fill="none"
              stroke="rgba(148,163,184,0.12)"
              strokeWidth={step === 1 ? 1.5 : 0.8}
            />
          ))}

          {CATEGORIES.map((_, i) => {
            const p = polarToCartesian(CX, CY, RADIUS, i);
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={p.x}
                y2={p.y}
                stroke="rgba(148,163,184,0.08)"
                strokeWidth="0.8"
              />
            );
          })}

          {!loading && (
            <>
              <polygon
                points={statusPolygonPoints(CX, CY, RADIUS, ratios)}
                fill="url(#hex-status-fill)"
                stroke="rgba(139,92,246,0.6)"
                strokeWidth="2"
                filter="url(#hex-glow)"
                className="opacity-40"
              />
              <polygon
                points={statusPolygonPoints(CX, CY, RADIUS, ratios)}
                fill="url(#hex-status-fill)"
                stroke="rgba(139,92,246,0.8)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </>
          )}

          {CATEGORIES.map((cat, i) => {
            const labelR = RADIUS + 24;
            const p = polarToCartesian(CX, CY, labelR, i);
            const dotP = polarToCartesian(CX, CY, RADIUS + 8, i);
            return (
              <g key={cat.key}>
                <circle
                  cx={dotP.x}
                  cy={dotP.y}
                  r="3"
                  fill={cat.color}
                  opacity="0.9"
                />
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-slate-300 text-[9px] font-semibold tracking-wide"
                >
                  {cat.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Category detail cards */}
      <div className="w-full grid grid-cols-2 gap-2.5 px-1">
        {categoryStats.map((stat, i) => {
          const cat = CATEGORIES[i];
          const pct = Math.min(stat.ratio * 100, 100);
          return (
            <div
              key={cat.key}
              className="relative overflow-hidden rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
                  {cat.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-100 tabular-nums">
                  {stat.total}
                </span>
                <span className="text-[0.6rem] text-slate-500">
                  / {maxValue}
                </span>
              </div>
              <div className="mt-1.5 h-1 w-full rounded-full bg-white/6 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: cat.color,
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
