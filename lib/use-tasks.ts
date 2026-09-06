"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task, TaskScreen } from "@/types/task";

/**
 * 画面ごとのタスク取得。旧 `SpaceNavigator.useTasksForScreen` を移設したもの。
 *
 * 旧実装との違い:
 * - **エラーを握りつぶさない。** 旧実装は fetch 失敗を `setTasks([])` にして
 *   いたため、通信エラーと0件が区別できなかった（画面は「タスクなし」に見える）
 * - `loading` を呼び出し側へ返す。旧実装は返してはいたが捨てられていた
 */

export type TasksState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** 楽観的に取り除く（サーバー反映後に呼び出し側が refetch する想定） */
  removeLocal: (id: string) => void;
};

export function useTasks(screen: TaskScreen): TasksState {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  const removeLocal = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/tasks?screen=${screen}`)
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
        // 0件と区別できるよう、エラーは必ず error に入れる
        setError(e instanceof Error ? e.message : "読み込みに失敗しました");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [screen, nonce]);

  return { tasks, loading, error, refetch, removeLocal };
}

/** タスクを Today へ移す。旧 `SpaceNavigator.moveToToday` の中身。 */
export async function moveTaskToToday(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ screen: "today" }),
  });
  if (!res.ok) throw new Error("Today への移動に失敗しました");
}

/** タスクを削除する。API は前からあったが UI から呼ばれていなかった。 */
export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("削除に失敗しました");
}

/** 達成にする。カードを下にドラッグしたときに呼ぶ。 */
export async function completeTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done: true }),
  });
  if (!res.ok) throw new Error("達成の記録に失敗しました");
}
