"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type GooeyNavItem = {
  label: string;
  href: string;
};

export type GooeyNavProps = {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
};

type Particle = {
  start: [number, number];
  end: [number, number];
  time: number;
  scale: number;
  color: number;
  rotate: number;
};

const noise = (n = 1): number => n / 2 - Math.random() * n;

const getXY = (
  distance: number,
  pointIndex: number,
  totalPoints: number
): [number, number] => {
  const angle =
    ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
  return [distance * Math.cos(angle), distance * Math.sin(angle)];
};

const createParticle = (
  index: number,
  time: number,
  distances: [number, number],
  radius: number,
  count: number,
  colors: number[]
): Particle => {
  const baseRotate = noise(radius / 10);

  return {
    start: getXY(distances[0], count - index, count),
    end: getXY(distances[1] + noise(7), count - index, count),
    time,
    scale: 1 + noise(0.2),
    color: colors[Math.floor(Math.random() * colors.length)] ?? 1,
    rotate:
      baseRotate > 0
        ? (baseRotate + radius / 20) * 10
        : (baseRotate - radius / 20) * 10,
  };
};

const clampIndex = (index: number, max: number): number => {
  if (max < 0) return 0;
  return Math.max(0, Math.min(index, max));
};

const normalizeHref = (href: string): string => {
  if (href.startsWith("/")) return href;
  return `/${href}`;
};

const normalizePath = (value: string): string => {
  const trimmed = value.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
};

const GooeyNav = ({
  items,
  animationTime = 500,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 300,
  timeVariance = 400,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
}: GooeyNavProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);
  const filterRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    clampIndex(initialActiveIndex, items.length - 1)
  );
  const safeActiveIndex = clampIndex(activeIndex, items.length - 1);
  const routeIndex = items.findIndex(
    (item) => normalizePath(normalizeHref(item.href)) === normalizePath(pathname)
  );
  const currentIndex = routeIndex !== -1 ? routeIndex : safeActiveIndex;

  const makeParticles = (element: HTMLElement) => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty("--time", `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i += 1) {
      const time = animationTime * 2 + noise(timeVariance * 2);
      const particleData = createParticle(i, time, d, r, particleCount, colors);

      element.classList.remove("active");

      window.setTimeout(() => {
        const particle = document.createElement("span");
        const point = document.createElement("span");

        particle.classList.add("particle");
        particle.style.setProperty("--start-x", `${particleData.start[0]}px`);
        particle.style.setProperty("--start-y", `${particleData.start[1]}px`);
        particle.style.setProperty("--end-x", `${particleData.end[0]}px`);
        particle.style.setProperty("--end-y", `${particleData.end[1]}px`);
        particle.style.setProperty("--time", `${particleData.time}ms`);
        particle.style.setProperty("--scale", `${particleData.scale}`);
        
        particle.style.setProperty(
          "--color",
          `var(--color-${particleData.color}, white)`
        );
        particle.style.setProperty("--rotate", `${particleData.rotate}deg`);

        point.classList.add("point");
        particle.appendChild(point);
        element.appendChild(particle);

        requestAnimationFrame(() => {
          element.classList.add("active");
        });

        window.setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // Keep going even if particle is already gone.
          }
        }, time);
      }, 30);
    }
  };

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) {
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };

    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.textContent = element.textContent ?? "";
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    event.preventDefault();
    const listItem = event.currentTarget.parentElement;
    const selectedItem = items[index];
    if (!(listItem instanceof HTMLElement) || !selectedItem) return;

    if (currentIndex !== index) {
      setActiveIndex(index);
      updateEffectPosition(listItem);

      if (filterRef.current) {
        const particles = filterRef.current.querySelectorAll(".particle");
        particles.forEach((particle) => {
          try {
            filterRef.current?.removeChild(particle);
          } catch {
            // Ignore stale nodes.
          }
        });
      }

      if (textRef.current) {
        textRef.current.classList.remove("active");
        void textRef.current.offsetWidth;
        textRef.current.classList.add("active");
      }

      if (filterRef.current) {
        makeParticles(filterRef.current);
      }
    }

    router.push(normalizeHref(selectedItem.href));
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLAnchorElement>,
    index: number
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    const listItem = event.currentTarget.parentElement;
    const selectedItem = items[index];
    if (!(listItem instanceof HTMLElement) || !selectedItem) return;

    if (currentIndex !== index) {
      setActiveIndex(index);
      updateEffectPosition(listItem);

      if (filterRef.current) {
        const particles = filterRef.current.querySelectorAll(".particle");
        particles.forEach((particle) => {
          try {
            filterRef.current?.removeChild(particle);
          } catch {
            // Ignore stale nodes.
          }
        });
      }

      if (textRef.current) {
        textRef.current.classList.remove("active");
        void textRef.current.offsetWidth;
        textRef.current.classList.add("active");
      }

      if (filterRef.current) {
        makeParticles(filterRef.current);
      }
    }

    router.push(normalizeHref(selectedItem.href));
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;

    const activeLi = navRef.current.querySelectorAll("li")[currentIndex];

    if (activeLi instanceof HTMLElement) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add("active");
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll("li")[currentIndex];
      if (currentActiveLi instanceof HTMLElement) {
        updateEffectPosition(currentActiveLi);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentIndex, items.length]);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <style>
        {`
          :root {
            --linear-ease: linear(
              0,
              0.068,
              0.19 2.7%,
              0.804 8.1%,
              1.037,
              1.199 13.2%,
              1.245,
              1.27 15.8%,
              1.274,
              1.272 17.4%,
              1.249 19.1%,
              0.996 28%,
              0.949,
              0.928 33.3%,
              0.926,
              0.933 36.8%,
              1.001 45.6%,
              1.013,
              1.019 50.8%,
              1.018 54.4%,
              1 63.1%,
              0.995 68%,
              1.001 85%,
              1
            );
          }

          .gooey-nav-container {
            position: relative;
          }

          .gooey-nav-container nav {
            display: flex;
            position: relative;
            transform: translate3d(0, 0, 0.01px);
          }

          .gooey-nav-container nav ul {
            display: flex;
            gap: 2em;
            list-style: none;
            padding: 0 1em;
            margin: 0;
            position: relative;
            z-index: 3;
            color: white;
            text-shadow: 0 1px 1px hsl(205deg 30% 10% / 0.2);
          }

          .gooey-nav-container nav ul li {
            border-radius: 100vw;
            position: relative;
            cursor: pointer;
            transition:
              background-color 0.3s ease,
              color 0.3s ease,
              box-shadow 0.3s ease;
            box-shadow: 0 0 0.5px 1.5px transparent;
            color: white;
          }

          .gooey-nav-container nav ul li a {
            display: inline-block;
            padding: 0.6em 1em;
          }

          .gooey-nav-container nav ul li:focus-within:has(:focus-visible) {
            box-shadow: 0 0 0.5px 1.5px white;
          }

          .gooey-nav-container nav ul li::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 10px;
            background: white;
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s ease;
            z-index: -1;
          }

          .gooey-nav-container nav ul li.active {
            color: black;
            text-shadow: none;
          }

          .gooey-nav-container nav ul li.active::after {
            opacity: 1;
            transform: scale(1);
          }

          .gooey-nav-container .effect {
            position: absolute;
            left: 0;
            top: 0;
            width: 0;
            height: 0;
            opacity: 1;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 1;
          }

          .gooey-nav-container .effect.text {
            color: white;
            transition: color 0.3s ease;
          }

          .gooey-nav-container .effect.text.active {
            color: black;
          }

          .gooey-nav-container .effect.filter {
            filter: url("#gooey");
          }

          .gooey-nav-container .effect.filter::after {
            content: "";
            position: absolute;
            inset: 0;
            background: white;
            transform: scale(0);
            opacity: 0;
            z-index: -1;
            border-radius: 100vw;
          }

          .gooey-nav-container .effect.active::after {
            animation: pill 0.3s ease both;
          }

          .particle,
          .point {
            display: block;
            opacity: 0;
            width: 25px;
            height: 25px;
            border-radius: 100%;
            transform-origin: center;
          }

          .particle {
            --time: 5s;
            position: absolute;
            top: calc(50% - 8px);
            left: calc(50% - 8px);
            animation: particle calc(var(--time)) ease 1 -350ms;
          }

          .point {
            background: var(--color);
            opacity: 1;
            animation: point calc(var(--time)) ease 1 -350ms;
          }

          @keyframes pill {
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes particle {
            0% {
              transform: rotate(0deg)
                translate(calc(var(--start-x)), calc(var(--start-y)));
              opacity: 1;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }

            70% {
              transform: rotate(calc(var(--rotate) * 0.5))
                translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
              opacity: 1;
              animation-timing-function: ease;
            }

            85% {
              transform: rotate(calc(var(--rotate) * 0.66))
                translate(calc(var(--end-x)), calc(var(--end-y)));
              opacity: 1;
            }

            100% {
              transform: rotate(calc(var(--rotate) * 1.2))
                translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
              opacity: 1;
            }
          }

          @keyframes point {
            0% {
              transform: scale(0);
              opacity: 0;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }

            25% {
              transform: scale(calc(var(--scale) * 0.25));
            }

            38% {
              opacity: 1;
            }

            65% {
              transform: scale(var(--scale));
              opacity: 1;
              animation-timing-function: ease;
            }

            85% {
              transform: scale(var(--scale));
              opacity: 1;
            }

            100% {
              transform: scale(0);
              opacity: 0;
            }
          }
        `}
      </style>

      <div className="gooey-nav-container" ref={containerRef}>
        <nav>
          <ul ref={navRef}>
            {items.map((item, index) => (
              <li key={`${item.href}-${item.label}-${index}`} className={currentIndex === index ? "active" : ""}>
                <a
                  href={normalizeHref(item.href)}
                  onClick={(event) => handleClick(event, index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <span className="effect filter" ref={filterRef} />
        <span className="effect text" ref={textRef} />
      </div>

      {/* ▼▼▼ 液体の融合を計算する透明な魔法陣 ▼▼▼ */}
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true" focusable="false">
        <defs>
          <filter id="gooey">
            {/* 1. 液体の「芯」を作るためのベースのぼかし */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            
            {/* 2. 輪郭をパキッとさせて液体のスライム感を出す（Core層） */}
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="gooeyCore" />
            
            {/* 3. 元のパーティクルを大きくぼかして「光のオーラ」を作る（Glow層） */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="glow" />
            
            {/* 4. 光のオーラの上に、液体の芯を重ね合わせて完成！ */}
            <feMerge>
              <feMergeNode in="glow" />      {/* 背面：ネオンの光 */}
              <feMergeNode in="gooeyCore" /> {/* 前面：液体の本体 */}
            </feMerge>
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default GooeyNav;
