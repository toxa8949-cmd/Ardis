import type { Metadata } from "next";
import Link from "next/link";
import { Package, ShoppingBag, FileText, TrendingUp, Clock, ArrowRight, Bike, Wrench, AlertTriangle } from "lucide-react";
import { getDashboardStats } from "@/lib/orders";
import { uah } from "@/lib/site";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Виручка (виконані)", value: uah(stats.revenue), icon: TrendingUp, href: "/admin/orders", accent: true },
    { label: "Нові замовлення", value: String(stats.ordersNew), icon: Clock, href: "/admin/orders" },
    { label: "Замовлень усього", value: String(stats.ordersTotal), icon: ShoppingBag, href: "/admin/orders" },
    { label: "Товарів у каталозі", value: String(stats.productsCount), icon: Package, href: "/admin/products" },
    { label: "Велосипедів", value: String(stats.bikesCount), icon: Bike, href: "/admin/products?category=" },
    { label: "Аксесуарів", value: String(stats.accessoriesCount), icon: Wrench, href: "/admin/products" },
    { label: "Немає в наявності", value: String(stats.outOfStockCount), icon: AlertTriangle, href: "/admin/products?stock=out", warn: stats.outOfStockCount > 0 },
    { label: "Статей у блозі", value: String(stats.postsCount), icon: FileText, href: "/admin/blog" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
      <p className="mt-1 text-sm text-gray-500">Огляд магазину Ardis</p>

      {/* Картки статистики */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`group rounded-3xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
              c.accent ? "border-accent/20 bg-accent/5" : c.warn ? "border-amber-300/40 bg-amber-50" : "border-black/5 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${c.accent ? "bg-accent text-white" : c.warn ? "bg-amber-500 text-white" : "bg-accent/10 text-accent-600"}`}>
                <c.icon size={22} />
              </span>
              <ArrowRight size={18} className="text-gray-300 transition-colors group-hover:text-accent" />
            </div>
            <div className="mt-4 text-3xl font-bold">{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </Link>
        ))}
      </div>

      {/* Топ товарів */}
      <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <TrendingUp size={18} className="text-accent" /> Топ товарів у замовленнях
        </h2>
        {stats.topProducts.length > 0 ? (
          <div className="space-y-2">
            {stats.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gray-100 text-sm font-bold text-gray-500">
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm font-semibold text-ink">{p.name}</span>
                <span className="shrink-0 text-sm font-bold text-accent-600">{p.qty} шт</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Поки немає даних — замовлень ще не було.</p>
        )}
      </div>
    </div>
  );
}
