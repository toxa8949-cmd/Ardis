"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { uah } from "@/lib/site";
import type { Brand, Category } from "@/types";

const WHEELS = ["16", "20", "24", "26", "27.5", "28", "29"];

const SORT_OPTIONS = [
  { value: "new", label: "Спочатку нові" },
  { value: "price_asc", label: "Дешевші спершу" },
  { value: "price_desc", label: "Дорожчі спершу" },
  { value: "rating", label: "За рейтингом" },
];

export function CatalogFilters({
  brands,
  categories,
  priceRange,
  frameSizes,
  hideCategoryFilter = false,
}: {
  brands: Brand[];
  categories: Category[];
  priceRange: { min: number; max: number };
  frameSizes: string[];
  hideCategoryFilter?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const current = {
    category: params.get("category") ?? "",
    brand: params.get("brand") ?? "",
    wheel: params.get("wheel") ?? "",
    frameSize: params.get("frameSize") ?? "",
    inStock: params.get("inStock") === "1",
    sort: params.get("sort") ?? "new",
    priceMin: params.get("priceMin") ? Number(params.get("priceMin")) : priceRange.min,
    priceMax: params.get("priceMax") ? Number(params.get("priceMax")) : priceRange.max,
  };

  // Локальний стан повзунка (застосовується кнопкою)
  const [pMin, setPMin] = useState(current.priceMin);
  const [pMax, setPMax] = useState(current.priceMax);
  useEffect(() => {
    setPMin(current.priceMin);
    setPMax(current.priceMax);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const updateParams = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(changes).forEach(([k, v]) => {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      });
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const toggle = (key: string, value: string) =>
    updateParams({ [key]: current[key as keyof typeof current] === value ? null : value });

  const applyPrice = () => {
    const lo = Math.min(pMin, pMax);
    const hi = Math.max(pMin, pMax);
    updateParams({
      priceMin: lo > priceRange.min ? String(lo) : null,
      priceMax: hi < priceRange.max ? String(hi) : null,
    });
  };

  const clearAll = () => router.push(pathname, { scroll: false });
  const hasFilters =
    current.category || current.brand || current.wheel || current.frameSize ||
    current.inStock || params.get("priceMin") || params.get("priceMax");

  const bikeCats = categories.filter((c) => c.group === "velosypedy");

  return (
    <div className="mb-8 rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
      {/* Верхній рядок: заголовок + сортування */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <SlidersHorizontal size={18} className="text-accent" /> Фільтри
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <ArrowUpDown size={15} className="text-gray-400" />
            <select
              value={current.sort}
              onChange={(e) => updateParams({ sort: e.target.value === "new" ? null : e.target.value })}
              className="rounded-lg border border-black/10 bg-paper px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-accent"
            >
              <X size={13} /> Скинути
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Категорія */}
        {!hideCategoryFilter && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Категорія</p>
            <select
              value={current.category}
              onChange={(e) => updateParams({ category: e.target.value || null })}
              className="w-full rounded-lg border border-black/10 bg-paper px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">Усі категорії</option>
              {bikeCats.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Бренд */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Бренд</p>
          <div className="flex flex-wrap gap-1.5">
            {brands.map((b) => (
              <button
                key={b.slug}
                onClick={() => toggle("brand", b.slug)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
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
                onClick={() => toggle("wheel", w)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
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

        {/* Розмір рами */}
        {frameSizes.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Розмір рами</p>
            <div className="flex flex-wrap gap-1.5">
              {frameSizes.map((fs) => (
                <button
                  key={fs}
                  onClick={() => toggle("frameSize", fs)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    current.frameSize === fs
                      ? "border-accent bg-accent/5 text-accent-600"
                      : "border-black/10 text-gray-600 hover:border-accent/40"
                  }`}
                >
                  {fs}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ціна + наявність */}
      <div className="mt-5 grid gap-5 border-t border-black/5 pt-5 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Ціна</p>
            <span className="text-sm font-bold text-ink">{uah(Math.min(pMin, pMax))} — {uah(Math.max(pMin, pMax))}</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={pMin}
              onChange={(e) => setPMin(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-accent"
            />
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={pMax}
              onChange={(e) => setPMax(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-accent"
            />
          </div>
          <button
            onClick={applyPrice}
            className="mt-3 rounded-lg bg-ink px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent"
          >
            Застосувати ціну
          </button>
        </div>

        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={current.inStock}
              onChange={(e) => updateParams({ inStock: e.target.checked ? "1" : null })}
              className="h-5 w-5 cursor-pointer rounded accent-accent"
            />
            Тільки в наявності
          </label>
        </div>
      </div>
    </div>
  );
}
