import type { tasks } from "@/lib/db/schema";
import type { Task, TaskCategory, TaskScreen } from "@/types/task";

/**
 * `route.ts` と `[id]/route.ts` に丸ごと重複していたバリデーションと変換を集約。
 * カテゴリを変えるときに片方だけ直す事故を防ぐ。
 */

export const CATEGORIES: readonly TaskCategory[] = [
  "vitality",
  "intelligence",
  "creative",
  "recovery",
  "quest",
] as const;

export const SCREENS: readonly TaskScreen[] = [
  "today",
  "next",
  "overdue",
  "buffs",
] as const;

export function isCategory(v: unknown): v is TaskCategory {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}

export function isScreen(v: unknown): v is TaskScreen {
  return typeof v === "string" && (SCREENS as readonly string[]).includes(v);
}

/** タイトルの最大長（docs/ai-dev-guide.md §8.4）。DB は varchar(500) */
export const TITLE_MAX = 200;

export function toApiTask(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl ?? undefined,
    category: row.category as TaskCategory,
    deadline: row.deadline ?? undefined,
    points: row.points,
    description: row.description ?? undefined,
    estimatedMinutes: row.estimatedMinutes ?? undefined,
    screen: row.screen as TaskScreen,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    done: row.done,
  };
}
