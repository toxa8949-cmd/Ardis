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
      // Фото товарів з фіду velokrai.com.ua
      {
        protocol: "https",
        hostname: "velokrai.com.ua",
        pathname: "/image/**",
      },
    ],
  },
  // Канонічний домен без www — узгоджено з SEO-налаштуваннями
  async redirects() {
    return [
      { source: "/catalog", destination: "/bikes", permanent: true },
      { source: "/catalog/:category", destination: "/bikes?category=:category", permanent: true },
    ];
  },
};

export default nextConfig;
