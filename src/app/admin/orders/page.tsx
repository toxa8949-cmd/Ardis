import type { Metadata } from "next";
import { getOrders } from "@/lib/orders";
import { OrderCard } from "@/components/admin/OrderCard";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight">Замовлення</h1>
      <p className="mt-1 text-sm text-gray-500">Усього: {orders.length}</p>

      <div className="mt-6 space-y-3">
        {orders.length > 0 ? (
          orders.map((o) => <OrderCard key={o.id} order={o} />)
        ) : (
          <div className="rounded-2xl border border-black/5 bg-white p-16 text-center">
            <p className="font-bold text-gray-700">Замовлень ще немає</p>
            <p className="mt-1 text-sm text-gray-400">Тут з'являться замовлення з сайту</p>
          </div>
        )}
      </div>
    </div>
  );
}
