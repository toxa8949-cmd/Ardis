import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Star, ShieldCheck, Truck, Factory, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductCard } from "@/components/ProductCard";
import { getProductBySlug, getRelatedProducts, getAllProductSlugs } from "@/lib/products";
import { uah, SITE } from "@/lib/site";
import { CATEGORY_LABELS, BADGE_LABELS } from "@/types";

// Попередня генерація сторінок усіх товарів (швидкість + SEO)
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

// Унікальні SEO-метадані для кожного товару
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Товар не знайдено" };

  const title = `${p.name} — купити в Ardis`;
  const description = p.description
    ? p.description.slice(0, 155)
    : `${p.name}: ${p.frame}, колеса ${p.wheel}, ${p.drivetrain}. Ціна ${uah(p.price)}. Заводська гарантія Ardis.`;

  return {
    title,
    description,
    alternates: { canonical: `/bikes/${p.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE.url}/bikes/${p.slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const related = await getRelatedProducts(p.category, p.slug, 4);

  const specs = [
    { label: "Рама", value: p.frame },
    { label: "Колеса", value: p.wheel },
    { label: "Трансмісія", value: p.drivetrain },
    { label: "Гальма", value: p.brakes },
  ].filter((s) => s.value);

  // JSON-LD товару — для багатих сніпетів у Google (ціна, рейтинг, наявність)
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? p.name,
    category: CATEGORY_LABELS[p.category],
    brand: { "@type": "Brand", name: "Ardis" },
    aggregateRating:
      p.reviews > 0
        ? { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews }
        : undefined,
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "UAH",
      availability: p.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE.url}/bikes/${p.slug}`,
    },
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: CATEGORY_LABELS[p.category],
        item: `${SITE.url}/#catalog`,
      },
      { "@type": "ListItem", position: 3, name: p.name, item: `${SITE.url}/bikes/${p.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Хлібні крихти */}
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-accent">Головна</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <Link href="/#catalog" className="hover:text-accent">{CATEGORY_LABELS[p.category]}</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <span className="font-semibold text-ink">{p.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* Галерея */}
          <ProductGallery product={p} />

          {/* Інформація */}
          <div>
            {p.badge && (
              <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent-600">
                {BADGE_LABELS[p.badge]}
              </span>
            )}
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{p.name}</h1>

            <div className="mt-3 flex items-center gap-4">
              <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-500">
                <Star size={16} fill="currentColor" /> {p.rating}
                <span className="font-normal text-gray-400">({p.reviews} відгуків)</span>
              </span>
              {p.in_stock ? (
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                  ● В наявності
                </span>
              ) : (
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">
                  Немає в наявності
                </span>
              )}
            </div>

            {p.description && (
              <p className="mt-5 leading-relaxed text-gray-600">{p.description}</p>
            )}

            {/* Ціна */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-ink">{uah(p.price)}</span>
              {p.old_price && (
                <span className="text-xl font-medium text-gray-400 line-through">
                  {uah(p.old_price)}
                </span>
              )}
            </div>

            {/* Кнопка — поки заглушка, живий кошик у Шарі 4 */}
            <button
              type="button"
              className="mt-5 w-full rounded-2xl bg-ink py-4 text-base font-bold text-white transition-all hover:bg-accent active:scale-[.98] sm:w-auto sm:px-12"
            >
              Додати в кошик
            </button>

            {/* Специфікації */}
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-bold">Характеристики</h2>
              <dl className="overflow-hidden rounded-2xl border border-black/5">
                {specs.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex justify-between gap-4 px-4 py-3 text-sm ${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <dt className="font-medium text-gray-500">{s.label}</dt>
                    <dd className="text-right font-semibold text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Переваги */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: Factory, t: "Українське виробництво" },
                { icon: ShieldCheck, t: "Гарантія 12 місяців" },
                { icon: Truck, t: "Доставка Новою Поштою" },
              ].map((a) => (
                <div
                  key={a.t}
                  className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600"
                >
                  <a.icon size={18} className="shrink-0 text-accent" />
                  {a.t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Схожі товари */}
        {related.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">Схожі моделі</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <ProductCard key={r.id} p={r} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
