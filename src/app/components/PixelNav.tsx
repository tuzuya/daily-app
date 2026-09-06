"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 下部のタブナビ。Figma の `NavItem/Pixel` に対応。
 *
 * 旧 GooeyNav（SVGフィルタで融合する液体風エフェクト）の置き換え。
 * ピクセル調では滑らかな融合も粒子も使わないため、フィルタごと不要になった。
 *
 * 旧実装は `useState` でアクティブ位置を持っていて
 * `react-hooks/set-state-in-effect` の lint エラーが出ていたが、
 * アクティブ位置は `usePathname()` から導けるので state 自体が要らない。
 */

const ITEMS = [
  { label: "TODAY", href: "/today" },
  { label: "NEXT", href: "/next" },
  { label: "OVERDUE", href: "/overdue" },
  { label: "BUFFS", href: "/buffs" },
] as const;

const normalize = (v: string) => {
  const trimmed = v.replace(/\/+$/, "");
  return trimmed === "" ? "/today" : trimmed;
};

export default function PixelNav() {
  const pathname = normalize(usePathname());

  return (
    <nav
      className="border-t-[3px] border-ink-outline bg-panel pb-[max(12px,env(safe-area-inset-bottom))] pt-3"
      aria-label="メインナビゲーション"
    >
      <ul className="flex justify-center gap-[6px] px-3">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "font-label relative block w-[87px] py-[15px] text-center text-[10px]",
                  "border-[3px] border-ink-outline",
                  // 選択中は色を反転させる（Figma の NavItem/Pixel と同じ規則）
                  active
                    ? "bg-gold text-ink-inverse"
                    : "bg-panel-raised text-ink-muted",
                  // ベベルの明るい辺。光源は左上
                  "before:absolute before:left-0 before:top-0 before:h-[3px] before:w-full before:content-['']",
                  active ? "before:bg-bevel-hi" : "before:bg-bevel-hi-soft",
                  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-light",
                ].join(" ")}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
