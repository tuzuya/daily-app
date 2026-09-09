import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 500 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  points: integer("points").notNull().default(0),
  done: boolean("done").notNull().default(false),
  description: text("description"),
  deadline: varchar("deadline", { length: 10 }),
  imageUrl: text("image_url"),
  estimatedMinutes: integer("estimated_minutes"),
  screen: varchar("screen", { length: 20 }).notNull(),

  /* どの日の Today に置かれたか（YYYY-MM-DD, **ローカル日付**）。
   * `createdAt` は「作った日」であって「どの日やる予定か」ではないので
   * 代用できない。これが無いと日跨ぎの仕分けができない
   * （docs/ai-dev-guide.md §3.3 / ai-product-brief §4.6）。 */
  todayDate: varchar("today_date", { length: 10 }),

  /** 達成した瞬間。「今日の達成」の集計に使う */
  completedAt: timestamp("completed_at"),

  userId: varchar("user_id", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type TaskRow = typeof tasks.$inferSelect;
export type TaskInsert = typeof tasks.$inferInsert;
