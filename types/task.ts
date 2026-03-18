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
};

export type TaskCategory =
  | "routine"
  | "health"
  | "physical"
  | "knowledge"
  | "activity"
  | "creative";

export type TaskScreen = "today" | "next" | "overdue" | "buffs";
