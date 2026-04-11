import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  transpilePackages: ["@real-estate-ai/domain", "@real-estate-ai/i18n", "@real-estate-ai/ui"]
};

export default nextConfig;
