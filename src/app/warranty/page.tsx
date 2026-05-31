import type { Metadata } from "next";
import { ShieldCheck, Wrench, CheckCircle2, XCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Гарантія",
  description:
    "Гарантія на велосипеди Ardis: заводська гарантія 12 місяців, гарантійне та сервісне обслуговування, умови та що не є гарантійним випадком.",
  alternates: { canonical: "/warranty" },
};

export default function WarrantyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Гарантія</h1>
        <p className="mt-3 text-gray-600">
          Усі велосипеди Ardis — це продукція українського виробника із заводською гарантією. Ми
          відповідаємо за якість і допомагаємо з обслуговуванням протягом усього терміну служби.
        </p>

        <div className="mt-8 flex items-start gap-4 rounded-2xl border border-accent/20 bg-accent/5 p-6">
          <ShieldCheck className="shrink-0 text-accent" size={32} />
          <div>
            <h2 className="text-lg font-bold">Заводська гарантія 12 місяців</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">
              На раму та основні вузли надається гарантія 12 місяців з дати продажу за умови
              дотримання правил експлуатації та своєчасного технічного обслуговування.
            </p>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <CheckCircle2 className="text-accent" size={22} /> Що покриває гарантія
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
            <li>• Дефекти рами та зварних з'єднань, що виникли з вини виробника</li>
            <li>• Заводський брак комплектуючих (за умовами виробників компонентів)</li>
            <li>• Приховані дефекти, виявлені під час правильної експлуатації</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <XCircle className="text-gray-400" size={22} /> Не є гарантійним випадком
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
            <li>• Природний знос витратних деталей (покришки, гальмівні колодки, ланцюг, троси)</li>
            <li>• Пошкодження внаслідок падінь, ДТП, неправильної експлуатації чи зберігання</li>
            <li>• Наслідки самостійного ремонту або встановлення несумісних деталей</li>
            <li>• Відсутність планового технічного обслуговування</li>
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Wrench className="text-accent" size={20} /> Сервісне обслуговування
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            Власна веломайстерня виконує гарантійний і післягарантійний ремонт, ТО та налаштування.
            З питань обслуговування телефонуйте:{" "}
            <a href={`tel:${SITE.contacts.phoneServiceRaw}`} className="font-semibold text-ink hover:text-accent">
              {SITE.contacts.phoneService}
            </a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
