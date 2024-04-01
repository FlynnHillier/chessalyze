import { verifyPatch } from "next-ws/server/index.js";

verifyPatch(); //Will throw error if next js has not been patched, prevent improper deployment of app.

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [], //TODO:add allowed hosts for images here.
  },
};

export default nextConfig;
