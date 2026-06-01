"use client";

import { useState, useTransition } from "react";
import { Check, Sparkles } from "lucide-react";
import { uah } from "@/lib/site";
import { saveProductAccessories } from "@/lib/accessory-actions";

type AccessoryProduct = { id: string; name: string; price: number; image_url: string | null };

export function ProductAccessoryEditor({
  productId,
  products,
  initial,
}: {
  productId: string;
  products: AccessoryProduct[];
  initial: { accessory_id: string; discount_percent: number }[];
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");
  // map accessory_id -> discount (присутність = обрано)
  const [chosen, setChosen] = useState<Map<string, number>>(
    new Map(initial.map((i) => [i.accessory_id, i.discount_percent]))
  );

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-5 text-sm text-gray-500">
        У каталозі немає товарів-аксесуарів. Додайте товари категорії «Аксесуари» — і їх можна буде пропонувати тут.
      </div>
    );
  }

  const toggle = (id: string) =>
    setChosen((prev) => {
      const next = new Map(prev);
      next.has(id) ? next.delete(id) : next.set(id, 10);
      setSaved(false);
      return next;
    });

  const setDiscount = (id: string, d: number) =>
    setChosen((prev) => {
      const next = new Map(prev);
      next.set(id, d);
      setSaved(false);
      return next;
    });

  const save = () =>
    startTransition(async () => {
      const items = [...chosen.entries()].map(([accessory_id, discount_percent]) => ({
        accessory_id,
        discount_percent,
      }));
      await saveProductAccessories(productId, items);
      setSaved(true);
    });

  // обрані — завжди показуємо; решта — за пошуком (до 30)
  const q = search.trim().toLowerCase();
  const chosenProducts = products.filter((p) => chosen.has(p.id));
  const rest = products.filter((p) => !chosen.has(p.id));
  const matches = q.length === 0 ? [] : rest.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 30);
  const visible = [...chosenProducts, ...matches];

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-accent" />
        <h2 className="text-lg font-bold">Аксесуари до цього товару</h2>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Якщо нічого не обрано — показується глобальний набір. Якщо обрати — для цього товару діятиме власний список.
      </p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Пошук аксесуара серед ${products.length}…`}
        className="mt-4 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm"
      />

      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
        {visible.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">
            {q.length === 0 ? "Почніть вводити назву, щоб знайти аксесуар" : `Нічого не знайдено за «${search}»`}
          </p>
        )}
        {visible.map((p) => {
          const active = chosen.has(p.id);
          const disc = chosen.get(p.id) ?? 10;
          return (
            <div
              key={p.id}
              className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${
                active ? "border-accent bg-accent/[0.03]" : "border-black/5 bg-gray-50"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                  active ? "border-accent bg-accent text-white" : "border-gray-300 bg-white"
                }`}
                aria-label="Обрати"
              >
                {active && <Check size={15} />}
              </button>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{p.name}</span>
              <span className="text-xs text-gray-500">{uah(p.price)}</span>
              {active && (
                <label className="flex items-center gap-1 text-xs text-gray-500">
                  −
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={disc}
                    onChange={(e) => setDiscount(p.id, Number(e.target.value))}
                    className="w-14 rounded-lg border border-black/10 px-2 py-1 text-sm"
                  />
                  %
                </label>
              )}
            </div>
          );
        })}
        {q.length > 0 && matches.length === 30 && (
          <p className="py-1 text-center text-xs text-gray-400">Показано перші 30 — уточніть пошук</p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-accent active:scale-95 disabled:opacity-40"
        >
          {pending ? "Збереження…" : "Зберегти аксесуари"}
        </button>
        {saved && <span className="text-sm font-semibold text-green-600">Збережено ✓</span>}
        <span className="text-xs text-gray-400">Обрано: {chosen.size}</span>
      </div>
    </div>
  );
}
