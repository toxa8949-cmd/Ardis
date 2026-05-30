import Link from "next/link";
import { ArrowRight, Mountain, Building2, Baby, Zap, Bike, Gauge } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

// Іконки для основних категорій
const CAT_CARDS = [
  { slug: "girski", name: "Гірські", icon: Mountain, desc: "Для бездоріжжя та активного відпочинку" },
  { slug: "komfortni", name: "Комфортні", icon: Building2, desc: "Зручні міські моделі" },
  { slug: "dytyachi", name: "Дитячі", icon: Baby, desc: "Безпечні велосипеди для дітей" },
  { slug: "elektrovelosipedi", name: "Електро", icon: Zap, desc: "Велосипеди з електромотором" },
  { slug: "bmx", name: "BMX", icon: Gauge, desc: "Трюкові та екстремальні" },
];

// Блок на головній: плитки категорій + добірка топ-товарів + перехід у каталог
export function CategoryShowcase({ featured }: { featured: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-bold uppercase tracking-widest text-accent">Каталог</span>
          <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Обери свій велосипед</h2>
        </div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent"
        >
          Усі велосипеди <ArrowRight size={17} />
        </Link>
      </div>

      {/* Плитки категорій */}
      <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CAT_CARDS.map((c) => (
          <Link
            key={c.slug}
            href={`/catalog/${c.slug}`}
            className="group flex flex-col gap-2 rounded-2xl border border-black/5 bg-white p-5 transition-all hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent-600 transition-colors group-hover:bg-accent group-hover:text-white">
              <c.icon size={22} />
            </span>
            <span className="mt-1 font-bold">{c.name}</span>
            <span className="text-xs leading-snug text-gray-500">{c.desc}</span>
          </Link>
        ))}
      </div>

      {/* Топ-товари */}
      {featured.length > 0 && (
        <>
          <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Bike size={22} className="text-accent" /> Популярні моделі
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
