"use client";

import { usePathname } from "next/navigation";
import { routeSpace } from "./page-space";

export default function FallbackMain({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const effectivePath = pathname === "/" ? "/today" : pathname;
  const isSpaceRoute = effectivePath in routeSpace;

  if (isSpaceRoute) return null;

  return (
    <main className="relative z-[5] h-screen overflow-y-auto px-4 pt-20 pb-28">
      {children}
    </main>
  );
}
