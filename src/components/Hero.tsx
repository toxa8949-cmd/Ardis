import { Factory, ShieldCheck, Truck } from "lucide-react";
import { BikeArt } from "./BikeArt";

const ADVANTAGES = [
  { icon: Factory, title: "Українське виробництво", text: "Власний завод у Києві" },
  { icon: ShieldCheck, title: "Заводська гарантія", text: "12 місяців офіційно" },
  { icon: Truck, title: "Швидка доставка", text: "Новою Поштою по Україні" },
];

export function Hero() {
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
              href="/catalog"
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
          <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-tr from-accent/10 to-transparent p-8">
            <BikeArt hue={24} className="w-full drop-shadow-[0_20px_50px_rgba(249,115,22,0.25)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
