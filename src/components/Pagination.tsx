"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<number | null>(null);

  if (pages <= 1) return null;

  const go = (p: number) => {
    if (p === page) return;
    setTarget(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const next = new URLSearchParams(params.toString());
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    const qs = next.toString();
    startTransition(() => {
      router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  const nums: (number | "...")[] = [];
  const add = (n: number) => { if (!nums.includes(n) && n >= 1 && n <= pages) nums.push(n); };
  add(1); add(2);
  for (let i = page - 1; i <= page + 1; i++) add(i);
  add(pages - 1); add(pages);
  const sorted = [...new Set(nums)].sort((a, b) => (a as number) - (b as number));
  const withGaps: (number | "...")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if ((n as number) - prev > 1) withGaps.push("...");
    withGaps.push(n);
    prev = n as number;
  }

  const Spinner = () => (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );

  return (
    <div className={`mt-10 flex flex-wrap items-center justify-center gap-2 transition-opacity ${isPending ? "opacity-60" : ""}`}>
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1 || isPending}
        className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-gray-600 transition-colors hover:border-accent/40 disabled:opacity-30"
        aria-label="Попередня сторінка"
      >
        <ChevronLeft size={18} />
      </button>

      {withGaps.map((n, i) =>
        n === "..." ? (
          <span key={`g${i}`} className="px-1 text-gray-400">…</span>
        ) : (
          <button
            key={n}
            onClick={() => go(n as number)}
            disabled={isPending}
            className={`grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-sm font-semibold transition-colors ${
              n === page
                ? "border-accent bg-accent text-white"
                : "border-black/10 text-gray-600 hover:border-accent/40"
            }`}
          >
            {isPending && target === n ? <Spinner /> : n}
          </button>
        )
      )}

      <button
        onClick={() => go(page + 1)}
        disabled={page >= pages || isPending}
        className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-gray-600 transition-colors hover:border-accent/40 disabled:opacity-30"
        aria-label="Наступна сторінка"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
