import type { Metadata } from "next";
import Link from "next/link";
import { Package, ShoppingBag, FileText, ArrowRight } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Дашборд",
  robots: { index: false, follow: false },
};

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();

  // Базові лічильники (повна статистика — у Шарі Г)
  const [{ count: productsCount }, { count: ordersCount }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Товарів у каталозі", value: productsCount ?? 0, icon: Package, href: "/admin/products" },
    { label: "Замовлень усього", value: ordersCount ?? 0, icon: ShoppingBag, href: "/admin/orders" },
    { label: "Статей у блозі", value: 0, icon: FileText, href: "/admin/blog" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
      <p className="mt-1 text-sm text-gray-500">Огляд магазину Ardis</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent-600">
                <c.icon size={22} />
              </span>
              <ArrowRight size={18} className="text-gray-300 transition-colors group-hover:text-accent" />
            </div>
            <div className="mt-4 text-3xl font-bold">{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="font-bold">Швидкий старт</h2>
        <p className="mt-1 text-sm text-gray-500">
          Розділи «Товари», «Блог» та «Замовлення» наповнюватимуться в наступних оновленнях.
          Зараз працює вхід і захист адмінки.
        </p>
      </div>
    </div>
  );
}
