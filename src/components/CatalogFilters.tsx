"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import type { Brand, Category } from "@/types";

const WHEELS = ["16", "20", "24", "26", "27.5", "28", "29"];

// Стандартні розміри рам (фолбек, якщо в товарах поле не заповнене) — як на ardis.com.ua
const DEFAULT_FRAME_SIZES = ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22"];

// Цінові діапазони (швидкі кнопки)
const PRICE_RANGES = [
  { key: "0-5000", label: "до 5 000 ₴", min: null, max: "5000" },
  { key: "5000-10000", label: "5–10 тис. ₴", min: "5000", max: "10000" },
  { key: "10000-20000", label: "10–20 тис. ₴", min: "10000", max: "20000" },
  { key: "20000-", label: "понад 20 тис. ₴", min: "20000", max: null },
];

const SORT_OPTIONS = [
  { value: "new", label: "Спочатку нові" },
  { value: "price_asc", label: "Дешевші спершу" },
  { value: "price_desc", label: "Дорожчі спершу" },
  { value: "rating", label: "За популярністю" },
  { value: "sale", label: "Зі знижкою" },
];

export function CatalogFilters({
  brands,
  categories,
  frameSizes,
  hideCategoryFilter = false,
  facetData = [],
}: {
  brands: Brand[];
  categories: Category[];
  priceRange?: { min: number; max: number };  // лишено для сумісності, не використовується
  frameSizes: string[];
  hideCategoryFilter?: boolean;
  facetData?: { brand: string | null; wheel: string | null; frameSize: string | null; category: string | null; price: number }[];
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
    priceMin: params.get("priceMin") ?? "",
    priceMax: params.get("priceMax") ?? "",
  };

  // Яка цінова кнопка зараз активна
  const activePriceKey =
    PRICE_RANGES.find(
      (r) => (r.min ?? "") === current.priceMin && (r.max ?? "") === current.priceMax
    )?.key ?? "";

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

  const selectPrice = (r: (typeof PRICE_RANGES)[number]) => {
    if (activePriceKey === r.key) {
      updateParams({ priceMin: null, priceMax: null });
    } else {
      updateParams({ priceMin: r.min, priceMax: r.max });
    }
  };

  const clearAll = () => router.push(pathname, { scroll: false });
  const hasFilters =
    current.category || current.brand || current.wheel || current.frameSize ||
    current.inStock || current.priceMin || current.priceMax;

  const bikeCats = categories.filter((c) => c.group === "velosypedy");
  const sizes = frameSizes.length > 0 ? frameSizes : DEFAULT_FRAME_SIZES;

  // --- Крос-фасетна доступність ---
  // Чи лишаться товари, якщо до решти активних фільтрів додати { dimension: value }.
  const priceMatch = (price: number) => {
    const min = current.priceMin ? Number(current.priceMin) : null;
    const max = current.priceMax ? Number(current.priceMax) : null;
    if (min != null && price < min) return false;
    if (max != null && price > max) return false;
    return true;
  };
  const isAvailable = (dim: "brand" | "wheel" | "frameSize" | "category", value: string) => {
    if (facetData.length === 0) return true; // нема даних — нічого не глушимо
    return facetData.some((r) => {
      if (dim !== "category" && current.category && r.category !== current.category) return false;
      if (dim !== "brand" && current.brand && r.brand !== current.brand) return false;
      if (dim !== "wheel" && current.wheel && r.wheel !== current.wheel) return false;
      if (dim !== "frameSize" && current.frameSize && r.frameSize !== current.frameSize) return false;
      if (!priceMatch(r.price)) return false;
      // сам перевіряємий вимір:
      if (dim === "brand") return r.brand === value;
      if (dim === "wheel") return r.wheel === value;
      if (dim === "frameSize") return r.frameSize === value;
      if (dim === "category") return r.category === value;
      return true;
    });
  };

  // Скільки товарів дасть значення (з урахуванням інших активних фільтрів)
  const countFor = (dim: "brand" | "wheel" | "frameSize", value: string): number => {
    if (facetData.length === 0) return 0;
    return facetData.filter((r) => {
      if (current.category && r.category !== current.category) return false;
      if (dim !== "brand" && current.brand && r.brand !== current.brand) return false;
      if (dim !== "wheel" && current.wheel && r.wheel !== current.wheel) return false;
      if (dim !== "frameSize" && current.frameSize && r.frameSize !== current.frameSize) return false;
      if (!priceMatch(r.price)) return false;
      if (dim === "brand") return r.brand === value;
      if (dim === "wheel") return r.wheel === value;
      if (dim === "frameSize") return r.frameSize === value;
      return false;
    }).length;
  };

  // Активні фільтри для чіпів
  const activeChips: { label: string; clear: () => void }[] = [];
  if (current.category) {
    const c = categories.find((x) => x.slug === current.category);
    activeChips.push({ label: c?.name ?? current.category, clear: () => updateParams({ category: null }) });
  }
  if (current.brand) {
    const b = brands.find((x) => x.slug === current.brand);
    activeChips.push({ label: b?.name ?? current.brand, clear: () => updateParams({ brand: null }) });
  }
  if (current.wheel) activeChips.push({ label: `${current.wheel}" колеса`, clear: () => updateParams({ wheel: null }) });
  if (current.frameSize) activeChips.push({ label: `Рама ${current.frameSize}"`, clear: () => updateParams({ frameSize: null }) });
  if (current.priceMin || current.priceMax) {
    const pr = PRICE_RANGES.find((r) => (r.min ?? "") === current.priceMin && (r.max ?? "") === current.priceMax);
    activeChips.push({ label: pr?.label ?? "Ціна", clear: () => updateParams({ priceMin: null, priceMax: null }) });
  }
  if (current.inStock) activeChips.push({ label: "В наявності", clear: () => updateParams({ inStock: null }) });

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

      {/* Активні фільтри-чіпи */}
      {activeChips.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeChips.map((chip, i) => (
            <button
              key={i}
              onClick={chip.clear}
              className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-600 transition-colors hover:bg-accent/20"
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
        </div>
      )}

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
            {brands.map((b) => {
              const avail = current.brand === b.slug || isAvailable("brand", b.slug);
              const cnt = countFor("brand", b.slug);
              return (
                <button
                  key={b.slug}
                  onClick={() => avail && toggle("brand", b.slug)}
                  disabled={!avail}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    current.brand === b.slug
                      ? "border-accent bg-accent/5 text-accent-600"
                      : avail
                      ? "border-black/10 text-gray-600 hover:border-accent/40"
                      : "border-black/5 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {b.name}{cnt > 0 && <span className="ml-1 text-gray-400">({cnt})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Діаметр коліс */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Діаметр коліс</p>
          <div className="flex flex-wrap gap-1.5">
            {WHEELS.map((w) => {
              const avail = current.wheel === w || isAvailable("wheel", w);
              const cnt = countFor("wheel", w);
              return (
                <button
                  key={w}
                  onClick={() => avail && toggle("wheel", w)}
                  disabled={!avail}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    current.wheel === w
                      ? "border-accent bg-accent/5 text-accent-600"
                      : avail
                      ? "border-black/10 text-gray-600 hover:border-accent/40"
                      : "border-black/5 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {w}"{cnt > 0 && <span className="ml-1 text-gray-400">({cnt})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Розмір рами (завжди видимий) */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Розмір рами</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((fs) => {
              const avail = current.frameSize === fs || isAvailable("frameSize", fs);
              return (
                <button
                  key={fs}
                  onClick={() => avail && toggle("frameSize", fs)}
                  disabled={!avail}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    current.frameSize === fs
                      ? "border-accent bg-accent/5 text-accent-600"
                      : avail
                      ? "border-black/10 text-gray-600 hover:border-accent/40"
                      : "border-black/5 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {fs}"
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ціна + наявність */}
      <div className="mt-5 flex flex-col gap-4 border-t border-black/5 pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Ціна</p>
          <div className="flex flex-wrap gap-1.5">
            {PRICE_RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => selectPrice(r)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activePriceKey === r.key
                    ? "border-accent bg-accent/5 text-accent-600"
                    : "border-black/10 text-gray-600 hover:border-accent/40"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

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
  );
}
