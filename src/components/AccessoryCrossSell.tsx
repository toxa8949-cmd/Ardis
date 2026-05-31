"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Check, Sparkles } from "lucide-react";
import { useCart } from "./CartProvider";
import { uah } from "@/lib/site";
import type { AccessoryOffer, Product } from "@/types";

// Блок "Додати до велосипеда" — крос-сел аксесуарів зі знижкою.
export function AccessoryCrossSell({
  accessories,
}: {
  accessories: AccessoryOffer[];
}) {
  const { add, open } = useCart();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (accessories.length === 0) return null;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const chosen = accessories.filter((a) => selected.has(a.id));
  const totalSaving = chosen.reduce((s, a) => s + (a.price - a.discounted_price), 0);

  const addSelected = () => {
    chosen.forEach((a) => {
      // мінімальний Product-обʼєкт для кошика
      const p = {
        id: a.id,
        slug: a.slug,
        name: a.name,
        price: a.price,
        image_url: a.image_url,
        images: a.images,
        type: "part",
      } as unknown as Product;
      add(p, "", 0, {
        unitPrice: a.discounted_price,
        accessoryDiscount: a.discount_percent,
        silent: true,
      });
    });
    setSelected(new Set());
    open();
  };

  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/[0.03] p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-accent" />
        <h2 className="text-lg font-bold">Додайте до велосипеда зі знижкою</h2>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Тільки при купівлі разом — спеціальна ціна на аксесуари.
      </p>

      <div className="mt-4 space-y-2">
        {accessories.map((a) => {
          const active = selected.has(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggle(a.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                active ? "border-accent bg-white ring-1 ring-accent/30" : "border-black/5 bg-white hover:border-accent/40"
              }`}
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                  active ? "border-accent bg-accent text-white" : "border-gray-300"
                }`}
              >
                {active && <Check size={15} />}
              </span>

              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                {a.image_url ? (
                  <Image src={a.image_url} alt={a.name} fill sizes="48px" className="object-contain p-1" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-gray-300">
                    <Plus size={16} />
                  </span>
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">{a.name}</span>
                <span className="flex items-center gap-2">
                  <span className="text-sm font-bold text-accent">{uah(a.discounted_price)}</span>
                  {a.discount_percent > 0 && (
                    <>
                      <span className="text-xs text-gray-400 line-through">{uah(a.price)}</span>
                      <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[11px] font-bold text-accent">
                        −{a.discount_percent}%
                      </span>
                    </>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {chosen.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Обрано {chosen.length} · економія{" "}
            <span className="font-bold text-accent">{uah(totalSaving)}</span>
          </p>
          <button
            type="button"
            onClick={addSelected}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-accent active:scale-95"
          >
            Додати обране в кошик
          </button>
        </div>
      )}
    </div>
  );
}
