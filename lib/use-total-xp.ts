"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task } from "@/types/task";

/**
 * 完了タスクのポイント合計。LV と EXP ゲージの供給元。
 *
 * `users` テーブルを持たない方針が固まるまでの暫定
 * （docs/ai-product-brief.md §7.1 c）。集計で出しているので、
 * 後で users に持たせても呼び出し側は変えずに済む。
 */
export function useTotalXp() {
  const [totalXp, setTotalXp] = useState(0);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  /** 達成した瞬間に手応えを返す。サーバー反映は reload で追いつく */
  const add = useCallback((points: number) => {
    setTotalXp((v) => v + points);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tasks?includeDone=1")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const done = (data.tasks as Task[]).filter((t) => t.done);
        setTotalXp(done.reduce((sum, t) => sum + t.points, 0));
      })
      .catch(() => {
        // XP は表示用。取れなくても操作は妨げない
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return { totalXp, add, reload };
}
