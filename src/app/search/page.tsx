import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { searchProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Пошук",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const products = query ? await searchProducts(query) : [];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-6">
          <span className="text-sm font-bold uppercase tracking-widest text-accent">Пошук</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            {query ? `Результати за «${query}»` : "Пошук товарів"}
          </h1>
          {query && <p className="mt-1 text-sm text-gray-500">Знайдено: {products.length}</p>}
        </div>

        {!query ? (
          <div className="rounded-3xl border border-black/5 bg-white p-16 text-center">
            <p className="font-bold text-gray-700">Введіть запит у рядок пошуку</p>
            <p className="mt-1 text-sm text-gray-400">Шукайте за назвою моделі, брендом чи типом</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-black/5 bg-white p-16 text-center">
            <p className="font-bold text-gray-700">Нічого не знайдено за «{query}»</p>
            <p className="mt-1 text-sm text-gray-400">Спробуйте інші слова або перегляньте каталог</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
