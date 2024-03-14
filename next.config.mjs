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
