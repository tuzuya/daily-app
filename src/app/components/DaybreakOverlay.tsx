"use client";

import { useState } from "react";
import type { Task } from "@/types/task";
import { categoryDesign, inferLevel } from "@/lib/task-design";
import { today } from "@/lib/local-date";

/**
 * 日跨ぎの仕分け（docs/ai-product-brief.md §4.6 / Figma `DAYBREAK — Triage`）。
 *
 * 前日までの Today に残ったタスクを、**今日やる / あとで** に振り分けてから
 * その日を始める。日付が変わって最初にアプリを開いたときだけ出る。
 *
 * ルートを持たないオーバーレイ（§5.2）。閉じる手段はボタンだけにしてある。
 * 途中で消せると「仕分けていない残り」が宙に浮くため。
 */

type Choice = "today" | "later";

export type DaybreakOverlayProps = {
  tasks: Task[];
  /** 前日の DAY 番号（表示だけに使う） */
  onDone: () => void;
};

export default function DaybreakOverlay({
  tasks,
  onDone,
}: DaybreakOverlayProps) {
  /* 既定は「今日やる」。何も選ばずに進んでも、
   * 前日の予定がそのまま残るほうが驚きが少ない。 */
  const [choices, setChoices] = useState<Record<string, Choice>>(() =>
    Object.fromEntries(tasks.map((t) => [t.id, "today" as Choice])),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keepCount = tasks.filter((t) => choices[t.id] === "today").length;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/daybreak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          today: today(),
          keep: tasks.filter((t) => choices[t.id] === "today").map((t) => t.id),
          drop: tasks.filter((t) => choices[t.id] === "later").map((t) => t.id),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="きのうの のこり"
      className="fixed inset-0 z-[70] overflow-y-auto bg-ground-deep px-[18px] py-[52px]"
    >
      <div className="mx-auto w-full max-w-[354px]">
        <p className="font-label text-[10px] text-gold">DAYBREAK</p>
        <h1 className="relative mt-2 text-[24px] leading-[34px] text-ink">
          <span
            aria-hidden="true"
            className="absolute left-[3px] top-[3px] text-ink-outline"
          >
            きのうの のこり
          </span>
          <span className="relative">きのうの のこり</span>
        </h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          今日やるものを えらぼう
        </p>
        <p className="mt-6 text-[11px] text-ink-muted">
          {tasks.length}つ のこっています
        </p>

        <ul className="mt-3 flex flex-col gap-3">
          {tasks.map((t) => {
            const design = categoryDesign(t.category);
            const level = inferLevel(t.points);
            const choice = choices[t.id] ?? "today";
            return (
              <li
                key={t.id}
                className="relative border-[3px] border-ink-outline bg-panel p-3 pl-[27px]"
              >
                {/* カテゴリの色帯 */}
                <span
                  aria-hidden="true"
                  className={["absolute left-0 top-0 block h-full w-[12px]", design.stripClass].join(" ")}
                />
                <p className="truncate text-[14px] leading-[22px] text-ink">
                  {t.title}
                </p>
                <p className="mt-[2px] text-[11px] leading-[16px] text-ink-muted">
                  {t.estimatedMinutes ? `${t.estimatedMinutes}分 ・ ` : ""}
                  {t.points}XP ・ {level.toUpperCase()}
                </p>

                <div className="mt-[6px] flex gap-[6px]">
                  {(["today", "later"] as const).map((c) => {
                    const on = choice === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          setChoices((prev) => ({ ...prev, [t.id]: c }))
                        }
                        className={[
                          "relative h-[30px] flex-1 border-[3px] border-ink-outline text-[11px]",
                          on
                            ? "bg-gold text-ink-inverse"
                            : "bg-panel-raised text-ink",
                        ].join(" ")}
                      >
                        {on && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-0 block h-[3px] w-full"
                            style={{ background: "rgba(255,255,255,0.45)" }}
                          />
                        )}
                        {c === "today" ? "今日やる" : "あとで"}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>

        {error && (
          <p
            role="alert"
            className="mt-3 border-[3px] border-danger bg-panel p-[6px] text-[11px] text-danger"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="relative mt-6 block h-[66px] w-full border-[3px] border-ink-outline bg-gold text-[14px] text-ink-inverse disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light"
        >
          <span
            aria-hidden="true"
            className="absolute left-[3px] top-[3px] block h-[3px] w-[calc(100%-6px)]"
            style={{ background: "rgba(255,255,255,0.45)" }}
          />
          {busy ? "しょり中…" : `今日をはじめる（${keepCount}つ）`}
        </button>

        <p className="mt-3 text-center text-[11px] text-ink-muted">
          「あとで」は Overdue に のこります
        </p>
      </div>
    </div>
  );
}
