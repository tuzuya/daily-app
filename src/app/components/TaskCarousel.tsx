"use client";

import { motion, type PanInfo } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";

const CARD_SIZE = 125;
const ARC_RADIUS = 400;
const ANGLE_STEP = 0.42;
const SCALE_CENTER = 1.08;
const SCALE_SIDE = 0.82;
const OPACITY_SIDE = 0.85;

const DRAG_PX_PER_CARD = 100;
const VELOCITY_PER_CARD = 500;
const RUBBER_BAND = 0.2;

export type TaskCarouselProps = {
  tasks: Task[];
  onSelect?: (task: Task) => void;
};

export default function TaskCarousel({ tasks, onSelect }: TaskCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);

  const count = tasks.length;

  const clamp = useCallback(
    (idx: number) => Math.max(0, Math.min(count - 1, idx)),
    [count],
  );

  const displayIndex = activeIndex + dragOffset;

  const onDragStart = () => {
    isDragging.current = true;
  };

  const onDrag = (_: unknown, info: PanInfo) => {
    const raw = -info.offset.x / DRAG_PX_PER_CARD;
    const target = activeIndex + raw;

    let adjusted: number;
    if (target < 0) {
      adjusted = target * RUBBER_BAND;
    } else if (target > count - 1) {
      adjusted = count - 1 + (target - (count - 1)) * RUBBER_BAND;
    } else {
      adjusted = target;
    }
    setDragOffset(adjusted - activeIndex);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    isDragging.current = false;
    const dragCards = -info.offset.x / DRAG_PX_PER_CARD;
    const velocityCards = -info.velocity.x / VELOCITY_PER_CARD;
    const target = Math.round(dragCards + velocityCards);

    setDragOffset(0);
    setActiveIndex(clamp(activeIndex + target));
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ touchAction: "pan-y" }}
    >
      <motion.div
        className="relative flex items-start justify-center"
        style={{ height: 100 * 1.1 + CARD_SIZE, touchAction: "none" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
      >
        {tasks.map((task, i) => {
          const offset = i - displayIndex;
          const angle = offset * ANGLE_STEP;

          const x = ARC_RADIUS * Math.sin(angle);
          const y = ARC_RADIUS * (1 - Math.cos(angle));
          const rotateDeg = angle * (180 / Math.PI);

          const absOff = Math.abs(offset);
          const scale =
            absOff < 0.5
              ? SCALE_CENTER
              : SCALE_SIDE * Math.max(1 - absOff * 0.06, 0.6);
          const opacity =
            absOff < 0.5
              ? 1
              : Math.max(OPACITY_SIDE - absOff * 0.08, 0.15);
          const zIndex = count - Math.round(absOff);

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
              transition={
                isDragging.current
                  ? { type: "tween", duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 28 }
              }
              onClick={() => {
                if (isDragging.current) return;
                if (Math.round(offset) !== 0) setActiveIndex(clamp(i));
              }}
            >
              <TaskCard
                task={task}
                onPress={Math.abs(offset) < 0.5 ? onSelect : undefined}
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
              onClick={() => setActiveIndex(clamp(i))}
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
