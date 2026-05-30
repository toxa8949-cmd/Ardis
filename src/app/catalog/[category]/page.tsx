import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import {
  getProducts, getBrands, getCategories,
  getCategoryBySlug, getAllCategorySlugs,
} from "@/lib/products";
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((category) => ({ category }));
}

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ brand?: string; wheel?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Категорію не знайдено" };
  return {
    title: `${cat.name} велосипеди`,
    description: `${cat.name} велосипеди Ardis та інших брендів. Великий вибір, заводська гарантія, доставка по Україні.`,
    alternates: { canonical: `/catalog/${cat.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const sp = await searchParams;

  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  const [products, brands, categories] = await Promise.all([
    getProducts({ category, brand: sp.brand, wheel: sp.wheel }),
    getBrands(),
    getCategories(),
  ]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Каталог", item: `${SITE.url}/catalog` },
      { "@type": "ListItem", position: 3, name: cat.name, item: `${SITE.url}/catalog/${cat.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-8">
          <span className="text-sm font-bold uppercase tracking-widest text-accent">Каталог</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{cat.name} велосипеди</h1>
          <p className="mt-1 text-sm text-gray-500">Знайдено: {products.length}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <CatalogFilters brands={brands} categories={categories} />
          <div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-black/5 bg-white p-16 text-center">
                <p className="font-bold text-gray-700">У цій категорії поки немає товарів</p>
                <p className="mt-1 text-sm text-gray-400">Скоро з'являться</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
