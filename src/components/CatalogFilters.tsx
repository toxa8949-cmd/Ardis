"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { X, SlidersHorizontal, ArrowUpDown, ChevronDown, Check } from "lucide-react";
import type { Brand, Category } from "@/types";

const WHEELS = ["16", "20", "24", "26", "27.5", "28", "29"];
const DEFAULT_FRAME_SIZES = ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22"];

const PRICE_RANGES = [
  { key: "0-5000", label: "до 5 000 ₴", min: null as string | null, max: "5000" as string | null },
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

type Facet = { brand: string | null; wheel: string | null; frameSize: string | null; category: string | null; price: number };

export function CatalogFilters({
  brands,
  categories,
  frameSizes,
  hideCategoryFilter = false,
  facetData = [],
}: {
  brands: Brand[];
  categories: Category[];
  priceRange?: { min: number; max: number };
  frameSizes: string[];
  hideCategoryFilter?: boolean;
  facetData?: Facet[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // багатозначні фільтри з URL (через кому)
  const list = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);
  const current = {
    category: params.get("category") ?? "",
    brands: list("brand"),
    wheels: list("wheel"),
    frameSizes: list("frameSize"),
    sort: params.get("sort") ?? "new",
    priceMin: params.get("priceMin") ?? "",
    priceMax: params.get("priceMax") ?? "",
    inStock: params.get("inStock") === "1",
  };

  const setParam = useCallback(
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

  // перемкнути значення в багатозначному фільтрі (brand/wheel/frameSize)
  const toggleMulti = (key: string, value: string) => {
    const arr = list(key);
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    setParam({ [key]: next.length ? next.join(",") : null });
  };

  const sizes = frameSizes.length > 0 ? frameSizes : DEFAULT_FRAME_SIZES;
  const bikeCats = categories.filter((c) => c.group === "velosypedy" || c.group === "aksesuary");

  // --- фасети ---
  const priceMatch = (price: number) => {
    const min = current.priceMin ? Number(current.priceMin) : null;
    const max = current.priceMax ? Number(current.priceMax) : null;
    if (min != null && price < min) return false;
    if (max != null && price > max) return false;
    return true;
  };
  const matchesExcept = (r: Facet, except: string) => {
    if (except !== "category" && current.category && r.category !== current.category) return false;
    if (except !== "brand" && current.brands.length && !(r.brand && current.brands.includes(r.brand))) return false;
    if (except !== "wheel" && current.wheels.length && !(r.wheel && current.wheels.includes(r.wheel))) return false;
    if (except !== "frameSize" && current.frameSizes.length && !(r.frameSize && current.frameSizes.includes(r.frameSize))) return false;
    if (!priceMatch(r.price)) return false;
    return true;
  };
  const countFor = (dim: "brand" | "wheel" | "frameSize", value: string): number => {
    if (facetData.length === 0) return 0;
    return facetData.filter((r) => matchesExcept(r, dim) && (
      dim === "brand" ? r.brand === value : dim === "wheel" ? r.wheel === value : r.frameSize === value
    )).length;
  };

  const clearAll = () => router.push(pathname, { scroll: false });
  const hasFilters = current.category || current.brands.length || current.wheels.length || current.frameSizes.length || current.priceMin || current.priceMax || current.inStock;

  // активні чіпи
  const chips: { label: string; clear: () => void }[] = [];
  if (current.category) {
    const c = categories.find((x) => x.slug === current.category);
    chips.push({ label: c?.name ?? current.category, clear: () => setParam({ category: null }) });
  }
  current.brands.forEach((b) => {
    const br = brands.find((x) => x.slug === b);
    chips.push({ label: br?.name ?? b, clear: () => toggleMulti("brand", b) });
  });
  current.wheels.forEach((w) => chips.push({ label: `${w}"`, clear: () => toggleMulti("wheel", w) }));
  current.frameSizes.forEach((f) => chips.push({ label: `Рама ${f}"`, clear: () => toggleMulti("frameSize", f) }));
  if (current.priceMin || current.priceMax) {
    const pr = PRICE_RANGES.find((r) => (r.min ?? "") === current.priceMin && (r.max ?? "") === current.priceMax);
    chips.push({ label: pr?.label ?? "Ціна", clear: () => setParam({ priceMin: null, priceMax: null }) });
  }
  if (current.inStock) chips.push({ label: "В наявності", clear: () => setParam({ inStock: null }) });

  const activePriceKey = PRICE_RANGES.find((r) => (r.min ?? "") === current.priceMin && (r.max ?? "") === current.priceMax)?.key ?? "";

  return (
    <div className="mb-8 rounded-3xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
      {/* Рядок: заголовок + сортування */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <SlidersHorizontal size={18} className="text-accent" /> Фільтри
        </h2>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <ArrowUpDown size={15} className="text-gray-400" />
          <select
            value={current.sort}
            onChange={(e) => setParam({ sort: e.target.value === "new" ? null : e.target.value })}
            className="rounded-lg border border-black/10 bg-paper px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Рядок випадайок */}
      <div className="flex flex-wrap items-center gap-2.5">
        {!hideCategoryFilter && (
          <Dropdown label="Категорія" count={current.category ? 1 : 0}>
            <button
              onClick={() => setParam({ category: null })}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-50 ${!current.category ? "font-bold text-accent-600" : "text-gray-600"}`}
            >
              Усі категорії {!current.category && <Check size={15} />}
            </button>
            {bikeCats.map((c) => (
              <button
                key={c.slug}
                onClick={() => setParam({ category: c.slug })}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-50 ${current.category === c.slug ? "font-bold text-accent-600" : "text-gray-600"}`}
              >
                {c.name} {current.category === c.slug && <Check size={15} />}
              </button>
            ))}
          </Dropdown>
        )}

        <Dropdown label="Бренд" count={current.brands.length}>
          {brands.map((b) => {
            const on = current.brands.includes(b.slug);
            const cnt = countFor("brand", b.slug);
            return (
              <CheckRow key={b.slug} label={b.name} count={cnt} checked={on} disabled={!on && cnt === 0} onClick={() => toggleMulti("brand", b.slug)} />
            );
          })}
        </Dropdown>

        <Dropdown label="Діаметр коліс" count={current.wheels.length}>
          {WHEELS.map((w) => {
            const on = current.wheels.includes(w);
            const cnt = countFor("wheel", w);
            return (
              <CheckRow key={w} label={`${w}"`} count={cnt} checked={on} disabled={!on && cnt === 0} onClick={() => toggleMulti("wheel", w)} />
            );
          })}
        </Dropdown>

        <Dropdown label="Розмір рами" count={current.frameSizes.length}>
          {sizes.map((f) => {
            const on = current.frameSizes.includes(f);
            const cnt = countFor("frameSize", f);
            return (
              <CheckRow key={f} label={`${f}"`} count={cnt} checked={on} disabled={!on && cnt === 0} onClick={() => toggleMulti("frameSize", f)} />
            );
          })}
        </Dropdown>

        <Dropdown label="Ціна" count={current.priceMin || current.priceMax ? 1 : 0}>
          {PRICE_RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                if (activePriceKey === r.key) setParam({ priceMin: null, priceMax: null });
                else setParam({ priceMin: r.min, priceMax: r.max });
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-50 ${activePriceKey === r.key ? "font-bold text-accent-600" : "text-gray-600"}`}
            >
              {r.label} {activePriceKey === r.key && <Check size={15} />}
            </button>
          ))}
        </Dropdown>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold text-gray-600 hover:border-accent/40">
          <input
            type="checkbox"
            checked={current.inStock}
            onChange={(e) => setParam({ inStock: e.target.checked ? "1" : null })}
            className="accent-accent"
          />
          В наявності
        </label>

        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 px-2 py-2 text-sm font-semibold text-gray-400 hover:text-accent">
            <X size={14} /> Скинути
          </button>
        )}
      </div>

      {/* Активні чіпи */}
      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip, i) => (
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
    </div>
  );
}

// Випадайка-язичок
function Dropdown({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
          count > 0 ? "border-accent bg-accent/5 text-accent-600" : "border-black/10 text-gray-600 hover:border-accent/40"
        }`}
      >
        {label}
        {count > 0 && <span className="grid min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[11px] text-white">{count}</span>}
        <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-72 w-56 overflow-y-auto rounded-2xl border border-black/5 bg-white p-1.5 shadow-xl">
          {children}
        </div>
      )}
    </div>
  );
}

// Рядок з чекбоксом + лічильником
function CheckRow({ label, count, checked, disabled, onClick }: { label: string; count: number; checked: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 ${
        disabled ? "cursor-not-allowed text-gray-300" : checked ? "font-semibold text-ink" : "text-gray-600"
      }`}
    >
      <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${checked ? "border-accent bg-accent text-white" : "border-gray-300"}`}>
        {checked && <Check size={11} />}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {count > 0 && <span className="text-xs text-gray-400">({count})</span>}
    </button>
  );
}
