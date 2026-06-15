import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright", "web-push"],
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
};

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    importScripts: ["/push-sw.js"],
  },
});

export default process.env.NODE_ENV === "development" ? nextConfig : withPWA(nextConfig);
