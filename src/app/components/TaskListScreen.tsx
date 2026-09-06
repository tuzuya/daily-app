"use client";

import { useMemo, useState } from "react";
import type { Task, TaskCategory, TaskScreen } from "@/types/task";
import { CATEGORY_DESIGNS } from "@/lib/task-design";
import { categorySpriteUrl } from "@/lib/pixel-sprites";
import { moveTaskToToday, useTasks } from "@/lib/use-tasks";
import CardRow from "./CardRow";
import StateBlock from "./StateBlock";

/**
 * Next / Overdue / Buffs で共通の一覧画面（docs/pixel-style-guide.md §9.2）。
 * レイアウトは同一で、変えるのは eyebrow の色・見出し・操作の文言だけ（§9.4）。
 *
 * カテゴリタブは**アイコンのみ**。390px を5等分すると1枠78pxだが、
 * Silkscreen の "INTELLIGENCE" は約84pxあり文字が入らない。
 */

/**
 * 行の下段に何を出すか。
 * **関数を渡さない。** ページはサーバーコンポーネントなので、
 * クライアントコンポーネントへ関数を渡すとビルドが落ちる。
 */
export type MetaKind = "estimate" | "elapsed" | "none";

export type TaskListScreenProps = {
  screen: TaskScreen;
  eyebrow: string;
  eyebrowTone: "gold" | "danger";
  title: string;
  hint: string;
  meta?: MetaKind;
};

/** 何日前か。日付はローカル基準で扱う（docs/ai-dev-guide.md §8.2） */
function elapsedLabel(createdAt: number): string {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round(
    (startOfDay(new Date()) - startOfDay(new Date(createdAt))) / 86400000,
  );
  if (diff <= 0) return "きょう";
  if (diff === 1) return "きのう";
  if (diff < 7) return `${diff}日前`;
  if (diff < 30) return `${Math.floor(diff / 7)}週間前`;
  return `${Math.floor(diff / 30)}か月前`;
}

function metaLabel(task: Task, kind: MetaKind): string | undefined {
  if (kind === "elapsed") return elapsedLabel(task.createdAt);
  if (kind === "estimate") {
    return task.estimatedMinutes ? `${task.estimatedMinutes}分` : undefined;
  }
  return undefined;
}

type Filter = TaskCategory | "all";

export default function TaskListScreen({
  screen,
  eyebrow,
  eyebrowTone,
  title,
  hint,
  meta = "none",
}: TaskListScreenProps) {
  const { tasks, loading, error, refetch, removeLocal } = useTasks(screen);
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const shown = useMemo(
    () => (filter === "all" ? tasks : tasks.filter((t) => t.category === filter)),
    [tasks, filter],
  );

  const send = async (task: Task) => {
    setBusyId(task.id);
    removeLocal(task.id);
    try {
      await moveTaskToToday(task.id);
    } catch {
      refetch();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[390px] px-[18px] pb-6 pt-[52px]">
      <header className="mb-4">
        <p
          className={[
            "font-label text-[10px]",
            eyebrowTone === "danger" ? "text-danger" : "text-gold",
          ].join(" ")}
        >
          {eyebrow}
        </p>
        <h1 className="mt-2 text-[17px] leading-[26px] text-ink">{title}</h1>
        <p className="mt-1 text-[11px] text-ink-muted">{hint}</p>
      </header>

      {/* カテゴリタブ。文字が入らないのでアイコンのみ */}
      <div className="mb-4 flex gap-[6px]">
        <button
          type="button"
          onClick={() => setFilter("all")}
          aria-pressed={filter === "all"}
          className={[
            "font-label h-[54px] w-[54px] border-[3px] border-ink-outline text-[8px]",
            filter === "all"
              ? "bg-gold text-ink-inverse"
              : "bg-panel-raised text-ink-muted",
          ].join(" ")}
        >
          ALL
        </button>
        {CATEGORY_DESIGNS.map((c) => {
          const active = filter === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              aria-pressed={active}
              aria-label={c.label}
              className={[
                "grid h-[54px] w-[54px] place-items-center border-[3px] border-ink-outline",
                active ? "bg-gold" : "bg-panel-raised",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 30,
                  backgroundImage: categorySpriteUrl(
                    c.key,
                    active ? "#14100a" : c.hex,
                    3,
                  ),
                  backgroundRepeat: "no-repeat",
                }}
              />
            </button>
          );
        })}
      </div>

      {loading && <StateBlock kind="loading" />}
      {!loading && error && <StateBlock kind="error" onRetry={refetch} />}

      {!loading && !error && shown.length === 0 && (
        <StateBlock
          kind="empty"
          title={
            filter === "all" ? "まだ なにもない" : "このカテゴリは からっぽ"
          }
          sub={
            filter === "all"
              ? "＋ から クエストを ついかしよう"
              : "ほかの カテゴリを みてみよう"
          }
        />
      )}

      {!loading && !error && shown.length > 0 && (
        <ul className="flex flex-col gap-3">
          {shown.map((task) => (
            <li key={task.id} className={busyId === task.id ? "opacity-50" : ""}>
              <CardRow
                task={task}
                meta={metaLabel(task, meta)}
                onPress={() => send(task)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
