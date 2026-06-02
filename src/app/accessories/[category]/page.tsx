import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import { getProductsPaged } from "@/lib/products";
import {
  ACCESSORY_CATEGORY_SEO,
  ACCESSORY_CATEGORY_SLUGS,
  getAccessoryCategorySeo,
} from "@/lib/accessory-category-seo";
import { SITE } from "@/lib/site";

// Генеруємо лише ті категорії аксесуарів, де реально є товари.
export async function generateStaticParams() {
  const checks = await Promise.all(
    ACCESSORY_CATEGORY_SLUGS.map(async (slug) => {
      const res = await getProductsPaged({ category: slug }, 1, 1);
      return res.total > 0 ? { category: slug } : null;
    })
  );
  return checks.filter((x): x is { category: string } => x !== null);
}

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const seo = getAccessoryCategorySeo(category);
  if (!seo) return { title: "Категорію не знайдено" };
  return {
    title: seo.title ?? `${seo.name} для велосипеда | Ardis`,
    description:
      seo.description ?? `${seo.name} для велосипедів. Доставка Новою Поштою по всій Україні.`,
    alternates: { canonical: `/accessories/${category}` },
    openGraph: {
      type: "website",
      title: seo.title ?? `${seo.name} для велосипеда`,
      description: seo.description ?? `${seo.name} для велосипедів Ardis.`,
      url: `${SITE.url}/accessories/${category}`,
    },
  };
}

export default async function AccessoryCategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const sp = await searchParams;
  const seo = getAccessoryCategorySeo(category);
  if (!seo) notFound();

  const pageNum = sp.page ? Math.max(1, Number(sp.page)) : 1;
  const paged = await getProductsPaged({ category }, pageNum, 24);
  if (paged.total === 0) notFound();
  const products = paged.items;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Аксесуари", item: `${SITE.url}/accessories` },
      { "@type": "ListItem", position: 3, name: seo.name, item: `${SITE.url}/accessories/${category}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-accent">Головна</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <Link href="/accessories" className="hover:text-accent">Аксесуари</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <span className="font-semibold text-ink">{seo.name}</span>
        </nav>

        <div className="mb-6 mt-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{seo.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Знайдено: {paged.total}</p>
          {seo.intro && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600">{seo.intro}</p>
          )}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-black/5 bg-white p-16 text-center">
            <p className="font-bold text-gray-700">Наразі немає в наявності</p>
            <Link href="/accessories" className="mt-3 inline-block text-sm font-semibold text-accent hover:text-accent-600">
              Усі аксесуари
            </Link>
          </div>
        )}

        <Pagination page={paged.page} pages={paged.pages} />
      </main>
      <Footer />
    </>
  );
}
