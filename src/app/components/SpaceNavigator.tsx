"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { routeSpace } from "./page-space";
import { ScrollingText } from "./ScrollingText";
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

const MOCK_TODAY: Task[] = [
  {
    id: "t1",
    title: "朝のエネルギーチェック：コーヒーを淹れて、今日の最初の1タスクを決める",
    category: "routine",
    points: 10,
    deadline: new Date().toISOString().slice(0, 10),
    description:
      "朝の時間を使って頭をクリアにし、今日やるべき最も重要な1タスクを選ぶ。コーヒーを淹れるルーティンと組み合わせることで習慣化しやすくなる。",
    estimatedMinutes: 10,
    createdAt: Date.now() - 86400000,
    done: false,
  },
  {
    id: "t2",
    title: "今日のメインクエスト：Next から1つだけ前倒しで片づける",
    category: "skill",
    points: 30,
    deadline: new Date().toISOString().slice(0, 10),
    description: "Next リストから最も影響の大きいタスクを1つ選び、今日中に完了させる。",
    estimatedMinutes: 45,
    createdAt: Date.now() - 172800000,
    done: false,
  },
  {
    id: "t3",
    title: "自分をねぎらう5分：画面を閉じて、深呼吸だけする",
    category: "health",
    points: 5,
    description: "集中が切れたタイミングで画面を閉じ、5分間だけ深呼吸に集中する。",
    estimatedMinutes: 5,
    createdAt: Date.now() - 3600000,
    done: false,
  },
  {
    id: "t4",
    title: "TypeScript の型パズルを1問だけ解く",
    category: "study",
    points: 15,
    deadline: new Date().toISOString().slice(0, 10),
    description: "type-challenges から Easy を1問ピックアップして解く。",
    estimatedMinutes: 20,
    createdAt: Date.now() - 7200000,
    done: false,
  },
  {
    id: "t5",
    title: "散歩しながら音声メモを1つ録る",
    category: "creative",
    points: 8,
    description: "外に出て5分歩きながら、頭に浮かんだアイデアを音声メモに残す。",
    estimatedMinutes: 10,
    createdAt: Date.now() - 43200000,
    done: false,
  },
  {
    id: "t6",
    title: "デスク周りを30秒だけ片づける",
    category: "routine",
    points: 3,
    description: "目の前の1アイテムだけ元に戻す。小さな達成感で集中モードに入る。",
    estimatedMinutes: 1,
    createdAt: Date.now() - 1800000,
    done: false,
  },
  {
    id: "t7",
    title: "水を1杯飲んでストレッチ",
    category: "health",
    points: 4,
    description: "水分補給と軽い首・肩のストレッチ。1分で完了。",
    estimatedMinutes: 2,
    createdAt: Date.now() - 900000,
    done: false,
  },
];

const MOCK_NEXT: Task[] = [
  {
    id: "n1",
    title: "週末に読みたい記事をまとめておく",
    category: "study",
    points: 8,
    deadline: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
    description: "ブックマークに溜まった記事から厳選して5つだけリストアップする。",
    estimatedMinutes: 15,
    createdAt: Date.now() - 259200000,
    done: false,
  },
  {
    id: "n2",
    title: "今月中に試したい習慣を3つ書き出す",
    category: "routine",
    points: 12,
    deadline: new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10),
    description:
      "新しい習慣の候補を3つ挙げて、それぞれ最小限のアクションを定義する。",
    estimatedMinutes: 20,
    createdAt: Date.now() - 432000000,
    done: false,
  },
  {
    id: "n3",
    title: "未来の自分へのメモ：やりたいけれど、まだタイミングじゃないことを1つ書く",
    category: "creative",
    points: 5,
    createdAt: Date.now() - 604800000,
    done: false,
  },
  {
    id: "n4",
    title: "ポートフォリオに載せるプロジェクトを選定する",
    category: "skill",
    points: 20,
    deadline: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    description: "過去の制作物から3つ選び、スクリーンショットと概要を準備する。",
    estimatedMinutes: 30,
    createdAt: Date.now() - 345600000,
    done: false,
  },
  {
    id: "n5",
    title: "来週のミーティング資料の下書き",
    category: "study",
    points: 15,
    deadline: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    estimatedMinutes: 25,
    createdAt: Date.now() - 172800000,
    done: false,
  },
];

const MOCK_OVERDUE: Task[] = [
  {
    id: "o1",
    title: "先週の「やりかけメモ」を読み直して、1つだけ今日に戻す",
    category: "skill",
    points: 15,
    deadline: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    description: "やりかけのタスクを見直し、まだ必要なら Today に再投入する。",
    estimatedMinutes: 10,
    createdAt: Date.now() - 864000000,
    done: false,
  },
  {
    id: "o2",
    title: "やらなくてよかったタスクを1つ決めて、リストから卒業させる",
    category: "routine",
    points: 10,
    deadline: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
    description:
      "「もうやらなくていい」と判断したタスクを勇気を持って手放す練習。",
    estimatedMinutes: 5,
    createdAt: Date.now() - 1296000000,
    done: false,
  },
  {
    id: "o3",
    title: "返信し忘れていたメッセージに返事する",
    category: "routine",
    points: 8,
    deadline: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    description: "未読のまま放置していた連絡に短くても返信する。",
    estimatedMinutes: 5,
    createdAt: Date.now() - 604800000,
    done: false,
  },
  {
    id: "o4",
    title: "Figma のプロトタイプを仕上げる",
    category: "creative",
    points: 25,
    deadline: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
    description: "途中で止まっていたUIデザインの仕上げ。",
    estimatedMinutes: 40,
    createdAt: Date.now() - 1036800000,
    done: false,
  },
];

const MOCK_BUFFS: Task[] = [
  {
    id: "b1",
    title: "30秒だけ姿勢をリセットする",
    category: "health",
    points: 3,
    description: "椅子に深く座り直し、肩を3回まわして背筋を伸ばす。",
    estimatedMinutes: 1,
    createdAt: Date.now(),
    done: false,
  },
  {
    id: "b2",
    title: "今の気分を一言だけメモする",
    category: "creative",
    points: 5,
    description: "「今どんな気持ち？」に一言だけ答えて記録する。振り返りの材料になる。",
    estimatedMinutes: 1,
    createdAt: Date.now(),
    done: false,
  },
  {
    id: "b3",
    title: "デスクの上から 1 アイテムだけ片づける",
    category: "routine",
    points: 4,
    description: "1つだけ元の場所に戻すか捨てる。小さな達成感が集中力を回復させる。",
    estimatedMinutes: 2,
    createdAt: Date.now(),
    done: false,
  },
  {
    id: "b4",
    title: "好きな曲を1曲フルで聴く",
    category: "creative",
    points: 3,
    description: "作業BGMではなく、1曲だけ集中して聴く時間を作る。",
    estimatedMinutes: 4,
    createdAt: Date.now(),
    done: false,
  },
  {
    id: "b5",
    title: "窓を開けて外の空気を吸う",
    category: "health",
    points: 2,
    description: "30秒でいいので新鮮な空気を吸って気分をリセット。",
    estimatedMinutes: 1,
    createdAt: Date.now(),
    done: false,
  },
];

function ScreenContent({ route }: { route: string }) {
  switch (route) {
    case "/today":
      return <TaskScreen tasks={MOCK_TODAY} route="/today" />;
    case "/next":
      return <TaskScreen tasks={MOCK_NEXT} route="/next" />;
    case "/overdue":
      return <TaskScreen tasks={MOCK_OVERDUE} route="/overdue" />;
    case "/buffs":
      return <TaskScreen tasks={MOCK_BUFFS} route="/buffs" />;
    default:
      return null;
  }
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

function TaskScreen({ tasks, route }: { tasks: Task[]; route: string }) {
  const [selected, setSelected] = useState<Task | null>(null);
  const meta = screenMeta[route]!;
  const isToday = route === "/today";

  return (
    <div className="relative">
      {isToday && <ScrollingText />}

      <div className="relative z-10 space-y-8 pt-10">
        <div className="space-y-1 px-4">
          <h1 className={`text-xl font-semibold ${meta.titleClass}`}>
            {meta.title}
          </h1>
          <p className={`text-xs ${meta.subtitleClass}`}>{meta.subtitle}</p>
        </div>

        <TaskCarousel tasks={tasks} onSelect={setSelected} />
      </div>

      {/* Detail overlay */}
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
