import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, CheckCircle2, XCircle, PackageCheck, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Повернення товару",
  description:
    "Умови повернення товару в магазині Ardis: 14 днів з дня покупки, якщо товар не використовувався і збережено товарний вигляд. Як оформити повернення.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Повернення товару</h1>
        <p className="mt-3 text-gray-600">
          Ви можете повернути товар протягом 14 днів з дня покупки відповідно до Закону України
          «Про захист прав споживачів» — за умови, що товар не використовувався.
        </p>

        <div className="mt-8 flex items-start gap-4 rounded-2xl border border-accent/20 bg-accent/5 p-6">
          <RotateCcw className="shrink-0 text-accent" size={32} />
          <div>
            <h2 className="text-lg font-bold">14 днів на повернення</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">
              Повернення можливе протягом 14 днів, не рахуючи дня покупки. Головна умова —
              товар <strong>не був у використанні</strong>: без слідів експлуатації, подряпин
              і забруднень, у повній комплектації.
            </p>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <CheckCircle2 className="text-accent" size={22} /> Умови повернення
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
            <li>• Товар не використовувався — без слідів експлуатації, зносу чи пошкоджень</li>
            <li>• Збережено товарний вигляд, заводські ярлики, пломби та упаковку</li>
            <li>• Повна комплектація: усі деталі, документи й аксесуари, що йшли в комплекті</li>
            <li>• Є розрахунковий документ — чек або підтвердження замовлення</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <XCircle className="text-gray-400" size={22} /> Коли повернення неможливе
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
            <li>• Товар використовувався: є сліди експлуатації, бруд, подряпини, потертості</li>
            <li>• Пошкоджено товарний вигляд, упаковку, зірвано пломби чи ярлики</li>
            <li>• Неповна комплектація</li>
            <li>• Минуло понад 14 днів з дня покупки</li>
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <PackageCheck className="text-accent" size={20} /> Як оформити повернення
          </h2>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
            <li>
              1. Зателефонуйте нам:{" "}
              <a href={`tel:${SITE.contacts.phoneShopRaw}`} className="font-semibold text-ink hover:text-accent">
                {SITE.contacts.phoneShop}
              </a>{" "}
              — узгодимо повернення та підкажемо наступні кроки.
            </li>
            <li>
              2. Привезіть товар у магазин (вул. Ревуцького, 40В, Київ) або відправте Новою Поштою.
              Вартість зворотної доставки при поверненні без браку сплачує покупець.
            </li>
            <li>
              3. Після перевірки стану товару повернемо кошти тим самим способом, яким була
              здійснена оплата, протягом 7 днів.
            </li>
          </ol>
        </section>

        <section className="mt-8 rounded-2xl bg-ink p-6 text-white">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Phone size={20} className="text-accent" /> Виявили заводський брак?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Це окремий випадок — він вирішується за умовами гарантії, а не повернення.
            Подробиці на сторінці{" "}
            <Link href="/warranty" className="font-semibold text-white underline hover:text-accent">
              «Гарантія»
            </Link>{" "}
            або за телефоном {SITE.contacts.phoneShop}.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
