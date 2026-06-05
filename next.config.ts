import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔥 외부 앱(Flutter 등)에서 API를 호출할 수 있도록 CORS 헤더 허용 설정
  async headers() {
    return [
      {
        // 모든 API 경로(/api/:path*)에 대해 적용
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // 임시로 모두 허용
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
