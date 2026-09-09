"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Task } from "@/types/task";
import { categoryDesign } from "@/lib/task-design";
import { categorySpriteUrl } from "@/lib/pixel-sprites";
import { burstStamp, EXP_SEGMENTS, speedLines } from "@/lib/pixel-fx";

/**
 * 達成エフェクト（docs/pixel-style-guide.md §8.3、全体 2.4s）。
 *
 * **ルートを持たないオーバーレイ**（§5.2）。Today の上に重なるだけで、
 * 別画面ではない。ルートにすると戻る操作で再表示できてしまう。
 *
 * easing の対応は §8.4 の表どおり。**HOLD を補間に置き換えないこと。**
 * ここがピクセル感の分かれ目になる。
 */

// §8.4 の対応表
const EASE_OUT_BACK = [0.34, 1.56, 0.64, 1] as const;
const EASE_IN = [0.42, 0, 1, 1] as const;

/* Figma の `BOUNCY` は spring だが、**framer-motion の spring は
 * キーフレームを2点しか扱えない**（3点以上で
 * "Only two keyframes currently supported with spring" が出る）。
 * 3点のキーフレームで弾ませたい場合は、区間ごとの easing 配列を使い、
 * 行き過ぎて戻る cubic-bezier で代用する。
 * 単純な2点間の動きなら spring をそのまま使ってよい。 */
const BOUNCE_SETTLE = [0.34, 1.8, 0.64, 1] as const;

/* Figma の `HOLD` に相当する easing。区間の最後まで前の値を保ち、
 * 終端で次の値へ飛ぶ（= steps(1, end)）。
 * framer-motion は文字列の steps() を受け付けないので関数で渡す。
 * **これを補間に置き換えないこと。** 半透明の中間フレームが出て
 * ピクセルが崩れる（docs/pixel-style-guide.md §8.4）。 */
const HOLD = (t: number) => (t < 1 ? 0 : 1);

export type QuestClearFxProps = {
  task: Task;
  /** 達成前の総XP。EXPバーの伸びを見せるのに使う */
  xpBefore: number;
  onDismiss: () => void;
};

export default function QuestClearFx({
  task,
  xpBefore,
  onDismiss,
}: QuestClearFxProps) {
  const design = categoryDesign(task.category);
  const [filled, setFilled] = useState(0);

  // EXP バーは 1000XP で1周する見せ方にする（レベル式とは別の演出用）
  const before = xpBefore % 1000;
  const after = (xpBefore + task.points) % 1000;
  const segBefore = Math.floor((before / 1000) * EXP_SEGMENTS);
  const segAfter = Math.floor((after / 1000) * EXP_SEGMENTS);

  /* バーは §8.3 の 1.2〜1.28s に合わせて、1マスずつ点灯させる。
   * 補間で伸ばすとピクセルが崩れるので、マス単位で切り替える。 */
  useEffect(() => {
    setFilled(segBefore);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const steps = Math.max(0, segAfter - segBefore);
    for (let i = 1; i <= steps; i++) {
      timers.push(
        setTimeout(() => setFilled(segBefore + i), 1200 + i * 80),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [segBefore, segAfter]);

  // Esc でも閉じられるようにする
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") onDismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="クエスト達成"
      onClick={onDismiss}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-ground-deep"
    >
      {/* 集中線。ゆっくり回り続ける（2.4s で -9度） */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          width: 720,
          height: 720,
          backgroundImage: speedLines(720),
          opacity: 0.22,
        }}
        initial={{ scale: 0.25, rotate: 0 }}
        animate={{ scale: [0.25, 1.12, 1], rotate: -9 }}
        transition={{
          scale: { times: [0, 0.13, 0.21], duration: 2.4, ease: "easeOut" },
          rotate: { duration: 2.4, ease: "linear" },
        }}
      />

      {/* ラベル */}
      <motion.p
        className="font-label relative text-[10px] text-gold"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.24, ease: "easeOut" }}
      >
        QUEST COMPLETE
      </motion.p>

      {/* CLEAR! — 0.14s で HOLD 表示、その後バウンドで収める */}
      <motion.p
        className="font-num relative mt-3 text-[40px] leading-[52px] text-gold-light"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: 1, scale: [0.2, 1.3, 1] }}
        transition={{
          opacity: { delay: 0.1, duration: 0.04, ease: HOLD },
          /* 区間ごとに easing を指定する（§8.3: 0.2 →EASE_OUT→ 1.3 →BOUNCY→ 1）。
           * 配列の要素数はキーフレームの区間数と一致させる。 */
          scale: {
            delay: 0.1,
            times: [0, 0.48, 1],
            duration: 0.42,
            ease: ["easeOut", BOUNCE_SETTLE],
          },
        }}
      >
        CLEAR!
      </motion.p>

      {/* 達成したカード。スタンプを叩きつける */}
      <motion.div
        className="relative mt-6"
        initial={{ scale: 0.55 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.24, duration: 0.3, ease: EASE_OUT_BACK }}
      >
        <div
          className={[
            "relative h-[96px] w-[264px] border-[3px] border-ink-outline",
            design.faceClass,
          ].join(" ")}
        >
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-[3px] w-full bg-bevel-hi"
          />
          <span
            aria-hidden="true"
            className="absolute border-[3px] border-ink-outline bg-panel"
            style={{ left: 12, top: 24, width: 48, height: 48 }}
          />
          <span
            aria-hidden="true"
            className="absolute"
            style={{
              left: 18,
              top: 33,
              width: 36,
              height: 30,
              backgroundImage: categorySpriteUrl(task.category, "#f4ecd8", 3),
              backgroundRepeat: "no-repeat",
            }}
          />
          <span
            className="absolute text-[14px] leading-[22px] text-ink-inverse"
            style={{ left: 72, top: 24, width: 174 }}
          >
            {task.title}
          </span>
          <span
            className="font-num absolute text-[10px] text-ink-inverse"
            style={{ left: 72, top: 56 }}
          >
            {task.points}XP
          </span>
        </div>

        {/* スタンプ。2.4倍から叩きつけて 1 に収める */}
        <motion.span
          aria-hidden="true"
          className="absolute"
          style={{
            right: -18,
            top: -24,
            width: 72,
            height: 72,
            backgroundImage: burstStamp(72, "#ffd966"),
          }}
          initial={{ scale: 2.4, opacity: 0 }}
          animate={{ scale: [2.4, 1, 1], opacity: 1 }}
          transition={{
            opacity: { delay: 0.58, duration: 0.01, ease: HOLD },
            scale: {
              delay: 0.58,
              times: [0, 0.55, 1],
              duration: 0.22,
              ease: EASE_IN,
            },
          }}
        />
      </motion.div>

      {/* EXP バー */}
      <div className="relative mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="font-label text-[8px] text-ink-muted">EXP</span>
          <span className="flex gap-[3px] border-[3px] border-ink-outline bg-panel p-[3px]">
            {Array.from({ length: EXP_SEGMENTS }).map((_, i) => (
              <span
                key={i}
                className="block h-[15px] w-[18px]"
                style={{
                  background:
                    i < filled ? "var(--gold)" : "var(--ink-outline)",
                }}
              />
            ))}
          </span>
        </div>

        {/* +N XP が浮き上がって消える */}
        <motion.span
          className="font-num absolute -top-6 text-[16px] text-points"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: -72 }}
          transition={{
            opacity: {
              times: [0, 0.05, 0.62, 1],
              delay: 0.6,
              duration: 0.85,
              ease: HOLD,
            },
            y: { delay: 0.66, duration: 0.79, ease: "easeOut" },
          }}
        >
          +{task.points} XP
        </motion.span>
      </div>

      {/* 続行プロンプト。点滅は補間せず HOLD で切り替える */}
      <motion.p
        className="font-label pixel-blink-slow relative mt-10 text-[10px] text-ink-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.78, duration: 0.24 }}
      >
        TAP TO CONTINUE
      </motion.p>
    </div>
  );
}
