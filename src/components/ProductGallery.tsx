"use client";

import { useState } from "react";
import { BikeArt } from "./BikeArt";
import type { Product } from "@/types";

// Інтерактивна «галерея» товару: великий перегляд + вибір кольору.
// Колір змінює відтінок SVG наживо.
export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const color = product.colors[active] ?? { hue: 24, name: "" };

  return (
    <div>
      <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
        <BikeArt hue={color.hue} type={product.type} className="h-72 w-full sm:h-96" />
      </div>

      {product.colors.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            Колір{color.name ? `: ${color.name}` : ""}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActive(i)}
                title={c.name}
                aria-label={c.name}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                  active === i
                    ? "border-accent bg-accent/5 text-ink"
                    : "border-black/10 text-gray-500 hover:border-accent/40"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: c.hue === 0 ? "#0f1115" : `hsl(${c.hue} 80% 50%)` }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
