"use client";

import { useEffect, useId, useState } from "react";
import type { Task, TaskCategory, TaskLevel, TaskScreen } from "@/types/task";
import { CATEGORY_DESIGNS, LEVELS, inferLevel } from "@/lib/task-design";
import { categorySpriteUrl } from "@/lib/pixel-sprites";

/**
 * タスクの作成・編集オーバーレイ。Figma の `Overlay/Form` に対応。
 * レイアウトは `HOME — Create (Overlay)` の実測値（パネル 354×636）。
 *
 * **ルートを持たない**（docs/ai-dev-guide.md §5.2）。
 * 暗幕は `--scrim` のベタ塗りで、**blur をかけない**（§10.3）。
 *
 * 作成と編集で同じ部品を使う。違いは見出しと、削除ボタンの有無だけ。
 * **削除はカード自身の責務**なので、編集モードでは必ず出す。
 */

export type TaskFormValues = {
  title: string;
  description: string;
  category: TaskCategory;
  level: TaskLevel;
  hours: number;
  minutes: number;
};

export type TaskFormOverlayProps = {
  /** 渡すと編集モードになる */
  task?: Task;
  /** 新規作成時にどの画面へ入れるか */
  screen?: TaskScreen;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  /** 一覧から開いたとき。Today へ持っていく導線（§10.2） */
  onSendToToday?: () => Promise<void> | void;
};

const clampInt = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.trunc(Number.isFinite(v) ? v : min)));

export default function TaskFormOverlay({
  task,
  onClose,
  onSubmit,
  onDelete,
  onSendToToday,
}: TaskFormOverlayProps) {
  const editing = task !== undefined;
  const titleId = useId();
  const memoId = useId();

  const [values, setValues] = useState<TaskFormValues>(() => ({
    title: task?.title ?? "",
    description: task?.description ?? "",
    category: task?.category ?? "quest",
    level: task ? inferLevel(task.points) : "normal",
    hours: Math.floor((task?.estimatedMinutes ?? 25) / 60),
    minutes: (task?.estimatedMinutes ?? 25) % 60,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = <K extends keyof TaskFormValues>(k: K, v: TaskFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    if (!values.title.trim()) {
      setError("やることを入力してください");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!onDelete) return;
    setBusy(true);
    try {
      await onDelete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-scrim px-[18px] py-[52px]"
      role="dialog"
      aria-modal="true"
      aria-label={editing ? "クエストを編集" : "クエストを追加"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[354px] border-[3px] border-ink-outline bg-panel">
        {/* 見出しの帯。金地 + 暗い文字 */}
        <div className="relative h-[42px] bg-gold">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 block h-[3px] w-full"
            style={{ background: "rgba(255,255,255,0.16)" }}
          />
          <span className="font-label absolute left-3 top-[14px] text-[10px] text-ink-inverse">
            {editing ? "EDIT QUEST" : "NEW QUEST"}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="absolute right-[6px] top-[6px] grid h-[30px] w-[30px] place-items-center bg-panel focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light"
          >
            <XMark />
          </button>
        </div>
        <span aria-hidden="true" className="block h-[3px] w-full bg-ink-outline" />

        <div className="px-3 py-[18px]">
          {/* TITLE */}
          <label
            htmlFor={titleId}
            className="font-label mb-[6px] block text-[8px] text-ink-muted"
          >
            TITLE
          </label>
          <input
            id={titleId}
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={200}
            placeholder="やることを入力"
            className="mb-[18px] block h-[42px] w-full border-[3px] border-ink-outline bg-panel px-3 text-[17px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-[3px] focus:ring-gold-light"
          />

          {/* MEMO */}
          <label
            htmlFor={memoId}
            className="font-label mb-[6px] block text-[8px] text-ink-muted"
          >
            MEMO
          </label>
          <textarea
            id={memoId}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            placeholder="任意のメモ"
            className="mb-[18px] block w-full resize-none border-[3px] border-ink-outline bg-panel p-3 text-[14px] leading-[22px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-[3px] focus:ring-gold-light"
          />

          {/* CATEGORY — アイコンのみ 60×48 */}
          <p className="font-label mb-[6px] text-[8px] text-ink-muted">CATEGORY</p>
          <div className="mb-[18px] flex gap-[6px]">
            {CATEGORY_DESIGNS.map((c) => {
              const on = values.category === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => set("category", c.key)}
                  aria-pressed={on}
                  aria-label={c.label}
                  className={[
                    "grid h-12 w-[60px] place-items-center border-[3px] border-ink-outline",
                    on ? "bg-gold" : "bg-panel-raised",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 36,
                      height: 30,
                      backgroundImage: categorySpriteUrl(
                        c.key,
                        on ? "#14100a" : c.hex,
                        3,
                      ),
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </button>
              );
            })}
          </div>

          <span aria-hidden="true" className="mb-[18px] block h-[3px] w-full bg-ink-faint" />

          {/* LEVEL — 難易度がそのままレア度エフェクトになる */}
          <p className="font-label mb-[6px] text-[8px] text-ink-muted">LEVEL</p>
          <div className="mb-[18px] flex gap-[6px]">
            {LEVELS.map((l) => {
              const on = values.level === l.value;
              return (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => set("level", l.value)}
                  aria-pressed={on}
                  className={[
                    "font-label relative h-[42px] flex-1 border-[3px] border-ink-outline text-[8px]",
                    on ? "bg-gold text-ink-inverse" : "bg-panel-raised text-ink",
                  ].join(" ")}
                >
                  {on && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 block h-[3px] w-full"
                      style={{ background: "rgba(255,255,255,0.45)" }}
                    />
                  )}
                  {l.label}
                </button>
              );
            })}
          </div>

          {/* TASK TIME — 時間 / 分 のステッパー */}
          <p className="font-label mb-[6px] text-[8px] text-ink-muted">TASK TIME</p>
          <Stepper
            label="時間"
            value={values.hours}
            min={0}
            max={23}
            step={1}
            onChange={(v) => set("hours", v)}
          />
          <div className="h-[6px]" />
          <Stepper
            label="分"
            value={values.minutes}
            min={0}
            max={55}
            step={5}
            onChange={(v) => set("minutes", v)}
          />

          <span aria-hidden="true" className="my-[18px] block h-[3px] w-full bg-ink-faint" />

          {error && (
            <p
              role="alert"
              className="mb-3 border-[3px] border-danger bg-panel p-[6px] text-[11px] text-danger"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="relative block h-[60px] w-full border-[3px] border-ink-outline bg-gold text-[14px] text-ink-inverse disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light"
          >
            <span
              aria-hidden="true"
              className="absolute left-[3px] top-[3px] block h-[3px] w-[calc(100%-6px)]"
              style={{ background: "rgba(255,255,255,0.45)" }}
            />
            {busy ? "ほぞん中…" : editing ? "へんこうを保存" : "クエストを追加"}
          </button>

          {onSendToToday && (
            <button
              type="button"
              onClick={() => {
                setBusy(true);
                void onSendToToday();
              }}
              disabled={busy}
              className="mt-3 block h-[42px] w-full border-[3px] border-ink-outline bg-panel-raised text-[14px] text-ink disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light"
            >
              Today へ送る
            </button>
          )}

          {/* 削除はカード自身が持つべき機能なので、編集なら必ず出す */}
          {editing && onDelete && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="mt-3 block h-[42px] w-full border-[3px] border-danger bg-panel text-[11px] text-danger disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light"
            >
              このクエストを削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** 42×42 の増減ボタン + 90px の値。Figma の time/* と同じ寸法 */
function Stepper({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center">
      <span className="flex-1 text-[14px] text-ink">{label}</span>
      <button
        type="button"
        onClick={() => onChange(clampInt(value - step, min, max))}
        aria-label={`${label}を減らす`}
        className="grid h-[42px] w-[42px] place-items-center border-[3px] border-ink-outline bg-panel-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light"
      >
        <span aria-hidden="true" className="block h-[6px] w-[18px] bg-ink" />
      </button>
      <span className="font-num grid h-[42px] w-[90px] place-items-center border-y-[3px] border-ink-outline bg-panel text-[10px] text-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(clampInt(value + step, min, max))}
        aria-label={`${label}を増やす`}
        className="relative grid h-[42px] w-[42px] place-items-center border-[3px] border-ink-outline bg-panel-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light"
      >
        <span aria-hidden="true" className="absolute block h-[6px] w-[18px] bg-ink" />
        <span aria-hidden="true" className="absolute block h-[18px] w-[6px] bg-ink" />
      </button>
    </div>
  );
}

function XMark() {
  return (
    <span aria-hidden="true" className="relative block h-[15px] w-[15px]">
      <span className="absolute left-0 top-[6px] block h-[3px] w-[15px] rotate-45 bg-ink" />
      <span className="absolute left-0 top-[6px] block h-[3px] w-[15px] -rotate-45 bg-ink" />
    </span>
  );
}
