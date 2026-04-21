"use client";

import { motion, type PanInfo } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";

const CARD_WIDTH = 140;
const CARD_GAP = 12;
const CARD_STEP = CARD_WIDTH + CARD_GAP;
const SCALE_CENTER = 1.0;
const SCALE_SIDE = 0.92; // perspective による自然な縮小と合わせるため緩め
const OPACITY_SIDE = 0.6;

// 3D奥行き設定
const PERSPECTIVE = 800; // px: 小さいほど遠近感が強い
const ROTATE_Y_PER_CARD = 18; // deg: 1枚分の傾き（端に行くほど傾く）
const ROTATE_Y_MAX = 52; // deg: 最大傾き
const DEPTH_PER_CARD = 55; // px: 1枚分の奥行き（translateZ）

const DRAG_PX_PER_CARD = 100;
const VELOCITY_PER_CARD = 500;
const RUBBER_BAND = 0.2;

// ドラッグ開始直後の抵抗ゾーン設定
// この範囲で「じわっと動き出す」感覚を演出する
const RESIST_ZONE = 35; // px: 抵抗が効く距離
const RESIST_START = 0.3; // 開始時の動きの倍率（0.3 = 30%のみ動く）

// 磁石スナップ設定
// displayIndex に非線形変換を掛けることで、x・z・回転すべてに同時に磁石効果を与える
const MAGNET_ZONE = 0.5;  // 磁石ゾーン半径（カード単位）: 0.5=常時有効、小さくすると中間は線形になる
const MAGNET_POWER = 3.0; // 磁力の強さ（1=線形/無効, 大きいほど鋭くスナップ）

/**
 * displayIndex に磁石スナップを適用する。
 *
 * 最寄りの整数位置（カード定位置）を磁石の極として、MAGNET_ZONE 以内では
 * 指数カーブで引き寄せる。これにより x・z・rotateY・scale・opacity が
 * 一枚の帯として同時に非線形スナップする。
 *
 * - ゾーン前半（現在の中央から離れ始め）: カードが粘着して離れにくい
 * - ゾーン後半（次の中央へ近づく）      : 急加速して中央へ飛び込む
 */
function applyMagnetism(rawIndex: number): number {
  const nearestInt = Math.round(rawIndex);
  const frac = rawIndex - nearestInt; // -0.5 ~ +0.5
  const absFrac = Math.abs(frac);
  if (absFrac >= MAGNET_ZONE) return rawIndex; // ゾーン外は線形のまま
  const t = absFrac / MAGNET_ZONE; // 0=定位置, 1=ゾーン境界
  return nearestInt + Math.sign(frac) * MAGNET_ZONE * Math.pow(t, MAGNET_POWER);
}

/**
 * ドラッグ量に初期抵抗を適用する
 * 開始30%の動きで「貼り付き」を表現し、その後なめらかに通常速度へ移行する
 */
function applyResistance(rawPx: number): number {
  const abs = Math.abs(rawPx);
  const t = Math.min(abs / RESIST_ZONE, 1);
  // smoothstep: 0→1 をなめらかに補間
  const ease = t * t * (3 - 2 * t);
  const factor = RESIST_START + (1 - RESIST_START) * ease;
  return Math.sign(rawPx) * abs * factor;
}

type SpringConfig = {
  stiffness: number;
  damping: number;
  mass: number;
  velocity: number;
};

/**
 * 離し時の速度に応じてスプリングを変える
 * 速い操作 → やわらかくぬるっと止まる
 * 遅い操作 → かっちり止まる
 */
function springForVelocity(velocityPx: number): SpringConfig {
  const abs = Math.abs(velocityPx);
  // 離し時のカードx速度 (px/s) をスプリングに引き継ぐ
  const cardVelocity = (velocityPx * CARD_STEP) / DRAG_PX_PER_CARD;

  if (abs > 1500) {
    // 速いフリック: 慣性が大きく、やわらかく着地
    return { stiffness: 180, damping: 22, mass: 1.2, velocity: cardVelocity };
  }
  if (abs > 600) {
    // 中速スワイプ: なめらかに収束
    return { stiffness: 240, damping: 26, mass: 1.0, velocity: cardVelocity };
  }
  // ゆっくり: キリッとスナップ
  return { stiffness: 340, damping: 32, mass: 0.9, velocity: cardVelocity };
}

export type TaskCarouselProps = {
  tasks: Task[];
  onSelect?: (task: Task) => void;
};

export default function TaskCarousel({ tasks, onSelect }: TaskCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const [snapSpring, setSnapSpring] = useState<SpringConfig>({
    stiffness: 340,
    damping: 32,
    mass: 0.9,
    velocity: 0,
  });

  const count = tasks.length;

  const clamp = useCallback(
    (idx: number) => Math.max(0, Math.min(count - 1, idx)),
    [count],
  );

  const displayIndex = applyMagnetism(activeIndex + dragOffset);

  const onDragStart = () => {
    isDragging.current = true;
  };

  const onDrag = (_: unknown, info: PanInfo) => {
    // 視覚上の動きに初期抵抗を適用（「じわっと動く」感覚）
    const resistedPx = applyResistance(info.offset.x);
    const raw = -resistedPx / DRAG_PX_PER_CARD;
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

    // スナップ先の計算は抵抗済みオフセット + 生の速度で決める
    const resistedPx = applyResistance(info.offset.x);
    const dragCards = -resistedPx / DRAG_PX_PER_CARD;
    const velocityCards = -info.velocity.x / VELOCITY_PER_CARD;
    const target = Math.round(dragCards + velocityCards);

    // 速度に応じたスプリングを設定（速度の継続性も引き継ぐ）
    setSnapSpring(springForVelocity(info.velocity.x));
    setDragOffset(0);
    setActiveIndex(clamp(activeIndex + target));
  };

  return (
    <div
      className="relative w-full"
      style={{ touchAction: "pan-y", overflow: "clip" }}
    >
      {/*
       * 共有パースペクティブコンテナ:
       * 全カードが同一の消失点を持つ 3D 空間に置かれる。
       * overflow: clip を使うことで、overflow: hidden が生むスタッキングコンテキストを
       * 回避し、preserve-3d を正しく継承させている。
       */}
      <div
        style={{
          perspective: `${PERSPECTIVE}px`,
          perspectiveOrigin: "50% 50%",
          height: CARD_WIDTH * 1.3,
          position: "relative",
        }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            touchAction: "none",
            // preserve-3d により子カードが同一 3D 空間に描画される（帯として振る舞う）
            transformStyle: "preserve-3d",
          }}
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
            const x = offset * CARD_STEP;

            const absOff = Math.abs(offset);

            // 3D: 端ほど奥へ（translateZ）
            const translateZ = -absOff * DEPTH_PER_CARD;

            // 3D: 端ほど斜めに傾く（rotateY）
            // 右カード(offset>0): 正のrotateY → 中央側(左辺)が手前、外側(右辺)が奥
            // 左カード(offset<0): 負のrotateY → 中央側(右辺)が手前、外側(左辺)が奥
            const rotateY = Math.max(
              -ROTATE_Y_MAX,
              Math.min(ROTATE_Y_MAX, offset * ROTATE_Y_PER_CARD),
            );

            const scale =
              absOff < 0.5
                ? SCALE_CENTER
                : SCALE_SIDE * Math.max(1 - absOff * 0.03, 0.75);
            const opacity =
              absOff < 0.5
                ? 1
                : Math.max(OPACITY_SIDE - absOff * 0.15, 0.1);
            const zIndex = count - Math.round(absOff);

            return (
              <motion.div
                key={task.id}
                className="absolute"
                style={{
                  width: CARD_WIDTH,
                  zIndex,
                  originX: 0.5,
                  originY: 0.5,
                  // transformPerspective は不要: 親コンテナの共有 perspective を使用
                }}
                animate={{ x, y: 0, rotateY, z: translateZ, scale, opacity }}
                transition={
                  isDragging.current
                    ? { type: "tween", duration: 0 }
                    : {
                        // x のみ velocity を引き継ぐ（慣性スライド）
                        // scale/opacity/rotateY/z に velocity を渡すと
                        // 速いフリック時に値域が狭いプロパティが大きくオーバーシュートするため分離
                        x: {
                          type: "spring",
                          stiffness: snapSpring.stiffness,
                          damping: snapSpring.damping,
                          mass: snapSpring.mass,
                          velocity: snapSpring.velocity,
                        },
                        scale:   { type: "spring", stiffness: snapSpring.stiffness, damping: snapSpring.damping, mass: snapSpring.mass },
                        opacity: { type: "spring", stiffness: snapSpring.stiffness, damping: snapSpring.damping, mass: snapSpring.mass },
                        rotateY: { type: "spring", stiffness: snapSpring.stiffness, damping: snapSpring.damping, mass: snapSpring.mass },
                        z:       { type: "spring", stiffness: snapSpring.stiffness, damping: snapSpring.damping, mass: snapSpring.mass },
                      }
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
      </div>

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
