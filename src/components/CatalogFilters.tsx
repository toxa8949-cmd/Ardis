"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import type { Brand, Category } from "@/types";

const WHEELS = ["16", "20", "24", "26", "27.5", "28", "29"];

export function CatalogFilters({
  brands,
  categories,
}: {
  brands: Brand[];
  categories: Category[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const current = {
    category: params.get("category") ?? "",
    brand: params.get("brand") ?? "",
    wheel: params.get("wheel") ?? "",
  };

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value && next.get(key) !== value) next.set(key, value);
      else next.delete(key);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const clearAll = () => router.push(pathname, { scroll: false });
  const hasFilters = current.category || current.brand || current.wheel;

  const bikeCats = categories.filter((c) => c.group === "velosypedy");

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Фільтри</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-accent"
          >
            <X size={13} /> Скинути
          </button>
        )}
      </div>

      {/* Категорія */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Категорія</p>
        <div className="flex flex-col gap-1">
          {bikeCats.map((c) => (
            <button
              key={c.slug}
              onClick={() => setParam("category", c.slug)}
              className={`rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                current.category === c.slug
                  ? "bg-accent/10 text-accent-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Бренд */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Бренд</p>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((b) => (
            <button
              key={b.slug}
              onClick={() => setParam("brand", b.slug)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                current.brand === b.slug
                  ? "border-accent bg-accent/5 text-accent-600"
                  : "border-black/10 text-gray-600 hover:border-accent/40"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Діаметр коліс */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Діаметр коліс</p>
        <div className="flex flex-wrap gap-1.5">
          {WHEELS.map((w) => (
            <button
              key={w}
              onClick={() => setParam("wheel", w)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                current.wheel === w
                  ? "border-accent bg-accent/5 text-accent-600"
                  : "border-black/10 text-gray-600 hover:border-accent/40"
              }`}
            >
              {w}"
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
