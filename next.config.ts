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
      // Фото аксесуарів з veloportal
      {
        protocol: "https",
        hostname: "b2b.veloportal.com.ua",
        pathname: "/uploads/**",
      },
    ],
  },
  // Канонічний домен без www — узгоджено з SEO-налаштуваннями.
  // ВАЖЛИВО: тут редіректимо ТІЛЬКИ індексну /catalog → /bikes.
  // Категорійні /catalog/:category НЕ редіректимо — це окремі SEO-сторінки
  // з унікальними title/description/intro (див. src/lib/category-seo.ts).
  async redirects() {
    return [
      { source: "/catalog", destination: "/bikes", permanent: true },
    ];
  },
  // Службові домени Vercel (ardis-drab.vercel.app тощо) віддають той самий
  // сайт і теоретично можуть потрапити в індекс як дублікат. Canonical на
  // ardis.kyiv.ua там уже стоїть, але X-Robots-Tag — надійніший запобіжник.
  //
  // Чому noindex, а не редірект: редірект із будь-якого «не нашого» хоста
  // зламав би preview-деплої, на яких зручно перевіряти зміни до продакшену.
  // Заголовок ставиться лише там, де хост НЕ ardis.kyiv.ua.
  async headers() {
    return [
      {
        source: "/:path*",
        missing: [{ type: "host", value: "ardis.kyiv.ua" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
