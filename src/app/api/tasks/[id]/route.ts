import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const body = (await req.json().catch(() => null)) as unknown;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  if (typeof b.title === "string") updates.title = b.title.trim();
  if (b.category !== undefined) {
    if (!isCategory(b.category)) {
      return NextResponse.json({ error: "invalid category" }, { status: 400 });
    }
    updates.category = b.category;
  }
  if (b.screen !== undefined) {
    if (!isScreen(b.screen)) {
      return NextResponse.json({ error: "invalid screen" }, { status: 400 });
    }
    updates.screen = b.screen;
  }
  if (b.deadline === null || typeof b.deadline === "string") updates.deadline = b.deadline;
  if (typeof b.points === "number" && Number.isFinite(b.points)) updates.points = Math.trunc(b.points);
  if (b.description === null || typeof b.description === "string") updates.description = b.description;
  if (b.imageUrl === null || typeof b.imageUrl === "string") updates.imageUrl = b.imageUrl;
  if (b.estimatedMinutes === null || (typeof b.estimatedMinutes === "number" && Number.isFinite(b.estimatedMinutes))) {
    updates.estimatedMinutes =
      b.estimatedMinutes === null ? null : Math.trunc(b.estimatedMinutes);
  }
  if (typeof b.done === "boolean") updates.done = b.done;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updatable fields" }, { status: 400 });
  }

  updates.updatedAt = new Date();

  const [row] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ task: toApiTask(row) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [row] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ task: toApiTask(row) });
}

