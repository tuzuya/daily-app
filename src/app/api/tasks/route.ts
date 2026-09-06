import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import {
  isCategory,
  isScreen,
  toApiTask,
  TITLE_MAX,
} from "./_shared";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const screen = searchParams.get("screen");
  const includeDone = searchParams.get("includeDone") === "1";

  const filters = [];
  if (screen && isScreen(screen)) filters.push(eq(tasks.screen, screen));
  /* 達成したタスクは既定で外す。
   * これが無いと、ドラッグで達成したカードがリロードで Today に戻ってくる
   * （docs/ai-product-brief.md §7.1 b）。
   * 集計やふりかえりで必要なときだけ includeDone=1 を付ける。 */
  if (!includeDone) filters.push(eq(tasks.done, false));

  const rows = await db
    .select()
    .from(tasks)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(tasks.createdAt));

  return NextResponse.json({ tasks: rows.map(toApiTask) });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const { title, category, screen } = b;

  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (title.trim().length > TITLE_MAX) {
    return NextResponse.json(
      { error: `title must be ${TITLE_MAX} characters or fewer` },
      { status: 400 },
    );
  }
  if (!isCategory(category)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }
  if (!isScreen(screen)) {
    return NextResponse.json({ error: "invalid screen" }, { status: 400 });
  }

  const { deadline, points, description, estimatedMinutes, imageUrl } = b;

  const [row] = await db
    .insert(tasks)
    .values({
      title: title.trim(),
      category,
      screen,
      deadline: typeof deadline === "string" ? deadline : null,
      points:
        typeof points === "number" && Number.isFinite(points)
          ? Math.trunc(points)
          : 0,
      description: typeof description === "string" ? description : null,
      estimatedMinutes:
        typeof estimatedMinutes === "number" && Number.isFinite(estimatedMinutes)
          ? Math.trunc(estimatedMinutes)
          : null,
      imageUrl: typeof imageUrl === "string" ? imageUrl : null,
      updatedAt: new Date(),
    })
    .returning();

  return NextResponse.json({ task: toApiTask(row) }, { status: 201 });
}
