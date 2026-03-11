"use client";

import { useEffect, useId, useRef, useState } from "react";

type TopMenuItem = {
  label: string;
  href: string;
};

export type TopMenuProps = {
  items: TopMenuItem[];
};

const ANGLES = [0, 60, 120, 180, 240, 300];
const R_CLOSED = 10;
const R_OPEN = 5.5;
const OPEN_ROTATION = 32;
const DOT = 6;

export default function TopMenu({ items }: TopMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonId = useId();
  const panelId = useId();
  const gooId = useId().replace(/:/g, "-");

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current) return;
      if (
        event.target instanceof Node &&
        rootRef.current.contains(event.target)
      )
        return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const half = DOT / 2;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        id={buttonId}
        aria-haspopup="menu"
        aria-controls={panelId}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-11 h-11 bg-slate-900/70 border border-white/15 rounded-full shadow-lg grid place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <span className="relative block w-[30px] h-[30px]">
          <span
            className="absolute inset-0"
            style={{ filter: `url(#goo-${gooId})` }}
          >
            {/* Center dot */}
            <span
              className="absolute rounded-full bg-white"
              style={{
                width: DOT,
                height: DOT,
                left: `calc(50% - ${half}px)`,
                top: `calc(50% - ${half}px)`,
              }}
            />

            {/* Orbiting dots */}
            {ANGLES.map((base) => {
              const deg = open ? base + OPEN_ROTATION : base;
              const r = open ? R_OPEN : R_CLOSED;
              const rad = (deg * Math.PI) / 180;
              const x = Math.cos(rad) * r;
              const y = Math.sin(rad) * r;

              return (
                <span
                  key={base}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: DOT,
                    height: DOT,
                    left: `calc(50% - ${half}px)`,
                    top: `calc(50% - ${half}px)`,
                    transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`,
                    transition:
                      "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              );
            })}
          </span>
        </span>
      </button>

      {/* Gooey SVG filter */}
      <svg
        className="absolute"
        style={{ width: 0, height: 0 }}
        aria-hidden="true"
      >
        <defs>
          <filter id={`goo-${gooId}`}>
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="2.2"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Dropdown panel */}
      <div
        id={panelId}
        role="menu"
        aria-labelledby={buttonId}
        className={[
          "absolute right-0 mt-3 w-52 origin-top-right rounded-2xl border border-white/15 bg-slate-950/70 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.45)] p-2",
          "transition-[transform,opacity] duration-200 ease-out",
          open
            ? "opacity-100 scale-100"
            : "pointer-events-none opacity-0 scale-[0.98]",
        ].join(" ")}
      >
        <div className="absolute -top-2 right-3 h-3 w-3 rotate-45 border border-white/15 bg-slate-950/70 backdrop-blur-xl" />

        {items.map((item) => (
          <a
            key={`${item.href}-${item.label}`}
            href={item.href}
            role="menuitem"
            className="block rounded-xl px-3 py-2 text-sm text-slate-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            onClick={() => setOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
