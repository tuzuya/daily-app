export type Task = {
  id: string;
  title: string;
  imageUrl?: string;
  category: string;
  deadline?: string;
  points: number;
  description?: string;
  estimatedMinutes?: number;
  createdAt: number;
  done: boolean;
};
