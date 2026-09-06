"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task } from "@/types/task";
import { completeTask, useTasks } from "@/lib/use-tasks";
import TaskCarousel from "../components/TaskCarousel";
import DropSlot from "../components/DropSlot";
import StateBlock from "../components/StateBlock";
import QuestClearFx from "../components/QuestClearFx";

/**
 * HOME。当日のタスクを扇状のカルーセルで見せ、
 * **カードを下に引っ張って達成**する（docs/pixel-style-guide.md §10.2）。
 *
 * 旧構造では SpaceNavigator が全画面の描画を持っていたが、
 * いまは各 page.tsx が自分の画面を描画する（docs/ai-dev-guide.md §5.1）。
 */
export default function TodayPage() {
  const { tasks, loading, error, refetch, removeLocal } = useTasks("today");
  const [dropProgress, setDropProgress] = useState(0);
  /** 達成エフェクトはルートを持たないオーバーレイ（§5.2） */
  const [cleared, setCleared] = useState<Task | null>(null);
  const [totalXp, setTotalXp] = useState(0);

  /* 達成時に「増える前のXP」を見せたいので、総XPを持っておく。
   * LV/EXP の供給元が未決なので、いまは完了タスクの合計で代用する
   * （docs/ai-product-brief.md §7.1 c）。 */
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
        // XP は演出用なので、取れなくても達成自体は妨げない
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleComplete = useCallback(
    async (task: Task) => {
      // 先に消して手応えを返し、失敗したら取得し直して戻す
      removeLocal(task.id);
      setCleared(task);
      try {
        await completeTask(task.id);
        setTotalXp((xp) => xp + task.points);
      } catch {
        refetch();
      }
    },
    [removeLocal, refetch],
  );

  const remaining = tasks.length;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[390px] flex-col px-[18px] pb-6 pt-[52px]">
      <header className="mb-6 text-center">
        <p className="font-label text-[10px] text-gold">TODAY</p>
        <h1 className="mt-2 text-[24px] leading-[34px] text-ink">
          今日のクエスト
        </h1>
        {!loading && !error && (
          <p className="mt-1 text-[11px] text-ink-muted">
            {remaining > 0 ? `のこり ${remaining}つ` : "ぜんぶ おわった"}
          </p>
        )}
      </header>

      <div className="flex-1">
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
                onComplete={handleComplete}
                onDropProgress={setDropProgress}
              />
            </div>

            <div className="relative z-10 mt-6">
              <DropSlot progress={dropProgress} />
            </div>
          </div>
        )}
      </div>

      {cleared && (
        <QuestClearFx
          task={cleared}
          xpBefore={totalXp}
          onDismiss={() => setCleared(null)}
        />
      )}
    </div>
  );
}
