"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BikeArt } from "./BikeArt";
import type { ProductType } from "@/types";

// Галерея фото товару з гортанням: стрілки, свайп на тач, крапки, клавіатура.
// Якщо фото немає — показує згенерований SVG (BikeArt).
export function ProductGallery({
  images,
  hue = 24,
  type = "bike",
  alt,
}: {
  images: string[];
  hue?: number;
  type?: ProductType;
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const total = images.length;

  // Скидаємо індекс, якщо набір фото змінився (інша модель/колір)
  useEffect(() => {
    setIndex(0);
  }, [images]);

  if (total === 0) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
        <BikeArt hue={hue} type={type} className="h-72 w-full sm:h-96" />
      </div>
    );
  }

  const go = (dir: number) => setIndex((i) => (i + dir + total) % total);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div>
      <div
        className="group relative overflow-hidden rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        tabIndex={0}
        role="region"
        aria-label="Галерея фото товару"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        <div className="relative h-72 w-full sm:h-96">
          <Image
            src={images[index]}
            alt={`${alt} — фото ${index + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={index === 0}
            className="object-contain"
          />
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Попереднє фото"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md ring-1 ring-black/5 transition-all hover:bg-white hover:scale-105 active:scale-95"
            >
              <ChevronLeft size={20} className="text-ink" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Наступне фото"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md ring-1 ring-black/5 transition-all hover:bg-white hover:scale-105 active:scale-95"
            >
              <ChevronRight size={20} className="text-ink" />
            </button>
            <span className="absolute bottom-3 right-4 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white">
              {index + 1} / {total}
            </span>
          </>
        )}
      </div>

      {/* Мініатюри */}
      {total > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Фото ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white transition-all ${
                i === index ? "border-accent ring-2 ring-accent/30" : "border-black/10 hover:border-accent/40"
              }`}
            >
              <Image src={src} alt={`${alt} — мініатюра ${i + 1}`} fill sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
