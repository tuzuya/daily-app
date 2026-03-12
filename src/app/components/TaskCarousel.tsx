"use client";

import { motion, type PanInfo } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";

const CARD_SIZE = 125;
const ARC_RADIUS = 250;
const ANGLE_STEP = 0.42;
const SCALE_CENTER = 1.08;
const SCALE_SIDE = 0.82;
const OPACITY_SIDE = 0.85;
const SWIPE_THRESHOLD = 30;

export type TaskCarouselProps = {
  tasks: Task[];
  onSelect?: (task: Task) => void;
};

export default function TaskCarousel({ tasks, onSelect }: TaskCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isDragging = useRef(false);

  const count = tasks.length;

  const goTo = useCallback(
    (idx: number) => {
      setActiveIndex(Math.max(0, Math.min(count - 1, idx)));
    },
    [count],
  );

  const onDragStart = () => {
    isDragging.current = true;
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    isDragging.current = false;
    const { x: ox } = info.offset;
    const { x: vx } = info.velocity;

    let dir = 0;
    if (Math.abs(ox) > SWIPE_THRESHOLD || Math.abs(vx) > 300) {
      dir = ox > 0 ? -1 : 1;
    }
    goTo(activeIndex + dir);
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ touchAction: "pan-y" }}
    >
      <motion.div
        className="relative flex items-start justify-center"
        style={{ height: ARC_RADIUS * 1.1 + CARD_SIZE, touchAction: "none" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {tasks.map((task, i) => {
          const offset = i - activeIndex;
          const angle = offset * ANGLE_STEP;

          const x = ARC_RADIUS * Math.sin(angle);
          const y = ARC_RADIUS * (1 - Math.cos(angle));
          const rotateDeg = angle * (180 / Math.PI);

          const absOff = Math.abs(offset);
          const scale =
            absOff === 0
              ? SCALE_CENTER
              : SCALE_SIDE * Math.max(1 - absOff * 0.06, 0.6);
          const opacity =
            absOff === 0
              ? 1
              : Math.max(OPACITY_SIDE - absOff * 0.08, 0.15);
          const zIndex = count - absOff;

          return (
            <motion.div
              key={task.id}
              className="absolute"
              style={{
                width: CARD_SIZE,
                zIndex,
                originX: 0.5,
                originY: 0,
              }}
              animate={{ x, y, rotate: rotateDeg, scale, opacity }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={() => {
                if (isDragging.current) return;
                if (offset !== 0) goTo(i);
              }}
            >
              <TaskCard
                task={task}
                onPress={offset === 0 ? onSelect : undefined}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {count > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {tasks.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={[
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIndex
                  ? "w-5 bg-white/70"
                  : "w-1.5 bg-white/25 hover:bg-white/40",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
