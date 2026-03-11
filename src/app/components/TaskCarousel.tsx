"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  type PanInfo,
} from "framer-motion";
import { useCallback, useRef, useState } from "react";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";

const CARD_W = 200;
const CARD_GAP = 16;
const STEP = CARD_W + CARD_GAP;
const ROTATE_DEG = 45;
const DEPTH_PX = 180;
const SCALE_CENTER = 1;
const SCALE_SIDE = 0.82;
const OPACITY_SIDE = 0.55;
const SWIPE_THRESHOLD = 40;

export type TaskCarouselProps = {
  tasks: Task[];
  onSelect?: (task: Task) => void;
};

export default function TaskCarousel({ tasks, onSelect }: TaskCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragX = useMotionValue(0);
  const springX = useSpring(0, { stiffness: 300, damping: 30 });
  const isDragging = useRef(false);

  const count = tasks.length;

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(count - 1, idx));
      setActiveIndex(clamped);
      springX.set(-clamped * STEP);
    },
    [count, springX],
  );

  const onDragStart = () => {
    isDragging.current = true;
    dragX.set(0);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    isDragging.current = false;
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    let dir = 0;
    if (Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 300) {
      dir = offset > 0 ? -1 : 1;
    }
    goTo(activeIndex + dir);
  };

  return (
    <div
      className="relative w-full overflow-visible"
      style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}
      onPointerDownCapture={(e) => e.stopPropagation()}
    >
      <motion.div
        className="flex items-center justify-center"
        style={{ height: CARD_W + 40 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {tasks.map((task, i) => {
          const offset = i - activeIndex;

          const rotateY = clamp(offset * ROTATE_DEG, -70, 70);
          const translateX = offset * STEP;
          const translateZ = -Math.abs(offset) * DEPTH_PX;
          const scale = offset === 0 ? SCALE_CENTER : SCALE_SIDE;
          const opacity = offset === 0 ? 1 : Math.max(OPACITY_SIDE - Math.abs(offset) * 0.15, 0.15);
          const zIndex = count - Math.abs(offset);

          return (
            <motion.div
              key={task.id}
              className="absolute"
              style={{ width: CARD_W, zIndex }}
              animate={{
                x: translateX,
                z: translateZ,
                rotateY,
                scale,
                opacity,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
              }}
              onClick={() => {
                if (isDragging.current) return;
                if (offset !== 0) {
                  goTo(i);
                }
              }}
            >
              <div style={{ transformStyle: "preserve-3d" }}>
                <TaskCard
                  task={task}
                  onPress={offset === 0 ? onSelect : undefined}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Dot indicators */}
      {count > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
