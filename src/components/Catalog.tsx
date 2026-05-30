"use client";

import { useState, useMemo } from "react";
import { Bike, Mountain, Building2, Route, Wrench } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product, Category } from "@/types";

const TABS: { id: Category | "all"; label: string; icon: typeof Bike }[] = [
  { id: "all", label: "Усі", icon: Bike },
  { id: "mountain", label: "Гірські", icon: Mountain },
  { id: "city", label: "Міські", icon: Building2 },
  { id: "gravel", label: "Гравійні", icon: Route },
  { id: "parts", label: "Компоненти", icon: Wrench },
];

export function Catalog({ products }: { products: Product[] }) {
  const [cat, setCat] = useState<Category | "all">("all");

  const filtered = useMemo(
    () => (cat === "all" ? products : products.filter((p) => p.category === cat)),
    [cat, products]
  );

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-sm font-bold uppercase tracking-widest text-accent">Каталог 2026</span>
          <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Уся продукція Ardis</h2>
          <p className="mt-1 text-sm text-gray-500">Знайдено позицій: {filtered.length}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-2xl bg-gray-100 p-1.5">
          {TABS.map((t) => {
            const on = cat === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setCat(t.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  on ? "bg-white text-ink shadow-sm" : "text-gray-500 hover:text-ink"
                }`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-md rounded-3xl border border-black/5 bg-white p-16 text-center">
          <p className="font-bold text-gray-700">У цій категорії поки порожньо</p>
          <p className="mt-1 text-sm text-gray-400">Спробуй іншу категорію</p>
        </div>
      )}
    </section>
  );
}
