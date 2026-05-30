"use client";

import Link from "next/link";
import { Bike } from "lucide-react";

const NAV = [
  { href: "#catalog", label: "Каталог" },
  { href: "#calculator", label: "Підбір розміру" },
  { href: "#showrooms", label: "Шоуруми" },
];

export function Header() {
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
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-ink"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <a
          href="#catalog"
          className="rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent"
        >
          Обрати велосипед
        </a>
      </div>
    </header>
  );
}
