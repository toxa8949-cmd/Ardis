"use client";

import Link from "next/link";
import { useState } from "react";
import { Bike, ShoppingCart, ChevronDown } from "lucide-react";
import { useCart } from "./CartProvider";

// Категорії велосипедів для випадного меню (відповідають slug у БД)
const BIKE_CATEGORIES = [
  { slug: "girski", name: "Гірські" },
  { slug: "dvopidvisy", name: "Двопідвіси" },
  { slug: "komfortni", name: "Комфортні" },
  { slug: "dorozhni", name: "Дорожні" },
  { slug: "pidlitkovi", name: "Підліткові" },
  { slug: "girski-dytyachi", name: "Гірські дитячі" },
  { slug: "dytyachi", name: "Дитячі" },
  { slug: "bmx", name: "BMX" },
  { slug: "elektrovelosipedi", name: "Електровелосипеди" },
  { slug: "inshi", name: "Інші" },
];

const ACCESSORY_CATEGORIES = [
  { slug: "acc-svitlo", name: "Освітлення" },
  { slug: "acc-zamky", name: "Замки" },
  { slug: "acc-kryla", name: "Крила" },
  { slug: "acc-nasosy", name: "Насоси та ремонт" },
  { slug: "acc-dzvinky", name: "Дзвінки та сигнали" },
  { slug: "acc-bagazhnyky", name: "Багажники та корзини" },
  { slug: "acc-zakhyst", name: "Шоломи та захист" },
  { slug: "acc-sumky", name: "Сумки" },
  { slug: "acc-inshe", name: "Інші аксесуари" },
];

export function Header() {
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accMenuOpen, setAccMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent to-amber-500 text-white shadow-md shadow-accent/20">
            <Bike size={22} />
          </span>
          <span className="text-xl font-bold tracking-tight">Ardis</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {/* Велосипеди із випадним меню підкатегорій */}
          <div
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <Link
              href="/bikes"
              className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-ink"
            >
              Велосипеди <ChevronDown size={15} />
            </Link>
            {menuOpen && (
              <div className="absolute left-0 top-full w-60 pt-2">
                <div className="rounded-2xl border border-black/5 bg-white p-2 shadow-xl">
                  <Link
                    href="/bikes"
                    className="block rounded-lg px-3 py-2 text-sm font-bold text-ink transition-colors hover:bg-accent/10 hover:text-accent-600"
                  >
                    Усі велосипеди
                  </Link>
                  <div className="my-1 border-t border-black/5" />
                  {BIKE_CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/bikes?category=${c.slug}`}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-accent/10 hover:text-accent-600"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Аксесуари із випадним меню типів */}
          <div
            className="relative"
            onMouseEnter={() => setAccMenuOpen(true)}
            onMouseLeave={() => setAccMenuOpen(false)}
          >
            <Link
              href="/accessories"
              className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-ink"
            >
              Аксесуари <ChevronDown size={15} />
            </Link>
            {accMenuOpen && (
              <div className="absolute left-0 top-full w-60 pt-2">
                <div className="rounded-2xl border border-black/5 bg-white p-2 shadow-xl">
                  <Link
                    href="/accessories"
                    className="block rounded-lg px-3 py-2 text-sm font-bold text-ink transition-colors hover:bg-accent/10 hover:text-accent-600"
                  >
                    Усі аксесуари
                  </Link>
                  <div className="my-1 border-t border-black/5" />
                  {ACCESSORY_CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/accessories?category=${c.slug}`}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-accent/10 hover:text-accent-600"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/#calculator" className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-ink">
            Підбір розміру
          </Link>
          <Link href="/blog" className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-ink">
            Блог
          </Link>
          <Link href="/#showrooms" className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-ink">
            Шоуруми
          </Link>
        </nav>

        <button
          onClick={open}
          className="relative flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent"
        >
          <ShoppingCart size={18} />
          <span className="hidden sm:inline">Кошик</span>
          {count > 0 && (
            <span className="grid min-w-[20px] place-items-center rounded-full bg-accent px-1.5 py-0.5 text-xs ring-2 ring-paper">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
