import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { Pagination } from "@/components/Pagination";
import {
  getProductsPaged, getFacetData, getBrands, getCategories, getPriceRange, getFrameSizes,
  type SortOption,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "Велосипеди",
  description:
    "Велосипеди Ardis: гірські, міські, дитячі, підліткові, BMX та електровелосипеди. Українське виробництво, заводська гарантія, доставка Новою Поштою.",
  alternates: { canonical: "/bikes" },
};

type Props = {
  searchParams: Promise<{
    category?: string; brand?: string; wheel?: string; frameSize?: string;
    priceMin?: string; priceMax?: string; inStock?: string; sort?: string; page?: string;
  }>;
};

export default async function BikesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const csv = (v?: string) => (v ? v.split(",").filter(Boolean) : undefined);
  const pageNum = sp.page ? Math.max(1, Number(sp.page)) : 1;

  const [paged, allBikes, brands, categories, priceRange, frameSizes] = await Promise.all([
    getProductsPaged({
      group: "velosypedy",
      category: sp.category,
      brands: csv(sp.brand),
      wheels: csv(sp.wheel),
      frameSizes: csv(sp.frameSize),
      priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
      priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
      inStock: sp.inStock === "1",
      sort: (sp.sort as SortOption) ?? "new",
    }, pageNum, 24),
    getFacetData("velosypedy"),
    getBrands(),
    getCategories("velosypedy"),
    getPriceRange(),
    getFrameSizes(),
  ]);
  const products = paged.items;

  // Полегшені дані для крос-фасетних фільтрів (мапимо у форму CatalogFilters)
  const facetData = allBikes.map((r) => ({
    brand: r.brand,
    wheel: r.wheel,
    frameSize: r.frameSize,
    category: r.category_slug,
    price: r.price,
  }));

  const activeCat = categories.find((c) => c.slug === sp.category);
  const title = activeCat ? activeCat.name : "Усі велосипеди";

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-6">
          <span className="text-sm font-bold uppercase tracking-widest text-accent">Велосипеди</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">Знайдено: {paged.total}</p>
        </div>

        <CatalogFilters
          brands={brands}
          categories={categories}
          priceRange={priceRange}
          frameSizes={frameSizes}
          facetData={facetData}
        />

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-black/5 bg-white p-16 text-center">
            <p className="font-bold text-gray-700">За цими фільтрами нічого не знайдено</p>
            <p className="mt-1 text-sm text-gray-400">Спробуйте змінити параметри</p>
          </div>
        )}

        <Pagination page={paged.page} pages={paged.pages} />
      </main>
      <Footer />
    </>
  );
}
