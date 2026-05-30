"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ArrowUpRight } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { AddToCartButton } from "./AddToCartButton";
import { uah } from "@/lib/site";
import { BADGE_LABELS, type Product } from "@/types";

const BADGE_CLASS: Record<string, string> = {
  hit: "bg-gradient-to-r from-orange-500 to-amber-500",
  new: "bg-gradient-to-r from-emerald-500 to-teal-500",
  sale: "bg-gradient-to-r from-rose-500 to-pink-500",
};

export function ProductCard({ p }: { p: Product }) {
  const [active, setActive] = useState(0);
  const color = p.colors[active] ?? { hue: 24, name: "", hex: null, image_url: null };

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/5">
      <Link href={`/bikes/${p.slug}`} className="relative block overflow-hidden rounded-2xl">
        <ProductImage
          imageUrl={color.image_url ?? p.image_url}
          hue={color.hue}
          type={p.type}
          alt={p.name}
          sizes="(max-width: 640px) 100vw, 25vw"
          className="h-48 w-full transition-transform duration-500 group-hover:scale-105"
        />
        {p.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow-md ${BADGE_CLASS[p.badge]}`}
          >
            {BADGE_LABELS[p.badge]}
          </span>
        )}
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-md backdrop-blur transition-opacity group-hover:opacity-100">
          <ArrowUpRight size={17} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-2 pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-amber-500">
            <Star size={13} fill="currentColor" /> {p.rating}
            <span className="font-normal text-gray-400">({p.reviews})</span>
          </span>
          {p.in_stock ? (
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              ● В наявності
            </span>
          ) : (
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
              Немає
            </span>
          )}
        </div>

        <Link href={`/bikes/${p.slug}`}>
          {p.brand && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent-600">
              {p.brand.name}
            </span>
          )}
          <h3 className="mt-0.5 line-clamp-1 text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-accent">
            {p.name}
          </h3>
        </Link>

        {/* Специфікації */}
        <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px] font-medium text-gray-600">
          <span className="truncate rounded-lg bg-gray-50 px-2 py-1.5" title={p.frame}>🧱 {p.frame}</span>
          <span className="truncate rounded-lg bg-gray-50 px-2 py-1.5" title={p.wheel}>⭕ {p.wheel}</span>
          <span className="col-span-2 truncate rounded-lg bg-gray-50 px-2 py-1.5" title={p.drivetrain}>⚙️ {p.drivetrain}</span>
        </div>

        {/* Вибір кольору */}
        {p.colors.length > 1 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Колір</span>
            <div className="flex gap-1.5">
              {p.colors.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActive(i)}
                  title={c.name}
                  aria-label={c.name}
                  style={{ backgroundColor: c.hex ?? (c.hue === 0 ? "#0f1115" : `hsl(${c.hue} 80% 50%)`) }}
                  className={`h-5 w-5 rounded-full ring-offset-2 transition-transform ${
                    active === i ? "scale-110 ring-2 ring-accent" : "opacity-70 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-ink">{uah(p.price)}</span>
            {p.old_price && (
              <span className="text-sm font-medium text-gray-400 line-through">{uah(p.old_price)}</span>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <AddToCartButton product={p} colorIndex={active} label="У кошик" />
            <Link
              href={`/bikes/${p.slug}`}
              className="grid shrink-0 place-items-center rounded-xl border border-black/10 px-3 text-sm font-bold text-gray-600 transition-colors hover:border-accent hover:text-accent"
              aria-label="Детальніше"
            >
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
