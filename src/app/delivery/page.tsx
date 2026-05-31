import type { Metadata } from "next";
import { Truck, CreditCard, Store, Banknote } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Оплата та доставка",
  description:
    "Способи оплати та доставки велосипедів Ardis: Нова Пошта по всій Україні, самовивіз із магазину в Києві, оплата карткою або при отриманні.",
  alternates: { canonical: "/delivery" },
};

export default function DeliveryPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Оплата та доставка</h1>
        <p className="mt-3 text-gray-600">
          Ми намагаємось зробити покупку максимально зручною: обирайте спосіб доставки й оплати, який
          підходить саме вам.
        </p>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Truck className="text-accent" size={22} /> Доставка
          </h2>
          <div className="mt-4 space-y-4 text-gray-700">
            <div className="rounded-2xl border border-black/5 bg-white p-5">
              <h3 className="font-semibold text-ink">Нова Пошта по всій Україні</h3>
              <p className="mt-1 text-sm leading-relaxed">
                Надсилаємо замовлення у відділення або поштомат Нової Пошти в будь-яке місто України.
                Вартість доставки — за тарифами перевізника, оплачується при отриманні. Великогабаритні
                велосипеди відправляються відповідно до правил перевезення Нової Пошти.
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-5">
              <h3 className="flex items-center gap-2 font-semibold text-ink">
                <Store size={16} className="text-accent" /> Самовивіз
              </h3>
              <p className="mt-1 text-sm leading-relaxed">{SITE.contacts.pickup}.</p>
              <p className="mt-1 text-sm text-gray-500">{SITE.contacts.hoursWeekday} · {SITE.contacts.hoursWeekend}</p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <CreditCard className="text-accent" size={22} /> Оплата
          </h2>
          <div className="mt-4 space-y-4 text-gray-700">
            <div className="rounded-2xl border border-black/5 bg-white p-5">
              <h3 className="font-semibold text-ink">Оплата при отриманні</h3>
              <p className="mt-1 text-sm leading-relaxed">
                Сплачуєте замовлення у відділенні Нової Пошти під час отримання (накладений платіж) або
                на місці при самовивозі — готівкою чи карткою.
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-5">
              <h3 className="flex items-center gap-2 font-semibold text-ink">
                <Banknote size={16} className="text-accent" /> Безготівкова оплата
              </h3>
              <p className="mt-1 text-sm leading-relaxed">
                Доступна оплата карткою та банківським переказом. Менеджер надішле реквізити або
                посилання на оплату після оформлення замовлення.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-10 rounded-2xl bg-gray-50 p-5 text-sm text-gray-600">
          Залишились питання щодо доставки чи оплати? Зателефонуйте до магазину{" "}
          <a href={`tel:${SITE.contacts.phoneShopRaw}`} className="font-semibold text-ink hover:text-accent">
            {SITE.contacts.phoneShop}
          </a>{" "}
          — підкажемо найзручніший варіант.
        </p>
      </main>
      <Footer />
    </>
  );
}
