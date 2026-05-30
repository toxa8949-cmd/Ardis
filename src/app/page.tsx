import { getProducts } from "@/lib/products";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FrameCalculator } from "@/components/FrameCalculator";
import { Catalog } from "@/components/Catalog";
import { Showrooms } from "@/components/Showrooms";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

// Головна сторінка. Server Component — товари тягнуться з Supabase на сервері (SSR),
// що добре і для швидкості, і для SEO (Google бачить готовий HTML з товарами).
export default async function HomePage() {
  const products = await getProducts();

  // ItemList JSON-LD — допомагає Google зрозуміти каталог товарів
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
        <Catalog products={products} />
        <Showrooms />
      </main>
      <Footer />
    </>
  );
}
