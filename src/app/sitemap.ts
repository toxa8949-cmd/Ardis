import type { MetadataRoute } from "next";
import { getProductSitemapEntries, getAllCategorySlugs } from "@/lib/products";
import { getPublishedPostSitemapEntries } from "@/lib/posts";
import { SEO_COLLECTIONS } from "@/lib/seo-collections";
import { RU_LANDINGS } from "@/lib/ru-landings";
import { ACCESSORY_CATEGORY_SLUGS } from "@/lib/accessory-category-seo";
import { SITE } from "@/lib/site";

// Sitemap перегенеровується щогодини, а не лише під час білду.
// Без цього lastmod «замерзає» на даті останнього деплою: сайт може стояти
// місяцями без пушів, а товари при цьому оновлюються щодня через крон.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, catSlugs, posts] = await Promise.all([
    getProductSitemapEntries(),
    getAllCategorySlugs(),
    getPublishedPostSitemapEntries(),
  ]);

  // Найсвіжіший товар — орієнтир для лістингових і збіркових сторінок:
  // їхній вміст змінюється рівно тоді, коли змінюється асортимент.
  const newestProduct = products.reduce<Date | null>((acc, p) => {
    return !acc || p.lastModified > acc ? p.lastModified : acc;
  }, null);
  const listingModified = newestProduct ?? new Date();

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/bikes/${p.slug}`,
    lastModified: p.lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = catSlugs.map((slug) => ({
    url: `${SITE.url}/catalog/${slug}`,
    lastModified: listingModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const seoCollectionPages: MetadataRoute.Sitemap = SEO_COLLECTIONS.map((c) => ({
    url: `${SITE.url}/c/${c.slug}`,
    lastModified: listingModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const ruLandingPages: MetadataRoute.Sitemap = RU_LANDINGS.map((c) => ({
    url: `${SITE.url}/ru/${c.slug}`,
    lastModified: listingModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const accessoryCategoryPages: MetadataRoute.Sitemap = ACCESSORY_CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE.url}/accessories/${slug}`,
    lastModified: listingModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE.url}/blog/${p.slug}`,
    lastModified: p.lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Найсвіжіша стаття — орієнтир для індексу блогу.
  const newestPost = posts.reduce<Date | null>((acc, p) => {
    return !acc || p.lastModified > acc ? p.lastModified : acc;
  }, null);

  // Статичні інформаційні сторінки змінюються лише разом із деплоєм —
  // для них час білду є коректним lastmod.
  const buildTime = new Date();
  const infoPages: MetadataRoute.Sitemap = [
    "/about",
    "/delivery",
    "/returns",
    "/warranty",
    "/contacts",
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: buildTime,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    { url: SITE.url, lastModified: listingModified, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/bikes`, lastModified: listingModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/accessories`, lastModified: listingModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/blog`, lastModified: newestPost ?? buildTime, changeFrequency: "weekly", priority: 0.7 },
    ...infoPages,
    ...categoryPages,
    ...seoCollectionPages,
    ...ruLandingPages,
    ...accessoryCategoryPages,
    ...postPages,
    ...productPages,
  ];
}
