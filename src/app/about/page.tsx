import type { Metadata } from "next";
import { Factory, Award, Truck, Headphones } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Про нас",
  description:
    "Ardis — український виробник велосипедів. Власне виробництво, широкий модельний ряд, заводська гарантія та сервіс. Дізнайтесь більше про компанію.",
  alternates: { canonical: "/about" },
};

const features = [
  { icon: Factory, title: "Власне виробництво", text: "Ardis — український бренд із власним виробництвом велосипедів для дорослих і дітей." },
  { icon: Award, title: "Перевірена якість", text: "Велосипеди проходять контроль якості, а на основні вузли діє заводська гарантія." },
  { icon: Truck, title: "Доставка по Україні", text: "Надсилаємо замовлення Новою Поштою в будь-яке місто, доступний самовивіз у Києві." },
  { icon: Headphones, title: "Підтримка та сервіс", text: "Консультуємо з вибором і обслуговуємо велосипеди у власній майстерні." },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Про нас</h1>

        <div className="mt-6 space-y-4 leading-relaxed text-gray-700">
          <p>
            <strong>{SITE.name}</strong> — це велосипеди українського виробництва. Ми створюємо
            надійний і доступний транспорт для щоденних поїздок містом, активного відпочинку та спорту:
            гірські, міські, дитячі та підліткові моделі, а також сучасні електровелосипеди.
          </p>
          <p>
            Наша мета — щоб якісний велосипед був доступним для кожної української родини. Тому ми
            поєднуємо власне виробництво, перевірені комплектуючі та чесні ціни без зайвих націнок.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-black/5 bg-white p-6">
              <f.icon className="text-accent" size={24} />
              <h2 className="mt-3 text-lg font-bold">{f.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-gray-50 p-6 text-gray-700">
          <p className="leading-relaxed">
            Завітайте до нашого магазину за адресою <strong>{SITE.contacts.address}</strong> або
            зателефонуйте{" "}
            <a href={`tel:${SITE.contacts.phoneShopRaw}`} className="font-semibold text-ink hover:text-accent">
              {SITE.contacts.phoneShop}
            </a>{" "}
            — будемо раді допомогти з вибором.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
