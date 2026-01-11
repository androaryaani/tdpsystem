import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false, // Disabled to prevent auto-refresh issues
  reactStrictMode: false, // Disabled to prevent double renders

  // Empty turbopack config to silence Next.js 16 warning
  turbopack: {},

  // Optimize webpack for better HMR performance
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default withPWA(nextConfig);
