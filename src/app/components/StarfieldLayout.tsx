"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";

/**
 * task.id + ソルト値 → [0, 1) の安定した疑似乱数
 * 同じ task.id には常に同じ値が返るため、再レンダリングでカードが飛び跳ねない
 */
function seededRnd(id: string, salt: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  h = (h ^ (salt * 2654435761)) | 0;
  const v = Math.sin(h) * 43758.5453123;
  return v - Math.floor(v);
}

/**
 * 深度レイヤー設定:
 * 遠景ほどカードが小さく・淡く・大きく傾く（奥行き感を演出）
 */
const LAYERS = [
  { scale: 0.66, opacity: 0.48, maxRotation: 20, zIndex: 1 }, // 遠景
  { scale: 0.83, opacity: 0.72, maxRotation: 12, zIndex: 2 }, // 中景
  { scale: 1.00, opacity: 1.00, maxRotation:  6, zIndex: 3 }, // 近景
] as const;

const BASE_CARD_W = 120; // 近景カード幅 (px)
const SAFE_X = 10; // 左右の安全マージン (px)
const SAFE_Y = 6;  // 上下の安全マージン (px)

export type StarfieldLayoutProps = {
  tasks: Task[];
  onSelect?: (task: Task) => void;
};

export default function StarfieldLayout({ tasks, onSelect }: StarfieldLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // カード配置データをメモ化（size/tasks が変わらない限り再計算しない）
  const cards = useMemo(() => {
    if (!size.w || !size.h) return [];
    return tasks.map((task) => {
      const r1 = seededRnd(task.id, 1);
      const r2 = seededRnd(task.id, 2);
      const r3 = seededRnd(task.id, 3);
      const r4 = seededRnd(task.id, 4);

      const layer = LAYERS[Math.floor(r4 * 3)]!;
      const cardW = BASE_CARD_W * layer.scale;
      const cardH = cardW / 0.75;

      const x = SAFE_X + r1 * Math.max(0, size.w - SAFE_X * 2 - cardW);
      const y = SAFE_Y + r2 * Math.max(0, size.h - SAFE_Y * 2 - cardH);
      const rotation = (r3 - 0.5) * 2 * layer.maxRotation;
      // フェードインの遅延: 位置ベースでばらばらに（最大 0.35s）
      const delay = (r1 * 0.5 + r2 * 0.2) * 0.35;

      return { task, x, y, cardW, cardH, layer, rotation, delay };
    });
  }, [tasks, size]);

  return (
    <div
      ref={containerRef}
      /*
       * h-full (height: 100%) は flex-1 の子では一部モバイルブラウザで
       * viewport 全高を参照してしまう場合があるため、
       * absolute inset-0 で positioned ancestor（relative な flex-1 親）を
       * 確実に占有する方式に変更。
       * overflow-hidden はカードが万一はみ出した際の安全クリップ。
       */
      className="absolute inset-0 overflow-hidden"
    >
      {cards.map(({ task, x, y, cardW, layer, rotation, delay }) => (
        <motion.div
          key={task.id}
          className="absolute"
          style={{
            left: x,
            top: y,
            width: cardW,
            zIndex: layer.zIndex,
          }}
          /*
           * scale アニメーションを廃止:
           *   scale を毎フレーム変化させると filter: drop-shadow を持つ要素を
           *   フレームごとに再コンポジットするため GPU 負荷が高い。
           *   rotate も initial と animate を同値にして静止させ、
           *   opacity フェードのみに絞ることで最軽量の演出にする。
           */
          initial={{ opacity: 0, rotate: rotation }}
          animate={{ opacity: layer.opacity, rotate: rotation }}
          transition={{ delay, duration: 0.45, ease: "easeOut" }}
        >
          <TaskCard task={task} onPress={onSelect} />
        </motion.div>
      ))}
    </div>
  );
}
