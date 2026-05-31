"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { uah } from "@/lib/site";

type Suggestion = { slug: string; name: string; price: number; image_url: string | null; brand: string | null };

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // живі підказки з дебаунсом
  useEffect(() => {
    if (q.trim().length < 2) {
      setItems([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setItems(data.items ?? []);
        setOpen(true);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // закриття при кліку поза блоком
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = () => {
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Пошук велосипедів, аксесуарів…"
          className={`w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-accent ${
            compact ? "" : "min-w-[220px]"
          }`}
        />
        {q && (
          <button
            type="button"
            onClick={() => { setQ(""); setItems([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink"
            aria-label="Очистити"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {open && (items.length > 0 || loading) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl">
          {loading && items.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">Пошук…</div>
          ) : (
            <>
              {items.map((it) => (
                <button
                  key={it.slug}
                  type="button"
                  onClick={() => { router.push(`/bikes/${it.slug}`); setOpen(false); }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                >
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    {it.image_url ? (
                      <Image src={it.image_url} alt={it.name} fill sizes="40px" className="object-contain p-0.5" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-gray-300"><Search size={14} /></span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{it.name}</span>
                    {it.brand && <span className="text-xs text-gray-400">{it.brand}</span>}
                  </span>
                  <span className="shrink-0 text-sm font-bold text-accent">{uah(it.price)}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={submit}
                className="block w-full border-t border-black/5 px-4 py-2.5 text-center text-sm font-semibold text-accent hover:bg-accent/5"
              >
                Усі результати за «{q.trim()}»
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
