"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { routeSpace } from "./page-space";

type PageTransitionProps = {
  children: React.ReactNode;
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  const prevPath = prevPathRef.current ?? pathname;
  const from = routeSpace[prevPath] ?? { x: 0, y: 0 };
  const to = routeSpace[pathname] ?? { x: 0, y: 0 };

  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const factor = 90;
  const initialX = -dx * factor;
  const initialY = -dy * factor;

  prevPathRef.current = pathname;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{
          opacity: 0,
          x: initialX,
          y: initialY,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          x: dx * factor * 0.4,
          y: dy * factor * 0.4,
          scale: 1.02,
        }}
        transition={{
          duration: 0.38,
          ease: [0.2, 0.8, 0.2, 1],
        }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

