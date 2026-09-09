"use client";

import StatusBars from "../components/StatusBars";
import TopBar from "../components/TopBar";
import { useTotalXp } from "@/lib/use-total-xp";
import { levelFromXp, xpRangeForLevel } from "@/lib/task-design";

/**
 * アバターのステータス画面（docs/ai-product-brief.md §6.5）。
 * 設定のおまけではなく、育成の成果を確認する場所なので
 * アバターに一番大きな面積を割く（同 §1.1）。
 */
export default function ProfilePage() {
  const { totalXp } = useTotalXp();
  const level = levelFromXp(totalXp);
  const [, ceil] = xpRangeForLevel(level);

  return (
    <>
      <TopBar totalXp={totalXp} />

      <div className="mx-auto w-full max-w-[390px] px-[18px] pb-6 pt-[30px]">
        <header className="mb-6">
          <p className="font-label text-[10px] text-gold">STATUS</p>
          <h1 className="relative mt-2 text-[24px] leading-[34px] text-ink">
            <span
              aria-hidden="true"
              className="absolute left-[3px] top-[3px] text-ink-outline"
            >
              アバター
            </span>
            <span className="relative">アバター</span>
          </h1>
          <p className="mt-1 text-[14px] text-ink-muted">
            LV {level} ・ つぎまで {Math.max(0, ceil - totalXp)} XP
          </p>
        </header>

        {/* アバターの舞台。中身はベータ後（§4.7）なので領域だけ空ける */}
        <div className="mb-6 grid h-[180px] place-items-center border-[3px] border-ink-outline bg-panel">
          <p className="font-label text-[8px] text-ink-faint">COMING SOON</p>
        </div>

        <section className="mb-6">
          <h2 className="font-label mb-3 text-[10px] text-ink-muted">STATUS</h2>
          <StatusBars />
        </section>

        {/* TODO: コインは獲得と消費のルールが未決なのでまだ出さない */}
      </div>
    </>
  );
}
