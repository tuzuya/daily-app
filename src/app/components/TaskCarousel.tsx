"use client";

import { motion, type PanInfo } from "framer-motion";
import { useCallback, useState } from "react";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";

/**
 * Today のカードカルーセル。Figma の HOME 画面に対応。
 *
 * 旧版との違い:
 * - **3D遠近（perspective / rotateY / translateZ）をやめた。** 旧デザインの表現で、
 *   モバイルの重い表現リスト（docs/ai-dev-guide.md §8.6）にも入っている。
 *   ピクセル版は 2D の回転とオフセットだけで扇状に見せる
 * - **下方向のドラッグで達成**する導線を足した。これが完了の唯一の操作
 *   （docs/pixel-style-guide.md §10.2）
 * - ref をレンダー中に読まないようにした（旧版の `react-hooks/refs` エラー）
 */

const CARD_W = 150;
const PITCH = 192; // 隣のカードまでの距離
const TILT = 10; // 端のカードの傾き（度）
const SIDE_DROP = 30; // 端のカードを下げる量

const DRAG_PX_PER_CARD = 110;
const VELOCITY_PER_CARD = 500;
const RUBBER_BAND = 0.2;

/** 下に引っ張って達成と判定する距離 */
const DROP_THRESHOLD = 120;
/** 縦か横かを決める最小移動量。これ未満では方向を確定しない */
const AXIS_LOCK = 12;

type Axis = "none" | "x" | "y";

export type TaskCarouselProps = {
  tasks: Task[];
  onSelect?: (task: Task) => void;
  /** 中央のカードを下に引き切ったとき */
  onComplete?: (task: Task) => void;
  /** 引っ張り具合（0..1）。ドロップ枠を光らせるのに使う */
  onDropProgress?: (progress: number) => void;
};

export default function TaskCarousel({
  tasks,
  onSelect,
  onComplete,
  onDropProgress,
}: TaskCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dropY, setDropY] = useState(0);
  const [axis, setAxis] = useState<Axis>("none");
  const [dragging, setDragging] = useState(false);

  const count = tasks.length;
  const clamp = useCallback(
    (i: number) => Math.max(0, Math.min(count - 1, i)),
    [count],
  );

  const displayIndex = activeIndex + dragOffset;

  const reset = () => {
    setDragOffset(0);
    setDropY(0);
    setAxis("none");
    setDragging(false);
    onDropProgress?.(0);
  };

  const onDragStart = () => setDragging(true);

  const onDrag = (_: unknown, info: PanInfo) => {
    // 最初の一定量で縦横どちらの操作かを確定させる。
    // 決めないと、斜めに動かしたときカルーセルと達成が同時に反応する
    let current = axis;
    if (current === "none") {
      const { x, y } = info.offset;
      if (Math.abs(x) < AXIS_LOCK && Math.abs(y) < AXIS_LOCK) return;
      current = Math.abs(y) > Math.abs(x) ? "y" : "x";
      setAxis(current);
    }

    if (current === "x") {
      const raw = -info.offset.x / DRAG_PX_PER_CARD;
      const target = activeIndex + raw;
      let adjusted = target;
      // 端では抵抗を掛けて、これ以上無いことを手応えで伝える
      if (target < 0) adjusted = target * RUBBER_BAND;
      else if (target > count - 1) {
        adjusted = count - 1 + (target - (count - 1)) * RUBBER_BAND;
      }
      setDragOffset(adjusted - activeIndex);
      return;
    }

    // 下方向のみ。上に引いても何も起きない
    const y = Math.max(0, info.offset.y);
    setDropY(y);
    onDropProgress?.(Math.min(1, y / DROP_THRESHOLD));
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (axis === "y") {
      if (info.offset.y >= DROP_THRESHOLD && tasks[activeIndex]) {
        onComplete?.(tasks[activeIndex]);
      }
      reset();
      return;
    }

    if (axis === "x") {
      const dragCards = -info.offset.x / DRAG_PX_PER_CARD;
      const velocityCards = -info.velocity.x / VELOCITY_PER_CARD;
      const next = clamp(activeIndex + Math.round(dragCards + velocityCards));
      setActiveIndex(next);
    }
    reset();
  };

  if (count === 0) return null;

  return (
    <div className="relative w-full" style={{ touchAction: "pan-y" }}>
      <div className="relative h-[236px] overflow-hidden">
        <motion.div
          className="absolute inset-0 flex items-start justify-center"
          style={{ touchAction: "none" }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
        >
          {tasks.map((task, i) => {
            const offset = i - displayIndex;
            const abs = Math.abs(offset);
            if (abs > 2) return null; // 見えないカードは描かない

            const isCenter = Math.abs(offset) < 0.5;
            const x = offset * PITCH;
            const y =
              Math.min(abs, 1) * SIDE_DROP + (isCenter ? dropY : 0);
            const rotate = Math.max(-TILT, Math.min(TILT, -offset * TILT));

            return (
              <motion.div
                key={task.id}
                className="absolute"
                style={{ width: CARD_W, zIndex: count - Math.round(abs) }}
                animate={{ x, y, rotate }}
                transition={
                  dragging
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 320, damping: 30 }
                }
              >
                <TaskCard
                  task={task}
                  onPress={
                    isCenter && axis === "none" ? onSelect : undefined
                  }
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ページ表示。丸ではなく角のある四角（ピクセルUIに丸みは使わない） */}
      {count > 1 && (
        <div className="mt-2 flex justify-center gap-[6px]">
          {tasks.map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-label={`${i + 1}枚目`}
              onClick={() => setActiveIndex(clamp(i))}
              className={[
                "h-[9px]",
                i === activeIndex ? "w-[30px] bg-gold" : "w-[9px] bg-ink-faint",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
