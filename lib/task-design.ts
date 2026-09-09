/**
 * タスク表示のデザイン定数（単一ソース）
 *
 * 色の正本は Figma の `daily-app / pixel` コレクションと
 * `src/app/global.css` の CSS 変数。ここは「どのカテゴリがどのトークンを使うか」
 * の対応表であって、色そのものを増やす場所ではない。
 *
 * 規則は docs/pixel-style-guide.md（§5 カテゴリ、§9.7 レア度エフェクト）。
 */

import type { TaskCategory, TaskLevel } from "@/types/task";

export type CategoryDesign = {
  key: TaskCategory;
  label: string;
  /** カテゴリ帯・チャートの色。SVG の fill など Tailwind が使えない箇所用 */
  hex: string;
  /** カード面の色（カテゴリ色の彩度を落としたもの） */
  faceVar: string;
  /** 下辺ベベル・区切り線 */
  faceDarkVar: string;
  /** Tailwind クラス（カテゴリ帯） */
  stripClass: string;
  /** Tailwind クラス（カード面） */
  faceClass: string;
};

export const CATEGORY_DESIGNS: readonly CategoryDesign[] = [
  {
    key: "vitality",
    label: "VITALITY",
    hex: "#d1564b",
    faceVar: "--accent-rust",
    faceDarkVar: "--accent-rust-dark",
    stripClass: "bg-category-vitality",
    faceClass: "bg-accent-rust",
  },
  {
    key: "intelligence",
    label: "INTELLIGENCE",
    hex: "#5b8fd4",
    faceVar: "--accent-mint",
    faceDarkVar: "--accent-mint-dark",
    stripClass: "bg-category-intelligence",
    faceClass: "bg-accent-mint",
  },
  {
    key: "creative",
    label: "CREATIVE",
    hex: "#d4638f",
    faceVar: "--accent-lilac",
    faceDarkVar: "--accent-lilac-dark",
    stripClass: "bg-category-creative",
    faceClass: "bg-accent-lilac",
  },
  {
    key: "recovery",
    label: "RECOVERY",
    hex: "#7fc36a",
    faceVar: "--accent-olive",
    faceDarkVar: "--accent-olive-dark",
    stripClass: "bg-category-recovery",
    faceClass: "bg-accent-olive",
  },
  {
    key: "quest",
    label: "QUEST",
    hex: "#e8a52c",
    faceVar: "--accent-sand",
    faceDarkVar: "--accent-sand-dark",
    stripClass: "bg-category-quest",
    faceClass: "bg-accent-sand",
  },
] as const;

/** DB の `category` は varchar なので、型外の値が入り得る */
export const CATEGORY_FALLBACK: Omit<CategoryDesign, "key" | "label"> = {
  hex: "#a2906d",
  faceVar: "--panel-raised",
  faceDarkVar: "--ink-faint",
  stripClass: "bg-ink-muted",
  faceClass: "bg-panel-raised",
};

export function categoryDesign(
  category: string,
): Omit<CategoryDesign, "key" | "label"> &
  Partial<Pick<CategoryDesign, "key" | "label">> {
  const key = category.toLowerCase();
  return CATEGORY_DESIGNS.find((c) => c.key === key) ?? CATEGORY_FALLBACK;
}

/**
 * 難易度。ポイントと**カードのレア度エフェクト**の両方を決める。
 * 難しいタスクほど育つ = 難しいタスクほどカードが豪華になる
 * （docs/ai-product-brief.md §1.1）。
 */
export const LEVELS: readonly {
  value: TaskLevel;
  label: string;
  points: number;
}[] = [
  { value: "easy", label: "EASY", points: 5 },
  { value: "normal", label: "NORMAL", points: 10 },
  { value: "hard", label: "HARD", points: 20 },
  { value: "extra", label: "EXTRA", points: 30 },
] as const;

/** 保存済みポイントから表示すべき難易度を逆算する */
export function inferLevel(points: number): TaskLevel {
  if (points >= 30) return "extra";
  if (points >= 20) return "hard";
  if (points >= 10) return "normal";
  return "easy";
}

/**
 * 総XPからレベルを出す（docs/ai-product-brief.md §7.1 c）。
 * users テーブルを持たず、完了タスクの points 合計から計算する。
 */
export function levelFromXp(totalXp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, totalXp) / 50)) + 1;
}

/** 現在のレベル区間 [開始XP, 次のレベルに必要なXP] */
export function xpRangeForLevel(level: number): [number, number] {
  return [50 * (level - 1) ** 2, 50 * level ** 2];
}
