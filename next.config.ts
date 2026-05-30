import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage публічні зображення товарів
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Офіційні фото товарів з ardis.com.ua
      {
        protocol: "https",
        hostname: "ardis.com.ua",
        pathname: "/upload/**",
      },
    ],
  },
  // Канонічний домен без www — узгоджено з SEO-налаштуваннями
  async redirects() {
    return [];
  },
};

export default nextConfig;
