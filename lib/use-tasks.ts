"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task, TaskCategory, TaskLevel, TaskScreen } from "@/types/task";
import { LEVELS } from "./task-design";

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

type Result =
  | { status: "loading" }
  | { status: "ok"; tasks: Task[] }
  | { status: "error"; message: string };

export function useTasks(screen: TaskScreen): TasksState {
  /* 取得の結果を1つの state にまとめている。
   * loading / tasks / error を別々に持つと、effect の中で3回 setState することになり
   * カスケードレンダーを招く（react-hooks/set-state-in-effect）。 */
  const [result, setResult] = useState<Result>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  const removeLocal = useCallback((id: string) => {
    setResult((prev) =>
      prev.status === "ok"
        ? { status: "ok", tasks: prev.tasks.filter((t) => t.id !== id) }
        : prev,
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/tasks?screen=${screen}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setResult({
          status: "ok",
          tasks: Array.isArray(data?.tasks) ? (data.tasks as Task[]) : [],
        });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // 0件と区別できるよう、エラーは必ず error として持つ
        setResult({
          status: "error",
          message: e instanceof Error ? e.message : "読み込みに失敗しました",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [screen, nonce]);

  return {
    tasks: result.status === "ok" ? result.tasks : [],
    loading: result.status === "loading",
    error: result.status === "error" ? result.message : null,
    refetch,
    removeLocal,
  };
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

/** フォームの入力を API の形へ。難易度 → points の変換はここ1箇所に持つ */
export type TaskInput = {
  title: string;
  description: string;
  category: TaskCategory;
  level: TaskLevel;
  hours: number;
  minutes: number;
};

function toPayload(v: TaskInput) {
  const points = LEVELS.find((l) => l.value === v.level)?.points ?? 10;
  const estimated = v.hours * 60 + v.minutes;
  return {
    title: v.title.trim(),
    description: v.description.trim() || null,
    category: v.category,
    points,
    estimatedMinutes: estimated > 0 ? estimated : null,
  };
}

export async function createTask(
  v: TaskInput,
  screen: TaskScreen,
): Promise<Task> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...toPayload(v), screen }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "追加に失敗しました");
  }
  return (await res.json()).task as Task;
}

export async function updateTask(id: string, v: TaskInput): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(v)),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "保存に失敗しました");
  }
  return (await res.json()).task as Task;
}
