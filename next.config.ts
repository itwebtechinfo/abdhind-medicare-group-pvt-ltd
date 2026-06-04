import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.55",
    "localhost",
    "*.local-origin.dev",
  ],
};

export default nextConfig;