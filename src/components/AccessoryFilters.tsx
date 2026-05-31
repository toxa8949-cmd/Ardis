"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import type { Brand, Category } from "@/types";

const PRICE_RANGES = [
  { key: "lt300", label: "до 300 ₴", min: "", max: "300" },
  { key: "300-700", label: "300–700 ₴", min: "300", max: "700" },
  { key: "700-1500", label: "700–1500 ₴", min: "700", max: "1500" },
  { key: "gt1500", label: "1500+ ₴", min: "1500", max: "" },
];

const SORT_OPTIONS = [
  { value: "new", label: "Спочатку нові" },
  { value: "price_asc", label: "Дешевші" },
  { value: "price_desc", label: "Дорожчі" },
];

export function AccessoryFilters({
  categories,
  brands,
  availablePriceKeys,
}: {
  categories: Category[];
  brands: Brand[];
  availablePriceKeys?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const current = {
    category: params.get("category") ?? "",
    brand: params.get("brand") ?? "",
    sort: params.get("sort") ?? "new",
    priceMin: params.get("priceMin") ?? "",
    priceMax: params.get("priceMax") ?? "",
  };

  const activePriceKey =
    PRICE_RANGES.find((r) => r.min === current.priceMin && r.max === current.priceMax)?.key ?? "";

  const updateParams = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(changes).forEach(([k, v]) => {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      });
      const qs = next.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const toggle = (key: string, value: string) =>
    updateParams({ [key]: current[key as keyof typeof current] === value ? null : value });

  const selectPrice = (r: (typeof PRICE_RANGES)[number]) => {
    if (activePriceKey === r.key) updateParams({ priceMin: null, priceMax: null });
    else updateParams({ priceMin: r.min, priceMax: r.max });
  };

  const clearAll = () => router.push(pathname, { scroll: false });
  const hasFilters = current.category || current.brand || current.priceMin || current.priceMax;

  const accCats = categories.filter((c) => c.group === "aksesuary");
  const priceRanges = availablePriceKeys
    ? PRICE_RANGES.filter((r) => availablePriceKeys.includes(r.key))
    : PRICE_RANGES;

  return (
    <div className="mb-8 rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
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
            <button onClick={clearAll} className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-accent">
              <X size={13} /> Скинути
            </button>
          )}
        </div>
      </div>

      {/* Тип аксесуара (підкатегорії) */}
      {accCats.length > 0 && (
        <div className="mb-4">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Тип</span>
          <div className="flex flex-wrap gap-2">
            {accCats.map((c) => (
              <button
                key={c.slug}
                onClick={() => toggle("category", c.slug)}
                className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition-all ${
                  current.category === c.slug
                    ? "border-accent bg-accent text-white"
                    : "border-black/10 bg-white text-gray-600 hover:border-accent/40"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Бренд */}
      {brands.length > 0 && (
        <div className="mb-4">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Бренд</span>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <button
                key={b.slug}
                onClick={() => toggle("brand", b.slug)}
                className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition-all ${
                  current.brand === b.slug
                    ? "border-accent bg-accent text-white"
                    : "border-black/10 bg-white text-gray-600 hover:border-accent/40"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ціна */}
      {priceRanges.length > 0 && (
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Ціна</span>
          <div className="flex flex-wrap gap-2">
            {priceRanges.map((r) => (
              <button
                key={r.key}
                onClick={() => selectPrice(r)}
                className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition-all ${
                  activePriceKey === r.key
                    ? "border-accent bg-accent text-white"
                    : "border-black/10 bg-white text-gray-600 hover:border-accent/40"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
