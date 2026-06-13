import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import { getProductsPaged } from "@/lib/products";
import { RU_LANDINGS, getRuLanding } from "@/lib/ru-landings";
import { SITE } from "@/lib/site";

// Генерируем только те страницы, где реально есть хотя бы один товар.
export async function generateStaticParams() {
  const checks = await Promise.all(
    RU_LANDINGS.map(async (c) => {
      const res = await getProductsPaged({ group: "velosypedy", ...c.filters }, 1, 1);
      return res.total > 0 ? { slug: c.slug } : null;
    })
  );
  return checks.filter((x): x is { slug: string } => x !== null);
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const col = getRuLanding(slug);
  if (!col) return { title: "Страница не найдена" };
  return {
    title: col.title,
    description: col.description,
    // canonical на саму себя — страница самостоятельна, не дубль украинской.
    alternates: { canonical: `/ru/${col.slug}` },
    openGraph: {
      type: "website",
      title: col.title,
      description: col.description,
      url: `${SITE.url}/ru/${col.slug}`,
      locale: "ru_RU",
    },
  };
}

export default async function RuLandingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const col = getRuLanding(slug);
  if (!col) notFound();

  const pageNum = sp.page ? Math.max(1, Number(sp.page)) : 1;
  const paged = await getProductsPaged({ group: "velosypedy", ...col.filters }, pageNum, 24);
  const products = paged.items;

  if (paged.total === 0) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Велосипеды", item: `${SITE.url}/bikes` },
      { "@type": "ListItem", position: 3, name: col.h1, item: `${SITE.url}/ru/${col.slug}` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: col.h1,
    numberOfItems: paged.total,
    itemListElement: products.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/bikes/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <Header />
      <main lang="ru" className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-accent">Главная</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <Link href="/bikes" className="hover:text-accent">Велосипеды</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <span className="font-semibold text-ink">{col.h1}</span>
        </nav>

        <div className="mb-6 mt-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{col.h1}</h1>
          <p className="mt-1 text-sm text-gray-500">Найдено: {paged.total}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600">{col.intro}</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-black/5 bg-white p-16 text-center">
            <p className="font-bold text-gray-700">Сейчас нет в наличии</p>
            <Link href="/bikes" className="mt-3 inline-block text-sm font-semibold text-accent hover:text-accent-600">
              Посмотреть все велосипеды
            </Link>
          </div>
        )}

        <Pagination page={paged.page} pages={paged.pages} />

        <div className="mt-12 rounded-2xl bg-ink p-6 text-center text-white">
          <p className="text-lg font-bold">Не определились с выбором?</p>
          <p className="mt-1 text-sm text-white/60">
            Позвоните {SITE.contacts.phoneShop} — менеджер поможет подобрать велосипед под ваш рост и бюджет.
          </p>
          <Link href="/bikes" className="mt-4 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-600">
            Все велосипеды
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
