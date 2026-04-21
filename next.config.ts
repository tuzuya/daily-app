import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
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
