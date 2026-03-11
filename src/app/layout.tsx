import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import GooeyNav from "./components/GooeyNav";
import TopMenu from "./components/TopMenu";
import SpaceNavigator from "./components/SpaceNavigator";
import FallbackMain from "./components/FallbackMain";
import "./global.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="ja" className={cn("font-sans", geist.variable)}>
      <body className="relative bg-slate-950 text-slate-50 overflow-hidden font-sans h-[100dvh]">
        {/* 1) 最背面：固定の背景エフェクト（静的グラデーション） */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 60% 50% at 15% 15%, rgba(147,51,234,0.3) 0%, transparent 70%)",
              "radial-gradient(ellipse 70% 60% at 85% 85%, rgba(37,99,235,0.2) 0%, transparent 70%)",
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
