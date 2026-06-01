import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Order } from "@/types";

// Усі замовлення (адмін). RLS пускає лише авторизованих.
export async function getOrders(): Promise<Order[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Order[];
}

export interface DashboardStats {
  ordersTotal: number;
  ordersNew: number;
  revenue: number;          // сума виконаних замовлень
  revenueAll: number;       // сума всіх (крім скасованих)
  productsCount: number;
  bikesCount: number;
  accessoriesCount: number;
  outOfStockCount: number;
  postsCount: number;
  topProducts: { name: string; qty: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createSupabaseServerClient();

  const [ordersRes, productsRes, postsRes, bikesRes, accRes, outRes] = await Promise.all([
    supabase.from("orders").select("status, total, items"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("type", "bike"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("type", "part"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("in_stock", false),
  ]);

  const orders = (ordersRes.data ?? []) as {
    status: string;
    total: number;
    items: { name: string; qty: number }[];
  }[];

  const ordersTotal = orders.length;
  const ordersNew = orders.filter((o) => o.status === "new").length;
  const revenue = orders
    .filter((o) => o.status === "done")
    .reduce((s, o) => s + (o.total ?? 0), 0);
  const revenueAll = orders
    .filter((o) => o.status !== "canceled")
    .reduce((s, o) => s + (o.total ?? 0), 0);

  // Топ товарів за кількістю в замовленнях
  const counter = new Map<string, number>();
  orders.forEach((o) => {
    (o.items ?? []).forEach((it) => {
      counter.set(it.name, (counter.get(it.name) ?? 0) + (it.qty ?? 0));
    });
  });
  const topProducts = Array.from(counter.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    ordersTotal,
    ordersNew,
    revenue,
    revenueAll,
    productsCount: productsRes.count ?? 0,
    bikesCount: bikesRes.count ?? 0,
    accessoriesCount: accRes.count ?? 0,
    outOfStockCount: outRes.count ?? 0,
    postsCount: postsRes.count ?? 0,
    topProducts,
  };
}
