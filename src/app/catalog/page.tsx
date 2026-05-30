import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { getProducts, getBrands, getCategories } from "@/lib/products";

export const metadata: Metadata = {
  title: "Каталог велосипедів",
  description:
    "Каталог велосипедів Ardis: гірські, міські, дитячі, BMX, електровелосипеди. Бренди Ardis, Crossride, Corrado, RoyalBaby та інші. Фільтр за категорією, брендом і діаметром коліс.",
  alternates: { canonical: "/catalog" },
};

type Props = {
  searchParams: Promise<{ category?: string; brand?: string; wheel?: string }>;
};

export default async function CatalogPage({ searchParams }: Props) {
  const sp = await searchParams;

  const [products, brands, categories] = await Promise.all([
    getProducts({ category: sp.category, brand: sp.brand, wheel: sp.wheel }),
    getBrands(),
    getCategories(),
  ]);

  const activeCat = categories.find((c) => c.slug === sp.category);
  const title = activeCat ? activeCat.name : "Усі велосипеди";

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-8">
          <span className="text-sm font-bold uppercase tracking-widest text-accent">Каталог</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">Знайдено: {products.length}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Фільтри */}
          <CatalogFilters brands={brands} categories={categories} />

          {/* Сітка товарів */}
          <div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
