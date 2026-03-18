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
  userId: varchar("user_id", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type TaskRow = typeof tasks.$inferSelect;
export type TaskInsert = typeof tasks.$inferInsert;
