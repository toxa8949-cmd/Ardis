import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { AccessoryFilters } from "@/components/AccessoryFilters";
import {
  getProducts, getBrands, getCategories,
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
    priceMin?: string; priceMax?: string; inStock?: string; sort?: string;
  }>;
};

export default async function AccessoriesPage({ searchParams }: Props) {
  const sp = await searchParams;

  const [products, brands, categories] = await Promise.all([
    getProducts({
      group: "aksesuary",
      category: sp.category,
      brand: sp.brand,
      priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
      priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
      inStock: sp.inStock === "1",
      sort: (sp.sort as SortOption) ?? "new",
    }),
    getBrands(),
    getCategories("aksesuary"),
  ]);

  const activeCat = categories.find((c) => c.slug === sp.category);
  const title = activeCat ? activeCat.name : "Усі аксесуари";

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-6">
          <span className="text-sm font-bold uppercase tracking-widest text-accent">Аксесуари</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">Знайдено: {products.length}</p>
        </div>

        <Suspense fallback={<div className="mb-8 h-20" />}>
          <AccessoryFilters brands={brands} categories={categories} />
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
      </main>
      <Footer />
    </>
  );
}
