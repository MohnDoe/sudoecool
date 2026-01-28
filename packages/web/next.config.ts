import type { NextConfig } from "next";
import path from "path"
console.log("RUNTIME:", process.execPath)
const root = path.join(__dirname);
console.log("path:", root)
const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   cssChunking: false,
  // },
  // turbopack: {
  //   root: root,
  // },
  // outputFileTracingRoot: root,
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",           // /api/auth/discord/token
        destination: "http://localhost:3001/auth/:path*",  // → localhost:3001/auth/discord/token
      }, {
        source: "/api/:path*",           // /api/auth/discord/token
        destination: "http://localhost:3001/api/:path*",  // → localhost:3001/auth/discord/token
      },

    ];
  },
};

export default nextConfig;
