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
  wheel_min: number | null;
  wheel_max: number | null;
  exclude_electro: boolean;
  exclude_kids: boolean;
  in_stock_only: boolean;
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
  const [search, setSearch] = useState("");

  // товари, яких ще немає в наборі
  const available = products.filter((p) => !offers.some((o) => o.accessory_id === p.id));
  // пошук по назві (показуємо до 40 збігів)
  const q = search.trim().toLowerCase();
  const matches = q.length === 0
    ? available.slice(0, 40)
    : available.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 40);
  const selected = products.find((p) => p.id === newId);

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
            У каталозі ще немає аксесуарів. Спершу імпортуйте товари-аксесуари.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1">
                <span className="text-xs font-semibold text-gray-500">Пошук аксесуара ({available.length} доступно)</span>
                <input
                  type="text"
                  value={selected ? selected.name : search}
                  onChange={(e) => { setSearch(e.target.value); setNewId(""); }}
                  placeholder="Почніть вводити назву…"
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm"
                />
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
                    setSearch("");
                    setNewDiscount(10);
                  })
                }
                className="flex items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-accent active:scale-95 disabled:opacity-40"
              >
                <Plus size={16} /> Додати
              </button>
            </div>

            {/* Результати пошуку (ховаємо, коли товар уже обрано) */}
            {!newId && (search.length > 0 || available.length <= 40) && (
              <div className="max-h-72 overflow-y-auto rounded-xl border border-black/10">
                {matches.length === 0 ? (
                  <p className="p-3 text-sm text-gray-400">Нічого не знайдено за «{search}»</p>
                ) : (
                  matches.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setNewId(p.id); }}
                      className="flex w-full items-center gap-3 border-b border-black/5 px-3 py-2 text-left last:border-0 hover:bg-gray-50"
                    >
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="h-10 w-10 shrink-0 rounded-lg bg-gray-100" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                      <span className="shrink-0 text-xs font-semibold text-gray-500">{uah(p.price)}</span>
                    </button>
                  ))
                )}
                {q.length > 0 && matches.length === 40 && (
                  <p className="p-2 text-center text-xs text-gray-400">Показано перші 40 — уточніть пошук</p>
                )}
              </div>
            )}
            {newId && selected && (
              <div className="flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-sm">
                <span className="flex-1">Обрано: <b>{selected.name}</b></span>
                <button type="button" onClick={() => { setNewId(""); setSearch(""); }} className="text-xs text-gray-500 hover:text-ink">змінити</button>
              </div>
            )}
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
  const [wheelMin, setWheelMin] = useState<string>(offer.wheel_min?.toString() ?? "");
  const [wheelMax, setWheelMax] = useState<string>(offer.wheel_max?.toString() ?? "");
  const [exElectro, setExElectro] = useState(offer.exclude_electro);
  const [exKids, setExKids] = useState(offer.exclude_kids);
  const [inStock, setInStock] = useState(offer.in_stock_only);
  const discounted = Math.round(offer.price * (1 - discount / 100));

  const save = () =>
    startTransition(async () => {
      await updateAccessoryOffer(offer.id, {
        discount,
        active,
        wheel_min: wheelMin === "" ? null : Number(wheelMin),
        wheel_max: wheelMax === "" ? null : Number(wheelMax),
        exclude_electro: exElectro,
        exclude_kids: exKids,
        in_stock_only: inStock,
      });
    });

  return (
    <div className="rounded-xl border border-black/5 bg-gray-50 p-3">
      <div className="flex flex-wrap items-center gap-3">
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
          onClick={save}
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

      {/* Правила сумісності */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/5 pt-3 text-xs text-gray-600">
        <span className="font-semibold text-gray-400">Показувати:</span>
        <label className="flex items-center gap-1.5">
          колеса від
          <input
            type="number"
            value={wheelMin}
            placeholder="—"
            onChange={(e) => setWheelMin(e.target.value)}
            className="w-14 rounded-lg border border-black/10 px-2 py-1 text-sm"
          />
          до
          <input
            type="number"
            value={wheelMax}
            placeholder="—"
            onChange={(e) => setWheelMax(e.target.value)}
            className="w-14 rounded-lg border border-black/10 px-2 py-1 text-sm"
          />
          ″
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={exElectro} onChange={(e) => setExElectro(e.target.checked)} />
          не для електро
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={exKids} onChange={(e) => setExKids(e.target.checked)} />
          не для дитячих
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          лише в наявності
        </label>
      </div>
    </div>
  );
}
