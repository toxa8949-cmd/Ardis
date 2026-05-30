import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductCard } from "@/components/ProductCard";
import { getProductBySlug, getRelatedProducts, getAllProductSlugs } from "@/lib/products";
import { uah, SITE } from "@/lib/site";
import { CATEGORY_LABELS } from "@/types";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Товар не знайдено" };

  const title = `${p.name} — купити в Ardis`;
  const description = p.description
    ? p.description.slice(0, 155)
    : `${p.name}: ${p.frame}, колеса ${p.wheel}, ${p.drivetrain}. Ціна ${uah(p.price)}. Заводська гарантія Ardis.`;

  return {
    title,
    description,
    alternates: { canonical: `/bikes/${p.slug}` },
    openGraph: { type: "website", title, description, url: `${SITE.url}/bikes/${p.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const related = await getRelatedProducts(p.category, p.slug, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? p.name,
    category: CATEGORY_LABELS[p.category],
    brand: { "@type": "Brand", name: "Ardis" },
    aggregateRating:
      p.reviews > 0
        ? { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews }
        : undefined,
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "UAH",
      availability: p.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE.url}/bikes/${p.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: SITE.url },
      { "@type": "ListItem", position: 2, name: CATEGORY_LABELS[p.category], item: `${SITE.url}/#catalog` },
      { "@type": "ListItem", position: 3, name: p.name, item: `${SITE.url}/bikes/${p.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-accent">Головна</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <Link href="/#catalog" className="hover:text-accent">{CATEGORY_LABELS[p.category]}</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <span className="font-semibold text-ink">{p.name}</span>
        </nav>

        <div className="mt-8">
          <ProductDetail product={p} />
        </div>

        {related.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">Схожі моделі</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <ProductCard key={r.id} p={r} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
