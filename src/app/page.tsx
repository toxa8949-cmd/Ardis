import { getProducts } from "@/lib/products";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FrameCalculator } from "@/components/FrameCalculator";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { Showrooms } from "@/components/Showrooms";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

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
      </main>
      <Footer />
    </>
  );
}
