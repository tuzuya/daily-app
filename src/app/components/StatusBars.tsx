"use client";

import { useEffect, useMemo, useState } from "react";
import type { Task } from "@/types/task";
import { CATEGORY_DESIGNS } from "@/lib/task-design";

/**
 * カテゴリ別の獲得ポイントを、RPG の分割ブロックのバーで表示する。
 * 旧 `HexagonStatus`（六角形レーダー）の置き換え。
 *
 * レーダーチャートを使わない理由（docs/pixel-style-guide.md §9.8）:
 * 1. 五角形は頂点が72°で、45°でも90°でもない。階段が不規則になる
 * 2. レーダーはモダンUIの語彙で、ピクセルRPGに属さない
 * 3. 正確な値が読める
 */

const SEGMENTS = 10;
const FULL = 700; // バーが満タンになる目安

export type StatusBarsProps = {
  /** 未指定なら API から取りに行く */
  tasks?: Task[];
};

export default function StatusBars({ tasks: given }: StatusBarsProps) {
  const [tasks, setTasks] = useState<Task[]>(given ?? []);
  const [loading, setLoading] = useState(given === undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (given !== undefined) return;
    let cancelled = false;

    // 集計には達成済みが要るので includeDone を付ける
    fetch("/api/tasks?includeDone=1")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setTasks(Array.isArray(data?.tasks) ? (data.tasks as Task[]) : []);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "読み込みに失敗しました");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [given]);

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.done);
    return CATEGORY_DESIGNS.map((c) => {
      const total = done
        .filter((t) => t.category === c.key)
        .reduce((sum, t) => sum + t.points, 0);
      return {
        ...c,
        total,
        filled: Math.min(SEGMENTS, Math.round((total / FULL) * SEGMENTS)),
      };
    });
  }, [tasks]);

  if (error) {
    return (
      <p className="border-[3px] border-danger bg-panel p-3 text-[11px] text-danger">
        ステータスを よみこめませんでした
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-[6px]">
      {stats.map((s) => (
        <li key={s.key} className="flex items-center gap-3">
          <span className="font-label w-[102px] shrink-0 text-[8px] text-ink-muted">
            {s.label}
          </span>

          <span className="flex gap-[3px] border-[3px] border-ink-outline bg-panel p-[3px]">
            {Array.from({ length: SEGMENTS }).map((_, i) => (
              <span
                key={i}
                className="block h-[18px] w-[15px]"
                style={{
                  background:
                    !loading && i < s.filled ? s.hex : "var(--ink-outline)",
                }}
              />
            ))}
          </span>

          <span className="font-num flex-1 text-right text-[10px] tabular-nums text-ink">
            {loading ? "—" : s.total}
          </span>
        </li>
      ))}
    </ul>
  );
}
