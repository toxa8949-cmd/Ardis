import type { MetadataRoute } from "next";
import { getAllProductSlugs, getAllCategorySlugs } from "@/lib/products";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, catSlugs] = await Promise.all([
    getAllProductSlugs(),
    getAllCategorySlugs(),
  ]);

  const productPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE.url}/bikes/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = catSlugs.map((slug) => ({
    url: `${SITE.url}/catalog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: SITE.url, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/catalog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...categoryPages,
    ...productPages,
  ];
}
