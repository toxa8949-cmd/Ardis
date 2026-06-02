import { Factory, ShieldCheck, Truck, ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { uah } from "@/lib/site";
import type { Product } from "@/types";

const ADVANTAGES = [
  { icon: Factory, title: "Українське виробництво", text: "Власний завод у Києві" },
  { icon: ShieldCheck, title: "Заводська гарантія", text: "12 місяців офіційно" },
  { icon: Truck, title: "Швидка доставка", text: "Новою Поштою по Україні" },
];

export function Hero({ product }: { product?: Product | null }) {
  // Короткі фічі-пігулки поверх фото — з характеристик товару (лише ті, що заповнені).
  const pills: string[] = product
    ? [
        product.frame && `Рама ${product.frame}`,
        product.wheel && `Колеса ${product.wheel}`,
        product.speeds ? `${product.speeds} швидкостей` : null,
        product.brakes && product.brakes.length < 28 ? product.brakes : null,
      ].filter((x): x is string => Boolean(x)).slice(0, 3)
    : [];
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* Атмосферний фон */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 25%, #f97316 0, transparent 42%), radial-gradient(circle at 82% 70%, #f59e0b 0, transparent 46%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "46px 46px",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent-300">
            <Factory size={14} /> Виготовлено в Україні 🇺🇦
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Ardis: твій рух,
            <br />
            <span className="bg-gradient-to-r from-accent-300 to-amber-200 bg-clip-text text-transparent">
              твоя свобода
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Велосипеди українського виробництва: гірські, міські та гравійні моделі сезону
            2026. Заводська гарантія, професійна збірка та доставка по всій Україні.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/bikes"
              className="rounded-2xl bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-accent/25 transition-all hover:bg-accent-600 active:scale-95"
            >
              Каталог 2026
            </a>
            <a
              href="/#calculator"
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold backdrop-blur transition-all hover:bg-white/10 active:scale-95"
            >
              Підібрати розмір
            </a>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {ADVANTAGES.map((a) => (
              <div key={a.title} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <a.icon size={22} className="text-accent-300" />
                <p className="mt-2 text-sm font-bold">{a.title}</p>
                <p className="text-xs text-white/55">{a.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:col-span-5 lg:block">
          <div className="relative">
            {/* Бейдж ТОП-модель */}
            <span className="absolute -top-3 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-accent/30">
              🔥 Топ модель
            </span>

            <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white shadow-2xl shadow-accent/20">
              <div className="relative">
                <Image
                  src="/hero-bike.webp"
                  alt={product ? `${product.name} — велосипед Ardis` : "Гірський велосипед Ardis 29 TUCAN"}
                  width={1920}
                  height={1160}
                  priority
                  sizes="(max-width: 1024px) 0px, 40vw"
                  className="h-auto w-full object-contain"
                />

                {/* Плаваючі фічі-пігулки поверх фото */}
                {pills.length > 0 && (
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                    {pills.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-ink/85 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Інфоблок товару під фото */}
              {product && (
                <div className="border-t border-black/5 p-5">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star size={13} fill="currentColor" /> {product.rating}
                    <span className="font-normal text-gray-400">· хіт продажів</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-base font-bold text-ink">{product.name}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-ink">{uah(product.price)}</span>
                      {product.old_price && (
                        <span className="text-sm font-medium text-gray-400 line-through">{uah(product.old_price)}</span>
                      )}
                    </div>
                    <Link
                      href={`/bikes/${product.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-accent active:scale-95"
                    >
                      Детальніше <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
