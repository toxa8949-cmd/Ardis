"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, ChevronDown, Menu, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { SearchBar } from "./SearchBar";

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
  // мобільне меню
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mBikes, setMBikes] = useState(false);
  const [mAcc, setMAcc] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
    setMBikes(false);
    setMAcc(false);
  };

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        {/* Бургер (мобільний) */}
        <button
          onClick={() => setMobileOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-gray-100 md:hidden"
          aria-label="Меню"
        >
          <Menu size={22} />
        </button>

        <Link href="/" className="flex items-center">
          <Image
            src="/logo-ardis-black.png"
            alt="Ardis"
            width={150}
            height={44}
            priority
            className="h-8 w-auto object-contain sm:h-9"
          />
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

        <div className="hidden flex-1 px-4 lg:block lg:max-w-xs">
          <SearchBar />
        </div>

        <button
          onClick={open}
          className="relative flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent sm:px-5"
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

      {/* МОБІЛЬНЕ МЕНЮ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* затемнення */}
          <div className="absolute inset-0 bg-black/40" onClick={closeMobile} />
          {/* панель */}
          <div className="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3.5">
              <span className="flex items-center font-bold">
                <Image
                  src="/logo-ardis-black.png"
                  alt="Ardis"
                  width={130}
                  height={38}
                  className="h-7 w-auto object-contain"
                />
              </span>
              <button onClick={closeMobile} className="grid h-9 w-9 place-items-center rounded-xl text-gray-500 hover:bg-gray-100" aria-label="Закрити">
                <X size={20} />
              </button>
            </div>

            <div className="border-b border-black/5 p-4">
              <SearchBar compact />
            </div>

            <nav className="flex-1 overflow-y-auto p-2">
              {/* Велосипеди (аккордеон) */}
              <button
                onClick={() => setMBikes((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-base font-bold text-ink hover:bg-gray-50"
              >
                Велосипеди
                <ChevronDown size={18} className={`transition-transform ${mBikes ? "rotate-180" : ""}`} />
              </button>
              {mBikes && (
                <div className="mb-1 ml-2 border-l border-black/5 pl-2">
                  <Link href="/bikes" onClick={closeMobile} className="block rounded-lg px-3 py-2 text-sm font-semibold text-accent-600 hover:bg-accent/5">
                    Усі велосипеди
                  </Link>
                  {BIKE_CATEGORIES.map((c) => (
                    <Link key={c.slug} href={`/bikes?category=${c.slug}`} onClick={closeMobile} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-accent/5 hover:text-accent-600">
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Аксесуари (аккордеон) */}
              <button
                onClick={() => setMAcc((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-base font-bold text-ink hover:bg-gray-50"
              >
                Аксесуари
                <ChevronDown size={18} className={`transition-transform ${mAcc ? "rotate-180" : ""}`} />
              </button>
              {mAcc && (
                <div className="mb-1 ml-2 border-l border-black/5 pl-2">
                  <Link href="/accessories" onClick={closeMobile} className="block rounded-lg px-3 py-2 text-sm font-semibold text-accent-600 hover:bg-accent/5">
                    Усі аксесуари
                  </Link>
                  {ACCESSORY_CATEGORIES.map((c) => (
                    <Link key={c.slug} href={`/accessories?category=${c.slug}`} onClick={closeMobile} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-accent/5 hover:text-accent-600">
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}

              <Link href="/#calculator" onClick={closeMobile} className="block rounded-xl px-3 py-3 text-base font-bold text-ink hover:bg-gray-50">
                Підбір розміру
              </Link>
              <Link href="/blog" onClick={closeMobile} className="block rounded-xl px-3 py-3 text-base font-bold text-ink hover:bg-gray-50">
                Блог
              </Link>
              <Link href="/#showrooms" onClick={closeMobile} className="block rounded-xl px-3 py-3 text-base font-bold text-ink hover:bg-gray-50">
                Шоуруми
              </Link>

              <div className="my-2 border-t border-black/5" />
              <Link href="/delivery" onClick={closeMobile} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Оплата та доставка
              </Link>
              <Link href="/warranty" onClick={closeMobile} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Гарантія
              </Link>
              <Link href="/about" onClick={closeMobile} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Про нас
              </Link>
              <Link href="/contacts" onClick={closeMobile} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Контакти
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
