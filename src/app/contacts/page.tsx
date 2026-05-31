import type { Metadata } from "next";
import { MapPin, Clock, Phone, Wrench, Store } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакти",
  description:
    "Контакти магазину Ardis: адреса в Києві, графік роботи, телефони магазину та веломайстерні, самовивіз і доставка Новою Поштою.",
  alternates: { canonical: "/contacts" },
};

const c = SITE.contacts;

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Контакти</h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Завітайте до нас або зателефонуйте — допоможемо підібрати велосипед, проконсультуємо щодо
          доставки та обслуговування.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <MapPin className="text-accent" size={22} />
            <h2 className="mt-3 text-lg font-bold">Адреса</h2>
            <p className="mt-1 text-gray-600">{c.address}</p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <Clock className="text-accent" size={22} />
            <h2 className="mt-3 text-lg font-bold">Графік роботи</h2>
            <p className="mt-1 text-gray-600">{c.hoursWeekday}</p>
            <p className="text-gray-600">{c.hoursWeekend}</p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <Phone className="text-accent" size={22} />
            <h2 className="mt-3 text-lg font-bold">Магазин</h2>
            <a
              href={`tel:${c.phoneShopRaw}`}
              className="mt-1 inline-block text-lg font-semibold text-ink hover:text-accent"
            >
              {c.phoneShop}
            </a>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <Wrench className="text-accent" size={22} />
            <h2 className="mt-3 text-lg font-bold">Веломайстерня</h2>
            <a
              href={`tel:${c.phoneServiceRaw}`}
              className="mt-1 inline-block text-lg font-semibold text-ink hover:text-accent"
            >
              {c.phoneService}
            </a>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-black/5 bg-gray-50 p-6">
          <Store className="text-accent" size={22} />
          <h2 className="mt-3 text-lg font-bold">Самовивіз і доставка</h2>
          <p className="mt-1 text-gray-600">{c.pickup}</p>
          <p className="mt-1 text-gray-600">{c.delivery}</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
