import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { Pagination } from "@/components/Pagination";
import {
  getProductsPaged, getFacetData, getBrands, getCategories,
  type SortOption,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "Аксесуари",
  description:
    "Аксесуари для велосипедів Ardis: крила, освітлення, замки, насоси, дзвінки та інше. Доставка Новою Поштою по всій Україні.",
  alternates: { canonical: "/accessories" },
};

type Props = {
  searchParams: Promise<{
    category?: string; brand?: string;
    priceMin?: string; priceMax?: string; inStock?: string; sort?: string; page?: string;
  }>;
};

export default async function AccessoriesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const pageNum = sp.page ? Math.max(1, Number(sp.page)) : 1;

  const [paged, facets, brands, categories] = await Promise.all([
    getProductsPaged({
      group: "aksesuary",
      category: sp.category,
      brand: sp.brand,
      priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
      priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
      inStock: sp.inStock === "1",
      sort: (sp.sort as SortOption) ?? "new",
    }, pageNum, 24),
    // легкі дані лише для фільтрів (без важких полів)
    getFacetData("aksesuary"),
    getBrands(),
    getCategories("aksesuary"),
  ]);
  const products = paged.items;

  // facetData для CatalogFilters (рахує доступність і лічильники штук)
  const facetData = facets.map((p) => ({
    brand: p.brand,
    wheel: null,
    frameSize: null,
    category: p.category_slug,
    price: p.price,
  }));

  // у фільтрах показуємо лише бренди й категорії, для яких реально є товари
  const presentBrands = new Set(facets.map((p) => p.brand).filter(Boolean) as string[]);
  const presentCats = new Set(facets.map((p) => p.category_slug).filter(Boolean) as string[]);
  const filteredBrands = brands.filter((b) => presentBrands.has(b.slug));
  const filteredCategories = categories.filter((c) => presentCats.has(c.slug));

  const activeCat = categories.find((c) => c.slug === sp.category);
  const title = activeCat ? activeCat.name : "Усі аксесуари";

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-6">
          <span className="text-sm font-bold uppercase tracking-widest text-accent">Аксесуари</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">Знайдено: {paged.total}</p>
        </div>

        <Suspense fallback={<div className="mb-8 h-20" />}>
          <CatalogFilters
            brands={filteredBrands}
            categories={filteredCategories}
            frameSizes={[]}
            hideBikeFilters
            facetData={facetData}
          />
        </Suspense>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-black/5 bg-white p-16 text-center">
            <p className="font-bold text-gray-700">Аксесуарів поки немає</p>
            <p className="mt-1 text-sm text-gray-400">Незабаром тут зʼявляться товари</p>
          </div>
        )}

        <Suspense fallback={null}>
          <Pagination page={paged.page} pages={paged.pages} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
