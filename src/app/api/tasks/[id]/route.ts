import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { isCategory, isScreen, toApiTask, TITLE_MAX } from "../_shared";

export const runtime = "nodejs";

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

  if (typeof b.title === "string") {
    const t = b.title.trim();
    if (t.length === 0) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (t.length > TITLE_MAX) {
      return NextResponse.json(
        { error: `title must be ${TITLE_MAX} characters or fewer` },
        { status: 400 },
      );
    }
    updates.title = t;
  }

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

  if (b.deadline === null || typeof b.deadline === "string") {
    updates.deadline = b.deadline;
  }
  if (typeof b.points === "number" && Number.isFinite(b.points)) {
    updates.points = Math.trunc(b.points);
  }
  if (b.description === null || typeof b.description === "string") {
    updates.description = b.description;
  }
  if (b.imageUrl === null || typeof b.imageUrl === "string") {
    updates.imageUrl = b.imageUrl;
  }
  if (
    b.estimatedMinutes === null ||
    (typeof b.estimatedMinutes === "number" &&
      Number.isFinite(b.estimatedMinutes))
  ) {
    updates.estimatedMinutes =
      b.estimatedMinutes === null ? null : Math.trunc(b.estimatedMinutes);
  }
  if (typeof b.done === "boolean") updates.done = b.done;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updatable fields" }, { status: 400 });
  }

  updates.updatedAt = new Date();

  const [row] = await db
    .update(tasks)
    .set(updates)
    .where(eq(tasks.id, id))
    .returning();

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
