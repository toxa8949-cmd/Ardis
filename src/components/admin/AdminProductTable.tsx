"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { uah } from "@/lib/site";
import { BADGE_LABELS, type Product } from "@/types";
import {
  setProductStock,
  setProductPrice,
  bulkProductAction,
  deleteProduct,
} from "@/lib/admin-actions";

export function AdminProductTable({
  items,
  catName,
}: {
  items: Product[];
  catName: Map<string, string>;
}) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState("");

  const allSelected = items.length > 0 && items.every((p) => selected.has(p.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(items.map((p) => p.id)));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const runBulk = (action: "in_stock" | "out_of_stock" | "delete") => {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (action === "delete" && !confirm(`Видалити ${ids.length} товар(ів)? Це незворотно.`)) return;
    startTransition(async () => {
      await bulkProductAction(ids, action);
      setSelected(new Set());
    });
  };

  const savePrice = (id: string) => {
    const val = Number(priceValue);
    startTransition(async () => {
      await setProductPrice(id, val);
      setEditingPrice(null);
    });
  };

  return (
    <div>
      {/* Панель масових дій */}
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-accent/[0.04] px-4 py-3">
          <span className="text-sm font-bold text-ink">Обрано: {selected.size}</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBulk("in_stock")}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            ● Позначити «в наявності»
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBulk("out_of_stock")}
            className="rounded-lg bg-gray-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-600 disabled:opacity-40"
          >
            Позначити «немає»
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBulk("delete")}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-40"
          >
            Видалити
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs font-semibold text-gray-500 hover:text-ink"
          >
            Зняти виділення
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer accent-accent"
                  aria-label="Обрати всі"
                />
              </th>
              <th className="px-4 py-3">Назва</th>
              <th className="px-4 py-3">Категорія</th>
              <th className="px-4 py-3">Бренд</th>
              <th className="px-4 py-3">Ціна</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3 text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-black/5 last:border-0 hover:bg-gray-50 ${
                  selected.has(p.id) ? "bg-accent/[0.03]" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="h-4 w-4 cursor-pointer accent-accent"
                    aria-label="Обрати"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.slug}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {p.category_slug ? (catName.get(p.category_slug) ?? p.category_slug) : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.brand?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  {editingPrice === p.id ? (
                    <span className="flex items-center gap-1">
                      <input
                        type="number"
                        value={priceValue}
                        autoFocus
                        onChange={(e) => setPriceValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") savePrice(p.id);
                          if (e.key === "Escape") setEditingPrice(null);
                        }}
                        className="w-24 rounded-lg border border-accent px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => savePrice(p.id)}
                        disabled={pending}
                        className="grid h-7 w-7 place-items-center rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                        aria-label="Зберегти"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPrice(null)}
                        className="grid h-7 w-7 place-items-center rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300"
                        aria-label="Скасувати"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setEditingPrice(p.id); setPriceValue(String(p.price)); }}
                      className="group inline-flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 hover:bg-gray-100"
                      title="Натисніть, щоб змінити ціну"
                    >
                      <span className="font-bold">{uah(p.price)}</span>
                      <Pencil size={12} className="text-gray-300 group-hover:text-accent" />
                      {p.badge && (
                        <span className="ml-1 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent-600">
                          {BADGE_LABELS[p.badge]}
                        </span>
                      )}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startTransition(async () => { await setProductStock(p.id, !p.in_stock); })}
                    className="cursor-pointer disabled:opacity-50"
                    title="Натисніть, щоб змінити наявність"
                  >
                    {p.in_stock ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-100">
                        ● В наявності
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-400 hover:bg-gray-200">
                        Немає
                      </span>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="grid h-9 w-9 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-accent"
                      title="Редагувати"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (confirm(`Видалити «${p.name}»?`)) {
                          startTransition(async () => { await deleteProduct(p.id); });
                        }
                      }}
                      className="grid h-9 w-9 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                      title="Видалити"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  Нічого не знайдено. Спробуйте змінити фільтри.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
