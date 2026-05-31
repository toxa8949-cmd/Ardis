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

  const [products, allAccessories, brands, categories] = await Promise.all([
    getProducts({
      group: "aksesuary",
      category: sp.category,
      brand: sp.brand,
      priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
      priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
      inStock: sp.inStock === "1",
      sort: (sp.sort as SortOption) ?? "new",
    }),
    // повний набір аксесуарів — для обчислення доступних фільтрів (фасети)
    getProducts({ group: "aksesuary" }),
    getBrands(),
    getCategories("aksesuary"),
  ]);

  // Фасети: показуємо лише ті опції, для яких реально є товар
  const availableCategories = new Set(
    allAccessories.map((p) => p.category_slug).filter(Boolean) as string[]
  );
  const availableBrands = new Set(
    allAccessories.map((p) => p.brand?.slug).filter(Boolean) as string[]
  );
  const PRICE_RANGES = [
    { key: "lt300", min: 0, max: 300 },
    { key: "300-700", min: 300, max: 700 },
    { key: "700-1500", min: 700, max: 1500 },
    { key: "gt1500", min: 1500, max: Infinity },
  ];
  const availablePriceKeys = new Set(
    PRICE_RANGES.filter((r) =>
      allAccessories.some((p) => p.price >= r.min && p.price < r.max)
    ).map((r) => r.key)
  );

  const filteredCategories = categories.filter((c) => availableCategories.has(c.slug));
  const filteredBrands = brands.filter((b) => availableBrands.has(b.slug));

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
          <AccessoryFilters
            brands={filteredBrands}
            categories={filteredCategories}
            availablePriceKeys={[...availablePriceKeys]}
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
      </main>
      <Footer />
    </>
  );
}
