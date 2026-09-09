import { NextResponse } from "next/server";
import { and, eq, lt, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { toApiTask } from "../tasks/_shared";

export const runtime = "nodejs";

/**
 * 日跨ぎの仕分け（docs/ai-product-brief.md §4.6）。
 *
 * `GET`  … 前日以前の Today に残っているタスクを返す
 * `POST` … 仕分け結果を適用する（keep = 今日へ持ち越し / drop = Overdue へ）
 *
 * **日付の判定はクライアントのローカル日付で行う。** サーバーの時刻帯が
 * 利用者と一致する保証がないため、`today` をクエリで受け取る
 * （docs/ai-dev-guide.md §8.2）。
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const today = searchParams.get("today");
  if (!today || !DATE_RE.test(today)) {
    return NextResponse.json(
      { error: "today (YYYY-MM-DD) is required" },
      { status: 400 },
    );
  }

  const rows = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.screen, "today"),
        eq(tasks.done, false),
        isNotNull(tasks.todayDate),
        lt(tasks.todayDate, today),
      ),
    )
    .orderBy(tasks.createdAt);

  return NextResponse.json({ tasks: rows.map(toApiTask) });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const today = b.today;
  if (typeof today !== "string" || !DATE_RE.test(today)) {
    return NextResponse.json(
      { error: "today (YYYY-MM-DD) is required" },
      { status: 400 },
    );
  }

  const keep = Array.isArray(b.keep) ? (b.keep as unknown[]) : [];
  const drop = Array.isArray(b.drop) ? (b.drop as unknown[]) : [];
  const ids = (v: unknown[]) => v.filter((x): x is string => typeof x === "string");

  let kept = 0;
  let dropped = 0;

  // 持ち越し: 今日の Today に置き直す
  for (const id of ids(keep)) {
    const [row] = await db
      .update(tasks)
      .set({ screen: "today", todayDate: today, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });
    if (row) kept++;
  }

  // 見送り: Overdue へ。todayDate は消して Today から外す
  for (const id of ids(drop)) {
    const [row] = await db
      .update(tasks)
      .set({ screen: "overdue", todayDate: null, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });
    if (row) dropped++;
  }

  return NextResponse.json({ kept, dropped });
}
