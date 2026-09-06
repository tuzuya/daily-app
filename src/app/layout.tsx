import type { Metadata, Viewport } from "next";
import { Press_Start_2P, DotGothic16, Silkscreen } from "next/font/google";
import PixelNav from "./components/PixelNav";
import PixelTopMenu from "./components/PixelTopMenu";
import "./global.css";

/* 書体の役割は固定（docs/pixel-style-guide.md §3）
 * Press Start 2P = 数値・英字見出し / DotGothic16 = 日本語 / Silkscreen = 小ラベル
 *
 * DotGothic16 の japanese サブセットは重いので preload しない。
 * 日本語は本文なので swap で後から差し替わってよい。 */
const pixelNum = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-num",
  display: "swap",
});

/* subsets を指定しない = 全サブセット。日本語の字形が必要なので latin だけでは足りない。
 * そのぶん重いので preload せず swap で後から差し替える。 */
const pixelJp = DotGothic16({
  weight: "400",
  variable: "--font-pixel-jp",
  display: "swap",
  preload: false,
});

const pixelLabel = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-pixel-label",
  display: "swap",
});

export const metadata: Metadata = {
  // TODO: アプリ名が未決（docs/pixel-style-guide.md §9.9）。仮の名前
  title: "DAILY QUEST",
  description: "毎日のタスクをクエストにして、アプリの中の自分を育てる",
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
    <html
      lang="ja"
      className={`${pixelNum.variable} ${pixelJp.variable} ${pixelLabel.variable}`}
    >
      {/*
       * 旧構造（SpaceNavigator による4画面同時描画 + カメラ移動）は廃止した。
       * 各 page.tsx が自分の画面を描画する（docs/ai-dev-guide.md §5.1）。
       */}
      <body className="flex h-[100dvh] flex-col overflow-hidden bg-ground text-ink">
        <main className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>

        {/* 右上のメニュー。画面の上に浮かせる */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-end p-4">
          <div className="pointer-events-auto">
            <PixelTopMenu />
          </div>
        </div>

        <PixelNav />
      </body>
    </html>
  );
}
