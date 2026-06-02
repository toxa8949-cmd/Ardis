import type { MetadataRoute } from "next";
import { getAllProductSlugs, getAllCategorySlugs } from "@/lib/products";
import { getPublishedPostSlugs } from "@/lib/posts";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, catSlugs, postSlugs] = await Promise.all([
    getAllProductSlugs(),
    getAllCategorySlugs(),
    getPublishedPostSlugs(),
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

  const postPages: MetadataRoute.Sitemap = postSlugs.map((slug) => ({
    url: `${SITE.url}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const infoPages: MetadataRoute.Sitemap = [
    "/about",
    "/delivery",
    "/warranty",
    "/contacts",
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    { url: SITE.url, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/bikes`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/accessories`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...infoPages,
    ...categoryPages,
    ...postPages,
    ...productPages,
  ];
}
