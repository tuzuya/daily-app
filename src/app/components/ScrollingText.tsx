"use client";

import { useEffect, useState } from "react";

const CYCLE_MS = 3800;

const textLine1 = [
  "DO IT NOW.",
  "MAKE IT HAPPEN.",
  "STAY FOCUSED.",
  "BUILD THE FUTURE.",
  "BELIEVE IN YOURSELF.",
  "KEEP MOVING.",
];

const textLine2 = [
  "DREAMS DON'T WORK UNLESS YOU DO.",
  "CREATE YOUR OWN REALITY.",
  "NEVER GIVE UP.",
  "LIMITS EXIST ONLY IN THE MIND.",
  "ACHIEVE GREATNESS.",
];

function usePhraseIndex(total: number, cycleMs: number, initialIndex: number) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (total <= 1) return;

    const timerId = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, cycleMs);

    return () => window.clearInterval(timerId);
  }, [cycleMs, total]);

  return index;
}

export function ScrollingText() {
  const line1Index = usePhraseIndex(textLine1.length, CYCLE_MS, 0);
  const line2Index = usePhraseIndex(textLine2.length, CYCLE_MS, 0);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-x-0 top-[15%] overflow-hidden">
        <span
          key={`line1-${line1Index}`}
          className="motivation-burst motivation-forward block whitespace-nowrap px-4 text-[15vw] font-black uppercase leading-none tracking-tighter text-white/14"
        >
          {textLine1[line1Index]}
        </span>
      </div>

      <div className="absolute inset-x-0 top-[45%] overflow-hidden">
        <span
          key={`line2-${line2Index}`}
          className="motivation-burst motivation-reverse block whitespace-nowrap px-4 text-[15vw] font-black uppercase leading-none tracking-tighter text-white/14"
        >
          {textLine2[line2Index]}
        </span>
      </div>
    </div>
  );
}