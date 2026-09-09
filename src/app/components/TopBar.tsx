"use client";

import Link from "next/link";
import { EXP_SEGMENTS } from "@/lib/pixel-fx";
import { levelFromXp, xpRangeForLevel } from "@/lib/task-design";

/**
 * 上部バー（LV / コイン / ＋ / ☰）と EXP ゲージ。
 * 値は Figma の `HOME — Today (Pixel)` の `top/*` `exp/*` から写した。
 *
 * | 要素 | x | y | サイズ |
 * |---|---|---|---|
 * | LV バッジ | 18 | 52 | 78×36 |
 * | コイン | 114 | 62 | 18×15 |
 * | ＋ | 288 | 52 | 36×36（金地） |
 * | ☰ | 336 | 52 | 36×36 |
 * | EXP 枠 | 54 | 118 | 318×24（18px の升を 21 ピッチで15個） |
 *
 * **育成の進みを常に見せる場所**なので、どの画面にも出る（§1.1）。
 */

const SEG_PITCH = 21;
const SEG_SIZE = 18;

/** コインのドット絵（ひし形） */
const COIN_ROWS = [
  [6, 6, 3],
  [3, 12, 3],
  [0, 18, 3],
  [3, 12, 3],
  [6, 6, 3],
] as const;

export type TopBarProps = {
  /** 完了タスクの合計ポイント。LV と EXP はここから出す */
  totalXp: number;
  coins?: number;
  onAdd?: () => void;
  onMenu?: () => void;
};

export default function TopBar({
  totalXp,
  coins = 0,
  onAdd,
  onMenu,
}: TopBarProps) {
  const level = levelFromXp(totalXp);
  const [floor, ceil] = xpRangeForLevel(level);
  const ratio = ceil > floor ? (totalXp - floor) / (ceil - floor) : 0;
  const filled = Math.max(0, Math.min(EXP_SEGMENTS, Math.round(ratio * EXP_SEGMENTS)));

  return (
    <div className="relative z-20 px-[18px] pt-[52px]">
      <div className="flex items-center gap-3">
        {/* LV バッジ */}
        <div className="relative h-9 w-[78px] bg-panel-raised">
          <span
            aria-hidden="true"
            className="absolute left-[3px] top-[3px] block h-[3px] w-[72px]"
            style={{ background: "rgba(255,255,255,0.22)" }}
          />
          <span className="font-num absolute inset-x-0 top-[10px] text-center text-[10px] text-gold-light">
            LV {level}
          </span>
        </div>

        {/* コイン */}
        <span
          aria-hidden="true"
          className="relative block h-[15px] w-[18px] shrink-0"
        >
          {COIN_ROWS.map(([x, w, h], i) => (
            <span
              key={i}
              className="absolute bg-gold-light"
              style={{ left: x, top: i * 3, width: w, height: h }}
            />
          ))}
        </span>
        <span className="font-num text-[10px] text-ink-soft">{coins}</span>

        <span className="flex-1" />

        {/* ＋ = クエストを追加。金地で「操作の合図」を出す */}
        <button
          type="button"
          onClick={onAdd}
          aria-label="クエストを追加"
          className="relative h-9 w-9 shrink-0 bg-gold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light"
        >
          <span
            aria-hidden="true"
            className="absolute left-[3px] top-[3px] block h-[3px] w-[30px]"
            style={{ background: "rgba(255,255,255,0.45)" }}
          />
          <span
            aria-hidden="true"
            className="absolute bg-ink-outline"
            style={{ left: 15, top: 9, width: 6, height: 18 }}
          />
          <span
            aria-hidden="true"
            className="absolute bg-ink-outline"
            style={{ left: 9, top: 15, width: 18, height: 6 }}
          />
        </button>

        {/* ☰ */}
        {onMenu ? (
          <button
            type="button"
            onClick={onMenu}
            aria-label="メニュー"
            className="relative h-9 w-9 shrink-0 bg-panel focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light"
          >
            <MenuBars />
          </button>
        ) : (
          <Link
            href="/profile"
            aria-label="ステータス"
            className="relative block h-9 w-9 shrink-0 bg-panel focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light"
          >
            <MenuBars />
          </Link>
        )}
      </div>

      {/* EXP ゲージ */}
      <div className="mt-[30px] flex items-center gap-3">
        <span className="font-label text-[10px] text-ink-muted">EXP</span>
        <span className="relative block h-6 flex-1 bg-panel">
          <span className="absolute left-[3px] top-[3px] flex">
            {Array.from({ length: EXP_SEGMENTS }).map((_, i) => (
              <span
                key={i}
                className="block"
                style={{
                  width: SEG_SIZE,
                  height: SEG_SIZE,
                  marginRight: SEG_PITCH - SEG_SIZE,
                  background: i < filled ? "var(--gold)" : "var(--ink-outline)",
                }}
              />
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}

function MenuBars() {
  return (
    <span
      aria-hidden="true"
      className="absolute left-[9px] top-[11px] flex flex-col gap-[3px]"
    >
      {[0, 1, 2].map((i) => (
        <span key={i} className="block h-[3px] w-[18px] bg-ink" />
      ))}
    </span>
  );
}
