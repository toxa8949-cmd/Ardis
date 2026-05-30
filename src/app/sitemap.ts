import type { MetadataRoute } from "next";
import { getAllProductSlugs } from "@/lib/products";
import { SITE } from "@/lib/site";

// Автоматично генерує /sitemap.xml: головна + усі сторінки товарів.
// Працює на етапі білду (без cookies) через статичний клієнт у getAllProductSlugs.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllProductSlugs();

  const productPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE.url}/bikes/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...productPages,
  ];
}
