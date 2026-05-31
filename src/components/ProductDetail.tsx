"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShieldCheck, Truck, Factory, ShoppingCart, Check, Plus, Sparkles } from "lucide-react";
import { ProductGallery } from "./ProductGallery";
import { useCart } from "./CartProvider";
import { useToast } from "./ToastProvider";
import { uah } from "@/lib/site";
import { BADGE_LABELS, type Product, type AccessoryOffer } from "@/types";

// Інтерактивна частина сторінки товару: галерея + вибір кольору + кнопка
// з єдиним станом кольору. SEO/JSON-LD/breadcrumbs лишаються на сервері (page.tsx).
export function ProductDetail({
  product: p,
  accessories = [],
}: {
  product: Product;
  accessories?: AccessoryOffer[];
}) {
  const { add, open } = useCart();
  const toast = useToast();
  const [selectedAcc, setSelectedAcc] = useState<Set<string>>(new Set());
  const [active, setActive] = useState(0);
  const color = p.colors[active] ?? { hue: 24, name: "", hex: null, image_url: null };

  // Фото для галереї: пріоритет — фото обраного кольору, далі масив images, далі головне фото.
  const galleryImages: string[] = (() => {
    const list: string[] = [];
    if (color.image_url) list.push(color.image_url);
    if (p.images && p.images.length) list.push(...p.images);
    else if (p.image_url) list.push(p.image_url);
    // прибираємо дублі, зберігаючи порядок
    return [...new Set(list)];
  })();

  // Нормалізація назв-синонімів, щоб не було дублів (Рама / Матеріал рами тощо)
  const synonym = (label: string): string => {
    const l = label.trim().toLowerCase();
    if (l === "матеріал рами" || l === "рама") return "Рама";
    if (l === "діаметр коліс" || l === "колеса") return "Колеса";
    if (l === "гальма" || l === "тип гальма" || l === "тип гальм") return "Гальма";
    if (l === "трансмісія") return "Трансмісія";
    if (l === "кількість швидкостей" || l === "швидкості") return "Швидкості";
    return label.trim();
  };

  const baseSpecs = [
    { label: "Рама", value: p.frame },
    { label: "Колеса", value: p.wheel },
    { label: "Трансмісія", value: p.drivetrain },
    { label: "Гальма", value: p.brakes },
    ...(p.speeds ? [{ label: "Швидкості", value: String(p.speeds) }] : []),
  ].filter((s) => s.value);

  // Детальні характеристики з адмінки мають пріоритет; базові додаємо лише якщо такого поля нема.
  const extraSpecs = (p.specs ?? []).filter((s) => s.label && s.value);
  const seen = new Set<string>();
  const specs: { label: string; value: string }[] = [];
  for (const s of [...extraSpecs, ...baseSpecs]) {
    const key = synonym(s.label).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    specs.push({ label: synonym(s.label), value: s.value });
  }

  const toggleAcc = (id: string) =>
    setSelectedAcc((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const chosenAcc = accessories.filter((a) => selectedAcc.has(a.id));

  // Додає велосипед + усі відмічені аксесуари разом
  const handleAddToCart = () => {
    add(p, color.name, color.hue, { silent: true });
    chosenAcc.forEach((a) => {
      const accProduct = {
        id: a.id,
        slug: a.slug,
        name: a.name,
        price: a.price,
        image_url: a.image_url,
        images: a.images,
        type: "part",
      } as unknown as Product;
      add(accProduct, "", 0, {
        unitPrice: a.discounted_price,
        accessoryDiscount: a.discount_percent,
        silent: true,
      });
    });
    open();
    toast(
      chosenAcc.length > 0
        ? `«${p.name}» + ${chosenAcc.length} аксес. додано в кошик`
        : `«${p.name}» додано в кошик`
    );
    setSelectedAcc(new Set());
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        {/* Галерея */}
      <div>
        <ProductGallery
          images={galleryImages}
          hue={color.hue}
          type={p.type}
          alt={`${p.name}${color.name ? ` — ${color.name}` : ""}`}
        />
        {p.colors.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              Колір{color.name ? `: ${color.name}` : ""}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {p.colors.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActive(i)}
                  title={c.name}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                    active === i
                      ? "border-accent bg-accent/5 text-ink"
                      : "border-black/10 text-gray-500 hover:border-accent/40"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: c.hex ?? (c.hue === 0 ? "#0f1115" : `hsl(${c.hue} 80% 50%)`) }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Інформація */}
      <div>
        {p.badge && (
          <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent-600">
            {BADGE_LABELS[p.badge]}
          </span>
        )}
        {p.brand && (
          <span className="mt-3 block text-sm font-bold uppercase tracking-wider text-accent-600">
            {p.brand.name}
          </span>
        )}
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{p.name}</h1>

        <div className="mt-3 flex items-center gap-4">
          <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star size={16} fill="currentColor" /> {p.rating}
            <span className="font-normal text-gray-400">({p.reviews} відгуків)</span>
          </span>
          {p.in_stock ? (
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
              ● В наявності
            </span>
          ) : (
            <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">
              Немає в наявності
            </span>
          )}
        </div>

        {p.description && (
          <p className="mt-5 leading-relaxed text-gray-600">
            {p.description.split("\n")[0].replace(/[#*]/g, "").slice(0, 200)}
          </p>
        )}

        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-4xl font-bold text-ink">{uah(p.price)}</span>
          {p.old_price && (
            <span className="text-xl font-medium text-gray-400 line-through">{uah(p.old_price)}</span>
          )}
        </div>

        {/* Акційні аксесуари — компактні прямокутнички з галочкою */}
        {accessories.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Sparkles size={15} className="text-accent" />
              Додати зі знижкою
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {accessories.map((a) => {
                const on = selectedAcc.has(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAcc(a.id)}
                    className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all ${
                      on ? "border-accent bg-accent/[0.04] ring-1 ring-accent/30" : "border-black/10 bg-white hover:border-accent/40"
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                        on ? "border-accent bg-accent text-white" : "border-gray-300"
                      }`}
                    >
                      {on && <Check size={13} />}
                    </span>
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-gray-50">
                      {a.image_url ? (
                        <Image src={a.image_url} alt={a.name} fill sizes="36px" className="object-contain p-0.5" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-gray-300">
                          <Plus size={14} />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-[8.5rem] truncate text-xs font-semibold text-ink">{a.name}</span>
                      <span className="flex items-center gap-1">
                        <span className="text-xs font-bold text-accent">{uah(a.discounted_price)}</span>
                        {a.discount_percent > 0 && (
                          <span className="text-[10px] text-gray-400 line-through">{uah(a.price)}</span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-5 sm:max-w-xs">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-base font-bold text-white transition-all hover:bg-accent active:scale-[.98]"
          >
            <ShoppingCart size={18} />
            {chosenAcc.length > 0 ? `Додати в кошик (${chosenAcc.length + 1})` : "Додати в кошик"}
          </button>
          {chosenAcc.length > 0 && (
            <p className="mt-2 text-center text-xs text-gray-500">
              Велосипед + {chosenAcc.length} аксес. · економія{" "}
              <span className="font-bold text-accent">
                {uah(chosenAcc.reduce((s, a) => s + (a.price - a.discounted_price), 0))}
              </span>
            </p>
          )}
        </div>

        {/* Переваги (під кнопкою, заповнює праву колонку) */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: Factory, t: "Українське виробництво" },
            { icon: ShieldCheck, t: "Гарантія 12 місяців" },
            { icon: Truck, t: "Доставка Новою Поштою" },
          ].map((a) => (
            <div
              key={a.t}
              className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600"
            >
              <a.icon size={18} className="shrink-0 text-accent" />
              {a.t}
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Характеристики — на всю ширину */}
      {specs.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-tight">Характеристики</h2>
          <dl className="grid overflow-hidden rounded-2xl border border-black/5 sm:grid-cols-2">
            {specs.map((s, i) => (
              <div
                key={s.label}
                className={`flex justify-between gap-4 px-4 py-3 text-sm ${
                  i % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <dt className="font-medium text-gray-500">{s.label}</dt>
                <dd className="text-right font-semibold text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
