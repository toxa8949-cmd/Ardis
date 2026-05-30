import { MapPin, Clock, Phone, Wrench } from "lucide-react";
import { SITE } from "@/lib/site";

export function Showrooms() {
  return (
    <section id="showrooms" className="bg-ink py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-accent-300">Завжди поруч</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Наші шоуруми та майстерня в Києві
          </h2>
          <p className="mt-2 text-white/60">Тест-драйв, сервіс і консультація наживо</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {SITE.showrooms.map((s) => (
            <div
              key={s.title}
              className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:ring-accent/40"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-white">
                <MapPin size={24} />
              </span>
              <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-white/60">{s.address}</p>
              <div className="mt-4 space-y-2 text-sm text-white/70">
                <p className="flex items-center gap-2">
                  <Clock size={16} className="text-accent-300" /> {s.hours}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={16} className="text-accent-300" /> {s.phone}
                </p>
              </div>
            </div>
          ))}

          {/* Майстерня */}
          <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:ring-accent/40">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-white">
              <Wrench size={24} />
            </span>
            <h3 className="mt-4 text-xl font-bold">Власна веломайстерня</h3>
            <p className="mt-1 text-sm text-white/60">
              Повний сервіс: від спицювання коліс до налаштування трансмісії будь-якої складності.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
