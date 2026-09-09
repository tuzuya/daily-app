"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task } from "@/types/task";
import { today } from "./local-date";

/**
 * 日跨ぎの仕分けが必要かを調べる。
 *
 * **日付が変わって最初にアプリを開いたときだけ**発火させたいので、
 * 「前日以前の Today に未達成のタスクが残っているか」をサーバーに聞く。
 * ローカルに最終起動日を持つ方式は、端末を変えると破綻する。
 */
export function useDaybreak() {
  const [pending, setPending] = useState<Task[] | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const dismiss = useCallback(() => setPending([]), []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/daybreak?today=${today()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setPending(Array.isArray(data.tasks) ? (data.tasks as Task[]) : []);
      })
      .catch(() => {
        // 取れなければ仕分けを出さない。通常の Today を優先する
        if (!cancelled) setPending([]);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return {
    /** null = 判定中 */
    pending,
    needsTriage: pending !== null && pending.length > 0,
    reload,
    dismiss,
  };
}
