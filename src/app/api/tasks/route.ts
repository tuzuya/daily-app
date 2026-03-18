import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import type { Task, TaskCategory, TaskScreen } from "@/types/task";

export const runtime = "nodejs";

const CATEGORIES: readonly TaskCategory[] = [
  "routine",
  "health",
  "physical",
  "knowledge",
  "activity",
  "creative",
] as const;

const SCREENS: readonly TaskScreen[] = ["today", "next", "overdue", "buffs"] as const;

function isCategory(v: unknown): v is TaskCategory {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}

function isScreen(v: unknown): v is TaskScreen {
  return typeof v === "string" && (SCREENS as readonly string[]).includes(v);
}

function toApiTask(row: typeof tasks.$inferSelect): Task {
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const screen = searchParams.get("screen");

  const where = screen && isScreen(screen) ? eq(tasks.screen, screen) : undefined;

  const rows = await db
    .select()
    .from(tasks)
    .where(where ? and(where) : undefined)
    .orderBy(desc(tasks.createdAt));

  return NextResponse.json({ tasks: rows.map(toApiTask) });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const title = b.title;
  const category = b.category;
  const screen = b.screen;

  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!isCategory(category)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }
  if (!isScreen(screen)) {
    return NextResponse.json({ error: "invalid screen" }, { status: 400 });
  }

  const deadline = b.deadline;
  const points = b.points;
  const description = b.description;
  const estimatedMinutes = b.estimatedMinutes;
  const imageUrl = b.imageUrl;

  const insert = {
    title: title.trim(),
    category,
    screen,
    deadline: typeof deadline === "string" ? deadline : null,
    points: typeof points === "number" && Number.isFinite(points) ? Math.trunc(points) : 0,
    description: typeof description === "string" ? description : null,
    estimatedMinutes:
      typeof estimatedMinutes === "number" && Number.isFinite(estimatedMinutes)
        ? Math.trunc(estimatedMinutes)
        : null,
    imageUrl: typeof imageUrl === "string" ? imageUrl : null,
    updatedAt: new Date(),
  };

  const [row] = await db.insert(tasks).values(insert).returning();
  return NextResponse.json({ task: toApiTask(row) }, { status: 201 });
}

