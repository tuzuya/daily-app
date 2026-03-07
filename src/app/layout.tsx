import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import GooeyNav from "./components/GooeyNav"; // GooeyNavコンポーネントをインポート
import { ScrollingText } from "./components/ScrollingText"; // ScrollingTextコンポーネントをインポート
import "./global.css";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const navItems = [
  {label: "Overdue", href: "overdue"},
  {label: "Today", href: "today"},
  {label: "Suggest", href: "buffs"},
]
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
      {/* 背景を暗い色（slate-950）にし、文字を白くするベース設定 */}
      <body className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
        
        {/* =========================================
            1. 最背面：固定の背景エフェクト（オーロラ風）
            ========================================= */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* 左上の紫のぼかし */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[120px] rounded-full" />
          {/* 右下の青のぼかし */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full" />
        </div>

        {/* =========================================
            最背面：モチベーションテキスト（New!）
            ========================================= */}
        {/* 2. ここに配置。オーロラの上にテキストが重なります */}
        <ScrollingText />

        {/* =========================================
        {/* =========================================
            2. 中間層：メインコンテンツ（各ページの中身）
            ========================================= */}
        {/* pt-20(上余白) と pb-28(下余白) で、UIパーツとコンテンツが被らないようにしています */}
        <main className="relative z-10 h-screen overflow-y-auto px-4 pt-20 pb-28">
          {children}
        </main>

        {/* =========================================
            3. 最前面：フローティングUI（ここがあなたの出番です！）
            ========================================= */}
        {/* pointer-events-none で枠自体はクリックを貫通させ、中身だけクリック可能(auto)にする */}
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between">
          
          {/* --- 右上のハンバーガーメニュー配置場所 --- */}
          <header className="p-4 flex justify-end pointer-events-auto">
            {/* ▼▼▼ ここに持ってきたハンバーガーメニューを入れます ▼▼▼ */}
            {/* 仮のプレースホルダーとしてガラス風の四角を置いています */}
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
              🍔
            </div>
          </header>

          {/* --- 下部のフローティング・タブバー配置場所 --- */}
          <nav className="p-6 flex justify-center pointer-events-auto">
            <GooeyNav items={navItems} initialActiveIndex={0} /> 
          </nav>

        </div>
      </body>
    </html>
  );
}