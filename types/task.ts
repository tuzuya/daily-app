export type Task = {
  id: string;
  title: string;
  imageUrl?: string;
  category: TaskCategory;
  deadline?: string;
  points: number;
  description?: string;
  estimatedMinutes?: number;
  createdAt: number;
  updatedAt?: number;
  screen: TaskScreen;
  done: boolean;
  /** どの日の Today に置かれたか（YYYY-MM-DD, ローカル日付） */
  todayDate?: string;
  /** 達成した瞬間 */
  completedAt?: number;
};

/**
 * カテゴリは「アバターのステータス」そのもの。
 * RPG のステータス名にしたのは見た目の都合ではなく、育成対象だから
 * （docs/ai-product-brief.md §1.1）。
 *
 * 2026-09-05 に旧6種から変更:
 * routine / health / physical / knowledge / activity / creative
 */
export type TaskCategory =
  | "vitality"
  | "intelligence"
  | "creative"
  | "recovery"
  | "quest";

export type TaskScreen = "today" | "next" | "overdue" | "buffs";

/** タスクの難易度。獲得ポイントと、カードのレア度エフェクトを決める。 */
export type TaskLevel = "easy" | "normal" | "hard" | "extra";
