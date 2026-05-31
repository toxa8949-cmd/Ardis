import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getProducts, getCategories } from "@/lib/products";
import { uah } from "@/lib/site";
import { BADGE_LABELS } from "@/types";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import type { Product } from "@/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const catName = new Map(categories.map((c) => [c.slug, c.name]));
  const catOrder = categories.map((c) => c.slug);

  const groups = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.category_slug ?? "—";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  const orderedKeys = [
    ...catOrder.filter((s) => groups.has(s)),
    ...[...groups.keys()].filter((k) => !catOrder.includes(k)),
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Товари</h1>
          <p className="mt-1 text-sm text-gray-500">Усього: {products.length}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent"
        >
          <Plus size={17} /> Додати товар
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-black/5 bg-white p-12 text-center text-gray-400">
          Товарів ще немає. Натисніть «Додати товар».
        </div>
      ) : (
        <div className="space-y-8">
          {orderedKeys.map((key) => {
            const list = groups.get(key)!;
            const name = catName.get(key) ?? "Без категорії";
            return (
              <section key={key}>
                <div className="mb-2 flex items-baseline gap-2">
                  <h2 className="text-lg font-bold tracking-tight">{name}</h2>
                  <span className="text-sm text-gray-400">({list.length})</span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                        <th className="px-4 py-3">Назва</th>
                        <th className="px-4 py-3">Бренд</th>
                        <th className="px-4 py-3">Ціна</th>
                        <th className="px-4 py-3">Статус</th>
                        <th className="px-4 py-3 text-right">Дії</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((p) => (
                        <tr key={p.id} className="border-b border-black/5 last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-ink">{p.name}</div>
                            <div className="text-xs text-gray-400">{p.slug}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{p.brand?.name ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold">{uah(p.price)}</span>
                            {p.badge && (
                              <span className="ml-2 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent-600">
                                {BADGE_LABELS[p.badge]}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.in_stock ? (
                              <span className="text-xs font-bold text-emerald-600">● В наявності</span>
                            ) : (
                              <span className="text-xs font-bold text-gray-400">Немає</span>
                            )}
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
                              <DeleteProductButton id={p.id} name={p.name} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
