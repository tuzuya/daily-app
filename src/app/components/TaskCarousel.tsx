"use client";

import { motion, type PanInfo } from "framer-motion";
import { useCallback, useState } from "react";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";

/**
 * Today のカードカルーセル。Figma の HOME 画面に対応。
 *
 * **カードは画面下の一点を中心とした輪の上に並ぶ。**
 * 中央のカードは直立し、外側のカードほど傾く。傾きの向きは
 * 「カードの底辺が輪の中心（画面下）を向く」= 端のカードは**内向き**に倒れる。
 * 外向きに倒すと扇が裏返って見える。
 *
 * 旧版との違い:
 * - 3D遠近（perspective / rotateY / translateZ）をやめた。旧デザインの表現で、
 *   モバイルの重い表現リスト（docs/ai-dev-guide.md §8.6）にも入っている
 * - **下方向のドラッグで達成**。§8.2 のとおり 234px 落ちながら 0.4 倍に縮み、
 *   ドロップ枠の下へ潜り込んで消える
 * - ref をレンダー中に読まないようにした（旧版の `react-hooks/refs` エラー）
 */

const CARD_W = 150;
const CARD_H = 200;

/** 隣のカードとの距離 */
const PITCH = 192;
/** 1枚ぶんの角度。輪の半径はここから逆算する */
const ANGLE_STEP = 12;
const RAD = (ANGLE_STEP * Math.PI) / 180;
/** 輪の半径。R*sin(θ) = PITCH になるように取る */
const RADIUS = PITCH / Math.sin(RAD);

/** §8.2 のカード投入。落ちる距離と縮小率 */
const DROP_TRAVEL = 234;
const DROP_SCALE_MIN = 0.4;

const DRAG_PX_PER_CARD = 110;
const VELOCITY_PER_CARD = 500;
const RUBBER_BAND = 0.2;

/** 下に引っ張って達成と判定する距離 */
const DROP_THRESHOLD = 120;
/** 縦か横かを決める最小移動量。これ未満では方向を確定しない */
const AXIS_LOCK = 12;

type Axis = "none" | "x" | "y";

/** 輪の上の位置と傾き。offset は中央からの枚数（小数可） */
function seatOnWheel(offset: number) {
  const theta = offset * RAD;
  return {
    x: RADIUS * Math.sin(theta),
    y: RADIUS * (1 - Math.cos(theta)),
    // 時計回りが正。右のカードは右に倒れ、底辺が中心（下）を向く
    rotate: offset * ANGLE_STEP,
  };
}

export type TaskCarouselProps = {
  tasks: Task[];
  onSelect?: (task: Task) => void;
  /** 中央のカードを下に引き切ったとき */
  onComplete?: (task: Task) => void;
  /** 引っ張り具合（0..1）。ドロップ枠を光らせるのに使う */
  onDropProgress?: (progress: number) => void;
  /** 下のページ表示を出すか */
  showPager?: boolean;
};

export default function TaskCarousel({
  tasks,
  onSelect,
  onComplete,
  onDropProgress,
  showPager = false,
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
  const dropProgress = Math.min(1, dropY / DROP_THRESHOLD);

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
      {/*
       * **overflow を切らない。** 切るとカードがドロップ枠まで届かず、
       * 枠の手前で消えてしまう。左右のはみ出しは親側の余白で処理する。
       */}
      <div className="relative" style={{ height: CARD_H + 36 }}>
        <motion.div
          className="absolute inset-x-0 top-0 flex items-start justify-center"
          style={{ touchAction: "none", height: CARD_H }}
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

            const isCenter = abs < 0.5;
            const seat = seatOnWheel(offset);

            /* §8.2: 引っ張ると 234px 落ちながら 0.4 倍まで縮む。
             * これで枠の下へ潜り込んで見える。等速で動かすと
             * 枠を素通りしたように見えてしまう。 */
            const dropShift = isCenter ? dropProgress * DROP_TRAVEL : 0;
            const dropScale = isCenter
              ? 1 - dropProgress * (1 - DROP_SCALE_MIN)
              : 1;

            return (
              <motion.div
                key={task.id}
                className="absolute left-1/2 top-0"
                style={{
                  width: CARD_W,
                  marginLeft: -CARD_W / 2,
                  zIndex: count - Math.round(abs),
                }}
                animate={{
                  x: seat.x,
                  y: seat.y + dropShift,
                  rotate: seat.rotate,
                  scale: dropScale,
                }}
                transition={
                  dragging
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 320, damping: 30 }
                }
              >
                <TaskCard
                  task={task}
                  onPress={isCenter && axis === "none" ? onSelect : undefined}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {showPager && count > 1 && (
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
