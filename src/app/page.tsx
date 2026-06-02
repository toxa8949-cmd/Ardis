import { getProducts } from "@/lib/products";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FrameCalculator } from "@/components/FrameCalculator";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { Showrooms } from "@/components/Showrooms";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";
import { HOME_FAQ } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Купити велосипед у Києві — велосипеди Ardis (Ардіс)",
  description:
    "Велосипеди Ardis у Києві: гірські, дитячі, підліткові та електровелосипеди українського виробництва. Заводська гарантія, самовивіз у Києві, доставка Новою Поштою по Україні.",
  alternates: { canonical: "/" },
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
  const products = await getProducts({ group: "velosypedy" });
  const featured = products.slice(0, 8);

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
        <Hero />
        <FrameCalculator />
        <CategoryShowcase featured={featured} />
        <Showrooms />
        <Faq items={HOME_FAQ} />
      </main>
      <Footer />
    </>
  );
}
