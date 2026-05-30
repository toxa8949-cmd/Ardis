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
    ],
  },
  // Канонічний домен без www — узгоджено з SEO-налаштуваннями
  async redirects() {
    return [];
  },
};

export default nextConfig;
