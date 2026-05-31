"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AdminPagination({ page, pages }: { page: number; pages: number }) {
  const params = useSearchParams();
  if (pages <= 1) return null;

  const hrefFor = (p: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    return `/admin/products?${next.toString()}`;
  };

  // показуємо вікно сторінок навколо поточної
  const around = 2;
  const start = Math.max(1, page - around);
  const end = Math.min(pages, page + around);
  const nums: number[] = [];
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 bg-white hover:border-accent hover:text-accent" aria-label="Попередня">
          <ChevronLeft size={16} />
        </Link>
      )}
      {start > 1 && (
        <>
          <Link href={hrefFor(1)} className="grid h-9 min-w-9 place-items-center rounded-lg border border-black/10 bg-white px-2 text-sm hover:border-accent">1</Link>
          {start > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}
      {nums.map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-semibold ${
            n === page ? "border-accent bg-accent text-white" : "border-black/10 bg-white hover:border-accent"
          }`}
        >
          {n}
        </Link>
      ))}
      {end < pages && (
        <>
          {end < pages - 1 && <span className="px-1 text-gray-400">…</span>}
          <Link href={hrefFor(pages)} className="grid h-9 min-w-9 place-items-center rounded-lg border border-black/10 bg-white px-2 text-sm hover:border-accent">{pages}</Link>
        </>
      )}
      {page < pages && (
        <Link href={hrefFor(page + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 bg-white hover:border-accent hover:text-accent" aria-label="Наступна">
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}
