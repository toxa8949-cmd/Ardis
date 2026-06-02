"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Check, Sparkles, Eye, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { Markdown } from "./Markdown";
import { uah } from "@/lib/site";
import { getAccessoryDetails } from "@/lib/product-actions";
import type { AccessoryOffer, Product } from "@/types";

type Details = {
  name: string;
  description: string | null;
  specs: { label: string; value: string }[];
  images: string[];
  image_url: string | null;
  price: number;
};

// Блок "Додати до велосипеда" — крос-сел аксесуарів зі знижкою.
export function AccessoryCrossSell({
  accessories,
}: {
  accessories: AccessoryOffer[];
}) {
  const { add, open } = useCart();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // модалка швидкого перегляду
  const [viewOffer, setViewOffer] = useState<AccessoryOffer | null>(null);
  const [details, setDetails] = useState<Details | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  if (accessories.length === 0) return null;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openView = async (a: AccessoryOffer) => {
    setViewOffer(a);
    setDetails(null);
    setActiveImg(0);
    setLoading(true);
    try {
      const d = await getAccessoryDetails(a.id);
      setDetails(d);
    } finally {
      setLoading(false);
    }
  };

  const closeView = () => {
    setViewOffer(null);
    setDetails(null);
  };

  const chosen = accessories.filter((a) => selected.has(a.id));
  const totalSaving = chosen.reduce((s, a) => s + (a.price - a.discounted_price), 0);

  const addOffer = (a: AccessoryOffer) => {
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
  };

  const addSelected = () => {
    chosen.forEach(addOffer);
    setSelected(new Set());
    open();
  };

  // галерея модалки
  const gallery = details
    ? (details.images.length > 0 ? details.images : details.image_url ? [details.image_url] : [])
    : viewOffer
    ? (viewOffer.images.length > 0 ? viewOffer.images : viewOffer.image_url ? [viewOffer.image_url] : [])
    : [];

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
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                active ? "border-accent bg-white ring-1 ring-accent/30" : "border-black/5 bg-white hover:border-accent/40"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(a.id)}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                  active ? "border-accent bg-accent text-white" : "border-gray-300"
                }`}
                aria-label={active ? "Прибрати" : "Обрати"}
              >
                {active && <Check size={15} />}
              </button>

              <button
                type="button"
                onClick={() => openView(a)}
                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50"
                aria-label="Переглянути"
              >
                {a.image_url ? (
                  <Image src={a.image_url} alt={a.name} fill sizes="48px" className="object-contain p-1" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-gray-300">
                    <Plus size={16} />
                  </span>
                )}
              </button>

              <button type="button" onClick={() => openView(a)} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-semibold text-ink hover:text-accent">{a.name}</span>
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
              </button>

              <button
                type="button"
                onClick={() => openView(a)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-accent/10 hover:text-accent"
                aria-label="Швидкий перегляд"
                title="Переглянути"
              >
                <Eye size={18} />
              </button>
            </div>
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

      {viewOffer && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={closeView}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeView}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
              aria-label="Закрити"
            >
              <X size={18} />
            </button>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-50">
                  {gallery[activeImg] ? (
                    <Image src={gallery[activeImg]} alt={viewOffer.name} fill sizes="(max-width:640px) 90vw, 320px" className="object-contain p-3" />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-gray-300"><Plus size={40} /></span>
                  )}
                </div>
                {gallery.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {gallery.slice(0, 6).map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImg(i)}
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-gray-50 ${
                          i === activeImg ? "border-accent ring-1 ring-accent/30" : "border-black/10"
                        }`}
                      >
                        <Image src={src} alt="" fill sizes="56px" className="object-contain p-1" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <h3 className="pr-10 text-lg font-bold text-ink">{viewOffer.name}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xl font-bold text-accent">{uah(viewOffer.discounted_price)}</span>
                  {viewOffer.discount_percent > 0 && (
                    <>
                      <span className="text-sm text-gray-400 line-through">{uah(viewOffer.price)}</span>
                      <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                        −{viewOffer.discount_percent}%
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">Ціна зі знижкою — при купівлі разом із велосипедом</p>

                <button
                  type="button"
                  onClick={() => { addOffer(viewOffer); closeView(); open(); }}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white transition-all hover:bg-accent active:scale-95"
                >
                  <Plus size={17} /> Додати в кошик
                </button>

                {loading && <p className="mt-4 text-sm text-gray-400">Завантаження деталей…</p>}

                {details?.specs && details.specs.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-sm font-bold text-ink">Характеристики</h4>
                    <dl className="mt-2 divide-y divide-black/5 text-sm">
                      {details.specs.slice(0, 12).map((s, i) => (
                        <div key={i} className="flex justify-between gap-3 py-1.5">
                          <dt className="text-gray-500">{s.label}</dt>
                          <dd className="text-right font-medium text-ink">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </div>

            {details?.description && (
              <div className="mt-5 border-t border-black/5 pt-5">
                <h4 className="mb-2 text-sm font-bold text-ink">Опис</h4>
                <Markdown content={details.description} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
