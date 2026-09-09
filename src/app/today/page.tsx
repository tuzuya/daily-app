"use client";

import { useCallback, useState } from "react";
import type { Task } from "@/types/task";
import {
  completeTask,
  createTask,
  deleteTask,
  updateTask,
  useTasks,
  type TaskInput,
} from "@/lib/use-tasks";
import TaskCarousel from "../components/TaskCarousel";
import DropSlot from "../components/DropSlot";
import StateBlock from "../components/StateBlock";
import QuestClearFx from "../components/QuestClearFx";
import TopBar from "../components/TopBar";
import TaskFormOverlay from "../components/TaskFormOverlay";
import { useTotalXp } from "@/lib/use-total-xp";
import { useDaybreak } from "@/lib/use-daybreak";
import DaybreakOverlay from "../components/DaybreakOverlay";

/**
 * HOME。当日のタスクを扇状のカルーセルで見せ、
 * **カードを下に引っ張って達成**する（docs/pixel-style-guide.md §10.2）。
 *
 * 旧構造では SpaceNavigator が全画面の描画を持っていたが、
 * いまは各 page.tsx が自分の画面を描画する（docs/ai-dev-guide.md §5.1）。
 */
export default function TodayPage() {
  const { tasks, loading, error, refetch, removeLocal } = useTasks("today");
  const { totalXp, add: addXp, reload: reloadXp } = useTotalXp();
  /* 日付が変わって最初に開いたときだけ、前日の残りの仕分けを出す（§4.6） */
  const { pending, needsTriage, dismiss } = useDaybreak();

  const [dropProgress, setDropProgress] = useState(0);
  /** 達成エフェクトはルートを持たないオーバーレイ（§5.2） */
  const [cleared, setCleared] = useState<Task | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  /** null = 閉、"new" = 作成、Task = 編集 */
  const [form, setForm] = useState<"new" | Task | null>(null);

  /* 見出しの «DAY N»。初回起動からの日数が出せるまでは日付で代用する。
   * lazy initializer で持つ。effect で setState するとカスケードを招く。
   * 日付はローカル基準（docs/ai-dev-guide.md §8.2）。 */
  const [day] = useState(() => new Date().getDate());

  const handleComplete = useCallback(
    async (task: Task) => {
      // 先に消して手応えを返し、失敗したら取得し直して戻す
      removeLocal(task.id);
      setCleared(task);
      try {
        await completeTask(task.id);
        addXp(task.points);
      } catch {
        refetch();
      }
    },
    [removeLocal, refetch, addXp],
  );

  const submitForm = async (v: TaskInput) => {
    if (form === "new") await createTask(v, "today");
    else if (form) await updateTask(form.id, v);
    setForm(null);
    refetch();
    reloadXp();
  };

  const removeTask = async () => {
    if (!form || form === "new") return;
    await deleteTask(form.id);
    setForm(null);
    refetch();
  };

  const remaining = tasks.length;

  /* 仕分けが先。Today を見せる前に「きのうの のこり」を片付けてもらう */
  if (needsTriage && pending) {
    return (
      <DaybreakOverlay
        tasks={pending}
        onDone={() => {
          dismiss();
          refetch();
        }}
      />
    );
  }

  return (
    <>
      <TopBar totalXp={totalXp} onAdd={() => setForm("new")} />

      <div className="mx-auto flex w-full max-w-[390px] flex-col px-[18px] pb-6">
        <header className="mb-[10px] mt-[30px]">
          <p className="font-label text-[10px] text-gold">
            DAY {day}
          </p>
          {/* 3px ずらした影。ピクセルの見出しはこれで奥行きが出る */}
          <h1 className="relative mt-2 text-[24px] leading-[34px] text-ink">
            <span
              aria-hidden="true"
              className="absolute left-[3px] top-[3px] text-ink-outline"
            >
              今日のクエスト
            </span>
            <span className="relative">今日のクエスト</span>
          </h1>
          {!loading && !error && (
            <p className="mt-1 flex items-center gap-3 text-[14px] text-ink-muted">
              {remaining > 0 && (
                <span className="font-num text-[10px] text-gold">
                  {Math.min(activeIndex + 1, remaining)} / {remaining}
                </span>
              )}
              <span>
                {remaining > 0 ? `のこり ${remaining}つ` : "ぜんぶ おわった"}
              </span>
            </p>
          )}
        </header>

        {loading && <StateBlock kind="loading" />}
        {!loading && error && <StateBlock kind="error" onRetry={refetch} />}

        {!loading && !error && tasks.length === 0 && (
          <StateBlock
            kind="empty"
            title="今日のクエストは ない"
            sub="＋ から ついかするか Next から もってこよう"
          />
        )}

        {!loading && !error && tasks.length > 0 && (
          /*
           * カルーセルとドロップ枠は**重なり順が意味を持つ**ので同じ文脈に置く。
           * カードは枠の「下」に潜り込んで消える必要があるため、
           * 枠側を上（z-10）にする。逆にするとカードが枠の手前を素通りする。
           */
          <div className="relative">
            <div className="relative z-0">
              <TaskCarousel
                tasks={tasks}
                onSelect={(t) => setForm(t)}
                onComplete={handleComplete}
                onDropProgress={setDropProgress}
                onActiveChange={setActiveIndex}
              />
            </div>

            <div className="relative z-10 mt-3">
              <DropSlot progress={dropProgress} />
            </div>
          </div>
        )}
      </div>

      {cleared && (
        <QuestClearFx
          task={cleared}
          xpBefore={totalXp - cleared.points}
          onDismiss={() => setCleared(null)}
        />
      )}

      {form && (
        <TaskFormOverlay
          task={form === "new" ? undefined : form}
          screen="today"
          onClose={() => setForm(null)}
          onSubmit={submitForm}
          onDelete={form === "new" ? undefined : removeTask}
        />
      )}
    </>
  );
}
