"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { routeSpace } from "./page-space";
import TaskCardDetail from "./TaskCardDetail";
import TaskCarousel from "./TaskCarousel";
import type { Task } from "@/types/task";

const SPACING = 1.8;

export default function SpaceNavigator() {
  const pathname = usePathname();
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const mounted = useRef(false);

  useEffect(() => {
    const update = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    mounted.current = true;
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const activePath = pathname === "/" ? "/today" : pathname;
  const isSpaceRoute = activePath in routeSpace;

  if (!isSpaceRoute || !mounted.current) return null;

  const target = routeSpace[activePath]!;
  const unitX = viewport.w * SPACING;
  const unitY = viewport.h * SPACING;

  return (
    <div className="fixed inset-0 z-10 overflow-hidden">
      <motion.div
        className="relative h-full w-full will-change-transform"
        initial={false}
        animate={{
          x: -target.x * unitX,
          y: -target.y * unitY,
        }}
        transition={{
          type: "spring",
          stiffness: 65,
          damping: 20,
          mass: 1,
        }}
      >
        {Object.entries(routeSpace).map(([route, pos]) => {
          const isActive = route === activePath;
          return (
            <div
              key={route}
              className="absolute top-0 left-0 h-[100dvh] w-screen"
              style={{
                transform: `translate(${pos.x * unitX}px, ${pos.y * unitY}px)`,
                contentVisibility: isActive ? "visible" : "auto",
                containIntrinsicSize: isActive ? undefined : "0 100dvh",
              }}
            >
              <div className="h-full w-full overflow-hidden px-4 pt-20 pb-28">
                <ScreenContent route={route} />
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

function ScreenContent({ route }: { route: string }) {
  switch (route) {
    case "/today":
      return <TaskScreenInitial route="/today" />;
    case "/next":
      return <TaskScreenInitial route="/next" />;
    case "/overdue":
      return <TaskScreenInitial route="/overdue" />;
    case "/buffs":
      return <TaskScreenInitial route="/buffs" />;
    default:
      return null;
  }
}

function routeToScreen(route: string) {
  if (route === "/today") return "today";
  if (route === "/next") return "next";
  if (route === "/overdue") return "overdue";
  if (route === "/buffs") return "buffs";
  return null;
}

function useTasksForScreen(route: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const screen = routeToScreen(route);

  const refetch = useCallback(() => {
    if (!screen) return;
    setLoading(true);
    fetch(`/api/tasks?screen=${screen}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.tasks)) {
          setTasks(data.tasks as Task[]);
        } else {
          setTasks([]);
        }
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [screen]);

  useEffect(() => {
    let cancelled = false;
    if (!screen) return;

    setLoading(true);
    fetch(`/api/tasks?screen=${screen}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data && Array.isArray(data.tasks)) {
          setTasks(data.tasks as Task[]);
        } else {
          setTasks([]);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setTasks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [route, screen]);

  return { tasks, loading, refetch };
}

function TaskScreenInitial({ route }: { route: string }) {
  const { tasks, refetch } = useTasksForScreen(route);
  return <TaskScreen tasks={tasks} route={route} onTasksRefresh={refetch} />;
}

const screenMeta: Record<
  string,
  { title: string; subtitle: string; titleClass: string; subtitleClass: string }
> = {
  "/today": {
    title: "Today / 今日のタスク",
    subtitle:
      "今日フォーカスすることだけをここに置く。完了したら、この宇宙を少しずつ前に進めよう。",
    titleClass: "text-slate-50",
    subtitleClass: "text-slate-400",
  },
  "/next": {
    title: "Next / これからやること",
    subtitle:
      "今日ではないけれど、近いうちに回収したいタスクたち。ここから Today に呼び込んでいく。",
    titleClass: "text-slate-50",
    subtitleClass: "text-slate-400",
  },
  "/overdue": {
    title: "Overdue / まだ終わっていないこと",
    subtitle:
      "終わらなかったタスクを責めないで、もう一度チューニングする場所。ここから Today に優しく戻していく。",
    titleClass: "text-rose-100",
    subtitleClass: "text-rose-200/80",
  },
  "/buffs": {
    title: "Buffs / 今日をちょっと良くするタスク",
    subtitle:
      "AI が用意した「QOL が少し上がる行動」の候補をここに置く。気になったものを Today に召喚して使っていく。",
    titleClass: "text-violet-100",
    subtitleClass: "text-violet-200/80",
  },
};

function TaskScreen({
  tasks,
  route,
  onTasksRefresh,
}: {
  tasks: Task[];
  route: string;
  onTasksRefresh: () => void;
}) {
  const [selected, setSelected] = useState<Task | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const meta = screenMeta[route]!;
  const screen = routeToScreen(route);

  return (
    <div className="relative">
      <div className="relative z-10 space-y-8 pt-10">
        <div className="space-y-1 px-4">
          <h1 className={`text-xl font-semibold ${meta.titleClass}`}>
            {meta.title}
          </h1>
          <p className={`text-xs ${meta.subtitleClass}`}>{meta.subtitle}</p>
        </div>

        <TaskCarousel tasks={tasks} onSelect={setSelected} />

        {screen && (
          <div className="px-4 flex justify-center">
            <button
              type="button"
              onClick={() => setAdding((v) => !v)}
              className="mt-2 flex h-11 w-[min(260px,100%)] items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-medium text-slate-100 backdrop-blur-md transition hover:bg-white/10"
            >
              {adding ? "キャンセル" : "タスクを追加"}
            </button>

            <AnimatePresence initial={false}>
              {adding && (
                <motion.div
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setAdding(false)}
                >
                  <motion.form
                    className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-sm shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const t = title.trim();
                      if (!t) return;
                      try {
                        await fetch("/api/tasks", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            title: t,
                            category: "routine",
                            screen,
                            points: 0,
                          }),
                        });
                        setTitle("");
                        setAdding(false);
                        onTasksRefresh();
                      } catch {
                        // とりあえず無視（後でトーストに差し替え余地）
                      }
                    }}
                    initial={{ scale: 0.9, opacity: 0, y: 24 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 24 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      新しいタスク
                    </p>
                    <input
                      type="text"
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="やることを入力"
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAdding(false)}
                        className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/10"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-900 hover:bg-white"
                      >
                        追加する
                      </button>
                    </div>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="will-change-transform"
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <TaskCardDetail
                task={selected}
                onClose={() => setSelected(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
