"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import type { Brand, Category } from "@/types";

export function AdminProductFilters({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");

  const category = params.get("category") ?? "";
  const brand = params.get("brand") ?? "";
  const stock = params.get("stock") ?? "";
  const sort = params.get("sort") ?? "";

  // дебаунс пошуку
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (search.trim()) next.set("search", search.trim());
      else next.delete("search");
      next.delete("page"); // скидаємо на 1 сторінку
      const qs = next.toString();
      router.replace(`/admin/products${qs ? `?${qs}` : ""}`, { scroll: false });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    const qs = next.toString();
    router.replace(`/admin/products${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const clearAll = () => {
    setSearch("");
    router.replace("/admin/products", { scroll: false });
  };

  const hasFilters = search || category || brand || stock || sort;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 sm:min-w-[240px] sm:flex-none">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук за назвою…"
          className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      <select
        value={category}
        onChange={(e) => setParam("category", e.target.value)}
        className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm"
      >
        <option value="">Усі категорії</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </select>

      <select
        value={brand}
        onChange={(e) => setParam("brand", e.target.value)}
        className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm"
      >
        <option value="">Усі бренди</option>
        {brands.map((b) => (
          <option key={b.slug} value={b.slug}>{b.name}</option>
        ))}
      </select>

      <select
        value={stock}
        onChange={(e) => setParam("stock", e.target.value)}
        className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm"
      >
        <option value="">Будь-яка наявність</option>
        <option value="in">● В наявності</option>
        <option value="out">Немає</option>
      </select>

      <select
        value={sort}
        onChange={(e) => setParam("sort", e.target.value)}
        className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm"
      >
        <option value="">Спочатку нові</option>
        <option value="price_asc">Ціна ↑</option>
        <option value="price_desc">Ціна ↓</option>
        <option value="name">За назвою</option>
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 hover:text-accent"
        >
          <X size={15} /> Скинути
        </button>
      )}
    </div>
  );
}
