import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import { getProductsPaged } from "@/lib/products";
import { SEO_COLLECTIONS, getSeoCollection, getRelatedCollections } from "@/lib/seo-collections";
import { UA_RU_PAIRS } from "@/lib/ru-landings";
import { buildCollectionFaq } from "@/lib/collection-faq";
import { Faq } from "@/components/Faq";
import { SITE } from "@/lib/site";

// Генеруємо лише ті колекції, де реально є хоча б один товар (уникаємо thin content).
export async function generateStaticParams() {
  const checks = await Promise.all(
    SEO_COLLECTIONS.map(async (c) => {
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
  const col = getSeoCollection(slug);
  if (!col) return { title: "Сторінку не знайдено" };
  // hreflang: якщо існує російська версія цієї підбірки — вказуємо мовні альтернативи.
  const ruSlug = UA_RU_PAIRS[col.slug];
  const languages = ruSlug
    ? {
        uk: `${SITE.url}/c/${col.slug}`,
        ru: `${SITE.url}/ru/${ruSlug}`,
        "x-default": `${SITE.url}/c/${col.slug}`,
      }
    : undefined;
  return {
    title: col.title,
    description: col.description,
    alternates: { canonical: `/c/${col.slug}`, languages },
    openGraph: {
      type: "website",
      title: col.title,
      description: col.description,
      url: `${SITE.url}/c/${col.slug}`,
    },
  };
}

export default async function SeoCollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const col = getSeoCollection(slug);
  if (!col) notFound();

  const pageNum = sp.page ? Math.max(1, Number(sp.page)) : 1;
  const paged = await getProductsPaged({ group: "velosypedy", ...col.filters }, pageNum, 24);
  const products = paged.items;

  // Якщо товарів немає взагалі — сторінки не має існувати.
  if (paged.total === 0) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Велосипеди", item: `${SITE.url}/bikes` },
      { "@type": "ListItem", position: 3, name: col.h1, item: `${SITE.url}/c/${col.slug}` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: col.h1,
    description: col.description,
    url: `${SITE.url}/c/${col.slug}`,
    mainEntity: {
      "@type": "ItemList",
      name: col.h1,
      numberOfItems: paged.total,
      itemListElement: products.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE.url}/bikes/${p.slug}`,
        name: p.name,
      })),
    },
  };

  const related = getRelatedCollections(col.slug);
  const faqItems = buildCollectionFaq(col);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-accent">Головна</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <Link href="/bikes" className="hover:text-accent">Велосипеди</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <span className="font-semibold text-ink">{col.h1}</span>
        </nav>

        <div className="mb-6 mt-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{col.h1}</h1>
          <p className="mt-1 text-sm text-gray-500">Знайдено: {paged.total}</p>
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
            <p className="font-bold text-gray-700">Наразі немає в наявності</p>
            <Link href="/bikes" className="mt-3 inline-block text-sm font-semibold text-accent hover:text-accent-600">
              Переглянути всі велосипеди
            </Link>
          </div>
        )}

        <Pagination page={paged.page} pages={paged.pages} />

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-tight">Схожі підбірки</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/c/${r.slug}`}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  {r.h1}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 rounded-2xl bg-ink p-6 text-center text-white">
          <p className="text-lg font-bold">Не визначились із вибором?</p>
          <p className="mt-1 text-sm text-white/60">
            Зателефонуйте {SITE.contacts.phoneShop} — менеджер допоможе підібрати велосипед під ваш зріст і бюджет.
          </p>
          <Link href="/bikes" className="mt-4 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-600">
            Усі велосипеди
          </Link>
        </div>
      </main>
      <Faq items={faqItems} />
      <Footer />
    </>
  );
}
