import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a second, isolated dev server (e.g. the local E2E run against a local
  // API, NEXT_DIST_DIR=.next-e2e) run beside the normal one. Default unchanged.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  allowedDevOrigins: [
    // Wildcards match Next's dot-segment matcher against the last octet, so
    // this covers the whole home/office LAN instead of one IP that changes
    // whenever DHCP hands out a new lease.
    "192.168.1.*",
    "localhost",
    "*.local-origin.dev",
  ],
};

export default nextConfig;