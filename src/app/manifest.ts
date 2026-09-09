import type { MetadataRoute } from "next";

/**
 * PWA マニフェスト。Next.js が `/manifest.webmanifest` として配信する。
 *
 * `display: "standalone"` でアドレスバーが消え、ホーム画面から起動すると
 * ネイティブアプリのように開く。`background_color` / `theme_color` は
 * 起動時のスプラッシュと OS の UI に効くので、地色（§2.1）と合わせる。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    // TODO: アプリ名は未決（docs/pixel-style-guide.md §9.9）。仮の名前
    name: "DAILY QUEST",
    short_name: "DAILY QUEST",
    description: "毎日のタスクをクエストにして、アプリの中の自分を育てる",
    start_url: "/today",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#221c12",
    theme_color: "#221c12",
    lang: "ja",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
