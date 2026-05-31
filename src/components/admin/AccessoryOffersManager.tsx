"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus } from "lucide-react";
import { uah } from "@/lib/site";
import {
  addAccessoryOffer,
  updateAccessoryOffer,
  removeAccessoryOffer,
} from "@/lib/accessory-actions";

type Offer = {
  id: string;
  accessory_id: string;
  name: string;
  price: number;
  image_url: string | null;
  discount_percent: number;
  active: boolean;
};
type AccessoryProduct = { id: string; name: string; price: number; image_url: string | null };

export function AccessoryOffersManager({
  offers,
  products,
}: {
  offers: Offer[];
  products: AccessoryProduct[];
}) {
  const [pending, startTransition] = useTransition();
  const [newId, setNewId] = useState("");
  const [newDiscount, setNewDiscount] = useState(10);

  // товари, яких ще немає в наборі
  const available = products.filter((p) => !offers.some((o) => o.accessory_id === p.id));

  return (
    <div className="space-y-6">
      {/* Додати новий */}
      <div className="rounded-2xl border border-black/5 bg-white p-5">
        <h2 className="text-lg font-bold">Додати аксесуар до набору</h2>
        <p className="mt-1 text-sm text-gray-500">
          Ці аксесуари пропонуються до всіх велосипедів (якщо для товару не задано власний набір).
        </p>
        {products.length === 0 ? (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            У каталозі ще немає товарів категорії «Аксесуари» або «Запчастини». Спершу додайте такі товари.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="text-xs font-semibold text-gray-500">Аксесуар</span>
              <select
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm"
              >
                <option value="">— оберіть товар —</option>
                {available.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({uah(p.price)})
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:w-32">
              <span className="text-xs font-semibold text-gray-500">Знижка, %</span>
              <input
                type="number"
                min={0}
                max={90}
                value={newDiscount}
                onChange={(e) => setNewDiscount(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm"
              />
            </label>
            <button
              type="button"
              disabled={!newId || pending}
              onClick={() =>
                startTransition(async () => {
                  await addAccessoryOffer(newId, newDiscount);
                  setNewId("");
                  setNewDiscount(10);
                })
              }
              className="flex items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-accent active:scale-95 disabled:opacity-40"
            >
              <Plus size={16} /> Додати
            </button>
          </div>
        )}
      </div>

      {/* Поточний набір */}
      <div className="rounded-2xl border border-black/5 bg-white p-5">
        <h2 className="text-lg font-bold">Поточний набір ({offers.length})</h2>
        {offers.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Поки порожньо — додайте аксесуари вище.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {offers.map((o) => (
              <OfferRow key={o.id} offer={o} pending={pending} startTransition={startTransition} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferRow({
  offer,
  pending,
  startTransition,
}: {
  offer: Offer;
  pending: boolean;
  startTransition: (cb: () => Promise<void>) => void;
}) {
  const [discount, setDiscount] = useState(offer.discount_percent);
  const [active, setActive] = useState(offer.active);
  const discounted = Math.round(offer.price * (1 - discount / 100));

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-black/5 bg-gray-50 p-3">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{offer.name}</span>
        <span className="text-xs text-gray-500">
          {uah(offer.price)} → <span className="font-bold text-accent">{uah(discounted)}</span>
        </span>
      </span>

      <label className="flex items-center gap-1.5 text-xs text-gray-500">
        Знижка
        <input
          type="number"
          min={0}
          max={90}
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          className="w-16 rounded-lg border border-black/10 px-2 py-1.5 text-sm"
        />
        %
      </label>

      <label className="flex items-center gap-1.5 text-xs text-gray-500">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Активний
      </label>

      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(async () => { await updateAccessoryOffer(offer.id, discount, active); })}
        className="rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-white hover:bg-accent disabled:opacity-40"
      >
        Зберегти
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm("Прибрати цей аксесуар з набору?")) {
            startTransition(async () => { await removeAccessoryOffer(offer.id); });
          }
        }}
        className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
        aria-label="Видалити"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
