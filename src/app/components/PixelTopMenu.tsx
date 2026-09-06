"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

/**
 * 右上の ☰ とドロップダウン。Figma の `TopMenu/Pixel` に対応。
 *
 * 旧 TopMenu は SVG の gooey フィルタで粒が融合する演出を持っていたが、
 * ピクセル調では使わないので削除した。
 *
 * ルートは持たないオーバーレイ（docs/ai-dev-guide.md §5.2）。
 * 暗幕に blur は掛けない（docs/pixel-style-guide.md §10.3）。
 */

const ITEMS = [
  { label: "ステータス", href: "/profile", tone: "normal" as const },
  { label: "ログアウト", href: "/login", tone: "danger" as const },
];

export default function PixelTopMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonId = useId();
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current) return;
      if (e.target instanceof Node && rootRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        id={buttonId}
        aria-haspopup="menu"
        aria-controls={panelId}
        aria-expanded={open}
        aria-label="メニュー"
        onClick={() => setOpen((v) => !v)}
        className={[
          "grid h-9 w-9 place-items-center border-[3px] border-ink-outline",
          // 開いている間は ☰ 自身を反転させて状態を示す
          open ? "bg-gold" : "bg-panel",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light",
        ].join(" ")}
      >
        <span className="flex flex-col gap-[3px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={[
                "block h-[3px] w-[18px]",
                open ? "bg-ink-outline" : "bg-ink",
              ].join(" ")}
            />
          ))}
        </span>
      </button>

      {open && (
        <>
          {/* 暗幕。blur は掛けない */}
          <div
            className="fixed inset-0 z-40 bg-scrim"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="menu"
            aria-labelledby={buttonId}
            className="absolute right-0 z-50 mt-3 w-[180px] border-[3px] border-ink-outline bg-panel p-3"
          >
            <span
              className="absolute left-[3px] top-[3px] block h-[3px] w-[174px] bg-bevel-hi-soft"
              aria-hidden="true"
            />
            <ul className="flex flex-col gap-3">
              {ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={[
                      "block bg-panel-raised px-3 py-2 text-[14px]",
                      item.tone === "danger" ? "text-danger" : "text-ink",
                      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
