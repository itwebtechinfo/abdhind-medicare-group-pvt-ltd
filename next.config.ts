import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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