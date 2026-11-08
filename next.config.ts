import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    localPatterns: [{ pathname: "/media/**" }],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 90],
  },
  experimental: {
    serverActions: { bodySizeLimit: "30mb" },
  },
};

export default nextConfig;
