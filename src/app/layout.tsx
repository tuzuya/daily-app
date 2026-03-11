import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={cn("font-sans", geist.variable)}>
      <body className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
        {/* 1) 最背面：固定の背景エフェクト（オーロラ風） */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full" />
        </div>

        {/* 2) 空間ナビゲーター：タブ画面をカメラ移動で切り替え */}
        <SpaceNavigator />

        {/* 3) フォールバック：SpaceNavigator外のルート（/profile等） */}
        <FallbackMain>{children}</FallbackMain>

        {/* 4) 最前面：フローティングUI（ヘッダ/タブ） */}
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between">
          <header className="p-4 flex justify-end pointer-events-auto">
            <TopMenu items={topMenuItems} />
          </header>

          <nav className="p-6 flex justify-center pointer-events-auto">
            <GooeyNav items={navItems} initialActiveIndex={0} />
          </nav>
        </div>
      </body>
    </html>
  );
}
