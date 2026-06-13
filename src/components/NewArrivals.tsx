import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

// Блок «Новинки» на головній: свіжі велосипеди (sort: created_at).
// Це окремий набір товарів від «Популярних», тож головна дає більше
// внутрішніх посилань на різні картки товарів — корисно для індексації.
export function NewArrivals({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-accent">
            <Sparkles size={15} /> Нещодавно додані
          </span>
          <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Новинки каталогу</h2>
        </div>
        <Link
          href="/bikes?sort=new"
          className="inline-flex items-center gap-2 rounded-2xl border border-black/10 px-5 py-3 text-sm font-bold text-ink transition-colors hover:border-accent/40 hover:text-accent"
        >
          Усі новинки <ArrowRight size={17} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
