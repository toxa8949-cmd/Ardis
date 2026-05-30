"use client";

import { useState } from "react";
import { Star, ShieldCheck, Truck, Factory } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { AddToCartButton } from "./AddToCartButton";
import { uah } from "@/lib/site";
import { BADGE_LABELS, type Product } from "@/types";

// Інтерактивна частина сторінки товару: галерея + вибір кольору + кнопка
// з єдиним станом кольору. SEO/JSON-LD/breadcrumbs лишаються на сервері (page.tsx).
export function ProductDetail({ product: p }: { product: Product }) {
  const [active, setActive] = useState(0);
  const color = p.colors[active] ?? { hue: 24, name: "", hex: null, image_url: null };

  const baseSpecs = [
    { label: "Рама", value: p.frame },
    { label: "Колеса", value: p.wheel },
    { label: "Трансмісія", value: p.drivetrain },
    { label: "Гальма", value: p.brakes },
    ...(p.speeds ? [{ label: "Швидкості", value: String(p.speeds) }] : []),
  ].filter((s) => s.value);
  // Додаткові характеристики з адмінки (вилка, обода, вага тощо)
  const extraSpecs = (p.specs ?? []).filter((s) => s.label && s.value);
  const specs = [...baseSpecs, ...extraSpecs];

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Галерея */}
      <div>
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
          <ProductImage
            imageUrl={color.image_url ?? p.image_url}
            hue={color.hue}
            type={p.type}
            alt={`${p.name}${color.name ? ` — ${color.name}` : ""}`}
            className="h-72 w-full sm:h-96"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
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

        {p.description && <p className="mt-5 leading-relaxed text-gray-600">{p.description}</p>}

        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-4xl font-bold text-ink">{uah(p.price)}</span>
          {p.old_price && (
            <span className="text-xl font-medium text-gray-400 line-through">{uah(p.old_price)}</span>
          )}
        </div>

        <div className="mt-5 sm:max-w-xs">
          <AddToCartButton
            product={p}
            colorIndex={active}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-base font-bold text-white transition-all hover:bg-accent active:scale-[.98]"
            label="Додати в кошик"
          />
        </div>

        {/* Специфікації */}
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Характеристики</h2>
          <dl className="overflow-hidden rounded-2xl border border-black/5">
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

        {/* Переваги */}
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
  );
}
