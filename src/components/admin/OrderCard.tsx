"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Phone, MapPin, Truck, Package } from "lucide-react";
import { updateOrderStatus } from "@/lib/order-actions";
import { uah } from "@/lib/site";
import {
  ORDER_STATUS_LABELS, DELIVERY_LABELS,
  type Order, type OrderStatus,
} from "@/types";

const STATUS_STYLE: Record<OrderStatus, string> = {
  new: "bg-blue-50 text-blue-600",
  processing: "bg-amber-50 text-amber-600",
  done: "bg-emerald-50 text-emerald-600",
  canceled: "bg-gray-100 text-gray-500",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [pending, startTransition] = useTransition();

  const changeStatus = (next: OrderStatus) => {
    setStatus(next);
    startTransition(() => updateOrderStatus(order.id, next));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
      {/* Шапка рядка */}
      <div className="flex flex-wrap items-center gap-3 p-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-gray-100"
        >
          <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="font-bold text-ink">{order.customer_name}</div>
          <div className="text-xs text-gray-400">{formatDate(order.created_at)}</div>
        </div>

        <div className="text-sm font-bold">{uah(order.total)}</div>

        <span className={`rounded-md px-2 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}>
          {ORDER_STATUS_LABELS[status]}
        </span>

        <select
          value={status}
          disabled={pending}
          onChange={(e) => changeStatus(e.target.value as OrderStatus)}
          className="rounded-lg border border-black/10 bg-paper px-2.5 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60"
        >
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Деталі */}
      {open && (
        <div className="border-t border-black/5 bg-gray-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2 text-gray-600">
                <Phone size={15} className="text-gray-400" />
                <a href={`tel:${order.phone}`} className="font-semibold text-ink hover:text-accent">{order.phone}</a>
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <Truck size={15} className="text-gray-400" />
                {DELIVERY_LABELS[order.delivery]}
              </p>
              {order.city && (
                <p className="flex items-center gap-2 text-gray-600">
                  <MapPin size={15} className="text-gray-400" /> {order.city}
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Package size={13} /> Товари
              </p>
              <div className="space-y-1.5">
                {order.items.map((it, i) => (
                  <div key={i} className="flex justify-between gap-2 text-sm">
                    <span className="text-gray-700">
                      {it.name}
                      {it.color && <span className="text-gray-400"> · {it.color}</span>}
                      <span className="text-gray-400"> × {it.qty}</span>
                    </span>
                    <span className="shrink-0 font-semibold">{uah(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
