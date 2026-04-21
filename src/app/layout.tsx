import type { Metadata, Viewport } from "next";
import { cn } from "@/lib/utils";
import GooeyNav from "./components/GooeyNav";
import TopMenu from "./components/TopMenu";
import SpaceNavigator from "./components/SpaceNavigator";
import FallbackMain from "./components/FallbackMain";
import "./global.css";

const navItems = [
  { label: "Today", href: "/today" },
  { label: "Next", href: "/next" },
  { label: "Overdue", href: "/overdue" },
  { label: "Buffs", href: "/buffs" },
];

const topMenuItems = [{ label: "Profile", href: "/profile" }];

export const metadata: Metadata = {
  title: "Cyber Todo",
  description: "My futuristic daily tracker",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={cn("font-sans")}>
      <body className="relative bg-white text-slate-900 overflow-hidden font-sans h-[100dvh]">
        {/* 1) 最背面：固定の背景エフェクト（静的グラデーション） */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 120% 85% at 50% -10%, rgba(255,255,255,0.97) 0%, rgba(242,242,244,0.92) 52%, rgba(209,212,218,0.72) 100%)",
              "linear-gradient(140deg, rgba(255,255,255,0.92) 0%, rgba(226,230,236,0.7) 37%, rgba(187,193,202,0.62) 56%, rgba(244,246,250,0.84) 72%, rgba(255,255,255,0.95) 100%)",
              "radial-gradient(circle at 16% 22%, rgba(20,20,22,0.2) 0%, rgba(20,20,22,0) 38%)",
              "radial-gradient(circle at 84% 76%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 42%)",
              "radial-gradient(ellipse 70% 32% at 50% 8%, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.05) 68%)",
            ].join(", "),
          }}
        />

        {/* 2) 空間ナビゲーター：タブ画面をカメラ移動で切り替え */}
        <SpaceNavigator />

        {/* 3) フォールバック：SpaceNavigator外のルート（/profile等） */}
        <FallbackMain>{children}</FallbackMain>

        {/* 4) 最前面：フローティングUI（ヘッダ/タブ） */}
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between">
          <header className="p-4 flex justify-end pointer-events-auto">
            <TopMenu items={topMenuItems} />
          </header>

          <nav className="px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex justify-center pointer-events-auto">
            <GooeyNav items={navItems} initialActiveIndex={0} />
          </nav>
        </div>
      </body>
    </html>
  );
}
