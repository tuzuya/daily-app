import type { NextConfig } from "next";

/**
 * 全レスポンスに付ける防御用ヘッダー。
 * CSP は読み込み元の列挙が要り、誤ると画面が壊れるので別途ブラウザで確認しながら入れる。
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/today",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
