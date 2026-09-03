/**
 * タスク表示のデザイン定数（単一ソース）
 *
 * カテゴリ色 / レベル定義は、以前 TaskCard・TaskCardDetail・TaskCardCreate・
 * HexagonStatus の4ファイルに重複していた。Figma で新しいデザイントークンが
 * 決まったら **このファイルだけ** を書き換えれば全画面に反映される。
 *
 * 対応する CSS 変数は src/app/global.css の `--category-*` を参照。
 * SVG の fill など Tailwind クラスが使えない箇所では `hex` を使う。
 */

import type { TaskCategory } from "@/types/task";

export type CategoryDesign = {
  key: TaskCategory;
  label: string;
  /** チャートや SVG の fill 用（Tailwind クラスが使えない箇所） */
  hex: string;
  /** カード表面のグラデーション（TaskCard のサムネ・バッジ） */
  gradient: string;
  /** カードの枠線 */
  border: string;
  /** モーダル背景の大きなグラデーション */
  modalGradient: string;
  /** 見出しのアクセント文字色 */
  accent: string;
  /** カテゴリのサムネイル画像 */
  image: string;
};

export const CATEGORY_DESIGNS: readonly CategoryDesign[] = [
  {
    key: "routine",
    label: "Routine",
    hex: "#f59e0b",
    gradient: "from-amber-400/80 to-orange-500/80",
    border: "border-amber-400/25",
    modalGradient: "from-amber-600/60 via-orange-500/40 to-yellow-500/30",
    accent: "text-amber-300",
    image: "/task-images/routine.png",
  },
  {
    key: "health",
    label: "Health",
    hex: "#10b981",
    gradient: "from-emerald-400/80 to-teal-500/80",
    border: "border-emerald-400/25",
    modalGradient: "from-emerald-600/60 via-teal-500/40 to-cyan-600/30",
    accent: "text-emerald-300",
    image: "/task-images/health.png",
  },
  {
    key: "physical",
    label: "Physical",
    hex: "#3b82f6",
    gradient: "from-blue-400/80 to-indigo-500/80",
    border: "border-blue-400/25",
    modalGradient: "from-blue-600/60 via-indigo-500/40 to-violet-500/30",
    accent: "text-blue-300",
    image: "/task-images/physical.png",
  },
  {
    key: "knowledge",
    label: "Knowledge",
    hex: "#8b5cf6",
    gradient: "from-violet-400/80 to-purple-500/80",
    border: "border-violet-400/25",
    modalGradient: "from-violet-600/60 via-purple-500/40 to-fuchsia-500/30",
    accent: "text-violet-300",
    image: "/task-images/knowledge.png",
  },
  {
    key: "activity",
    label: "Activity",
    hex: "#84cc16",
    gradient: "from-lime-400/80 to-green-500/80",
    border: "border-lime-400/25",
    modalGradient: "from-lime-600/60 via-green-500/40 to-emerald-500/30",
    accent: "text-lime-300",
    image: "/task-images/activity.png",
  },
  {
    key: "creative",
    label: "Creative",
    hex: "#ec4899",
    gradient: "from-pink-400/80 to-rose-500/80",
    border: "border-pink-400/25",
    modalGradient: "from-pink-600/60 via-rose-500/40 to-red-500/30",
    accent: "text-pink-300",
    image: "/task-images/creative.png",
  },
] as const;

/** 未知のカテゴリが来たときのフォールバック（DB は varchar なので型外の値が入り得る） */
export const CATEGORY_FALLBACK: Omit<CategoryDesign, "key" | "label" | "image"> = {
  hex: "#94a3b8",
  gradient: "from-slate-400/80 to-slate-500/80",
  border: "border-slate-400/25",
  modalGradient: "from-slate-600/60 via-slate-500/40 to-slate-400/30",
  accent: "text-slate-300",
};

/**
 * カテゴリ名からデザインを引く。大文字小文字は無視し、
 * 未知の値ならフォールバックを返す。
 */
export function categoryDesign(
  category: string,
): Omit<CategoryDesign, "key" | "label" | "image"> &
  Partial<Pick<CategoryDesign, "key" | "label" | "image">> {
  const key = category.toLowerCase();
  return CATEGORY_DESIGNS.find((c) => c.key === key) ?? CATEGORY_FALLBACK;
}

/** タスクの難易度レベルと、それに対応するポイント */
export type Level = "easy" | "normal" | "hard" | "extra";

export const LEVELS: readonly { value: Level; label: string; points: number }[] = [
  { value: "easy", label: "Easy", points: 5 },
  { value: "normal", label: "Normal", points: 10 },
  { value: "hard", label: "Hard", points: 20 },
  { value: "extra", label: "Extra", points: 30 },
] as const;

/** 保存済みポイントから、表示すべきレベルを逆算する */
export function inferLevel(points: number): Level {
  if (points >= 30) return "extra";
  if (points >= 20) return "hard";
  if (points >= 10) return "normal";
  return "easy";
}
