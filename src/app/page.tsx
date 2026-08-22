import { getProducts, getCategories } from "@/lib/products";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FrameCalculator } from "@/components/FrameCalculator";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { NewArrivals } from "@/components/NewArrivals";
import { PopularCollections } from "@/components/PopularCollections";
import { CategoryLinks } from "@/components/CategoryLinks";
import { Showrooms } from "@/components/Showrooms";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";
import { HOME_FAQ } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Купити велосипед у Києві — велосипеди Ardis (Ардіс)",
  description:
    "Велосипеди Ardis у Києві: гірські, дитячі, підліткові та електровелосипеди українського виробництва. Заводська гарантія, самовивіз у Києві, доставка Новою Поштою по Україні.",
  // Взаємний hreflang із російським лендингом /ru/kupit-velosiped-kiev.
  alternates: {
    canonical: "/",
    languages: {
      uk: SITE.url,
      ru: `${SITE.url}/ru/kupit-velosiped-kiev`,
      "x-default": SITE.url,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: "Купити велосипед у Києві — велосипеди Ardis (Ардіс)",
    description:
      "Велосипеди Ardis у Києві: гірські, дитячі, підліткові та електро. Гарантія, самовивіз, доставка по Україні.",
  },
};

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ group: "velosypedy" }),
    getCategories("velosypedy"),
  ]);
  const featured = products.slice(0, 8);
  // Новинки — найсвіжіші за датою (окремий запит, щоб мати окремий набір лінків).
  const newest = await getProducts({ group: "velosypedy", sort: "new" });
  const newArrivals = newest.slice(0, 8);

  // Товар для Hero: шукаємо TUCAN серед завантажених; якщо нема — перший наявний велосипед.
  const heroProduct =
    products.find((p) => /tucan/i.test(p.name) && p.in_stock) ??
    products.find((p) => /tucan/i.test(p.name)) ??
    products.find((p) => p.in_stock) ??
    products[0] ??
    null;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Каталог велосипедів Ardis",
    itemListElement: products.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/bikes/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Header />
      <main>
        <Hero product={heroProduct} />
        <FrameCalculator />
        <CategoryShowcase featured={featured} />
        <NewArrivals products={newArrivals} />
        <PopularCollections />
        <CategoryLinks categories={categories} />
        <Showrooms />
        <Faq items={HOME_FAQ} />
      </main>
      <Footer />
    </>
  );
}
