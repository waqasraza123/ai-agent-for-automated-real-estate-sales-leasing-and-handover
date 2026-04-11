import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
  eslint: {
    ignoreDuringBuilds: true
  },
  transpilePackages: ["@real-estate-ai/domain", "@real-estate-ai/i18n", "@real-estate-ai/ui"]
};

export default nextConfig;
