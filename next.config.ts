import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright"],
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
};

// PWA : activée en production uniquement (désactivée en dev)
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  },
});

export default process.env.NODE_ENV === "development"
  ? nextConfig
  : withPWA(nextConfig);
