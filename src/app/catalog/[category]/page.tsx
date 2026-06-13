import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { CategoryLinks } from "@/components/CategoryLinks";
import { Pagination } from "@/components/Pagination";
import { Faq } from "@/components/Faq";
import {
  getProductsPaged, getFacetData, getBrands, getCategories,
  getCategoryBySlug, getAllCategorySlugs, getPriceRange, getFrameSizes,
  type SortOption,
} from "@/lib/products";
import { SITE } from "@/lib/site";
import { CATEGORY_SEO } from "@/lib/category-seo";
import { AGE_COLLECTIONS } from "@/lib/seo-collections";
import { CATEGORY_FAQ } from "@/lib/faq";

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((category) => ({ category }));
}

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    brand?: string; wheel?: string; frameSize?: string;
    priceMin?: string; priceMax?: string; inStock?: string; sort?: string; page?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Категорію не знайдено" };
  const seo = CATEGORY_SEO[cat.slug];
  const year = new Date().getFullYear();
  const nameLc = cat.name.toLowerCase();

  // Сильніший фолбек title/description для CTR: «купити», Київ, рік, доставка.
  const title = seo?.title ?? `${cat.name} велосипеди — купити в Києві | Ardis ${year}`;
  const description =
    seo?.description ??
    `${cat.name} велосипеди Ardis ✔ В наявності ✔ Заводська гарантія ✔ Доставка Новою Поштою по Україні ✔ Самовивіз у Києві. Великий вибір ${nameLc} моделей за найкращою ціною.`;
  const ogImage = `${SITE.url}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: `/catalog/${cat.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE.url}/catalog/${cat.slug}`,
      siteName: SITE.name,
      locale: "uk_UA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${cat.name} велосипеди Ardis` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const sp = await searchParams;

  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  // Мультивибір фільтрів передається в URL через кому — парсимо в масиви.
  const csv = (v?: string) => (v ? v.split(",").filter(Boolean) : undefined);
  const pageNum = sp.page ? Math.max(1, Number(sp.page)) : 1;

  const [paged, facetRaw, brands, categories, priceRange, frameSizes] = await Promise.all([
    getProductsPaged({
      category,
      brands: csv(sp.brand),
      wheels: csv(sp.wheel),
      frameSizes: csv(sp.frameSize),
      priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
      priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
      inStock: sp.inStock === "1",
      sort: (sp.sort as SortOption) ?? "new",
    }, pageNum, 24),
    getFacetData("velosypedy"),
    getBrands(),
    getCategories(),
    getPriceRange(),
    getFrameSizes(),
  ]);
  const products = paged.items;

  // Фасети (лічильники для брендів/коліс/рам) — лише в межах поточної категорії.
  const facetData = facetRaw
    .filter((r) => r.category_slug === cat.slug)
    .map((r) => ({
      brand: r.brand,
      wheel: r.wheel,
      frameSize: r.frameSize,
      category: r.category_slug,
      price: r.price,
    }));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Каталог", item: `${SITE.url}/catalog` },
      { "@type": "ListItem", position: 3, name: cat.name, item: `${SITE.url}/catalog/${cat.slug}` },
    ],
  };

  // ItemList — перелік товарів категорії. Допомагає Google показувати
  // сторінку як список товарів і краще її ранжувати по комерційних запитах.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cat.name} велосипеди`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, i) => ({
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-6">
          <span className="text-sm font-bold uppercase tracking-widest text-accent">Каталог</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{cat.name} велосипеди</h1>
          <p className="mt-1 text-sm text-gray-500">Знайдено: {paged.total}</p>
          {CATEGORY_SEO[cat.slug]?.intro && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600">
              {CATEGORY_SEO[cat.slug].intro}
            </p>
          )}
        </div>

        <CatalogFilters
          brands={brands}
          categories={categories}
          priceRange={priceRange}
          frameSizes={frameSizes}
          facetData={facetData}
          hideCategoryFilter
        />

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-black/5 bg-white p-16 text-center">
            <p className="font-bold text-gray-700">У цій категорії за фільтрами нічого немає</p>
            <p className="mt-1 text-sm text-gray-400">Спробуйте змінити параметри</p>
          </div>
        )}

        <Pagination page={paged.page} pages={paged.pages} />

        {cat.slug === "dytyachi" && AGE_COLLECTIONS.length > 0 && (
          <div className="mt-12 border-t border-black/5 pt-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Підібрати за віком дитини
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {AGE_COLLECTIONS.map((a) => (
                <Link
                  key={a.slug}
                  href={`/c/${a.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-accent/40 hover:text-accent-600"
                >
                  {a.age} {a.age >= 5 ? "років" : "роки"}
                  <ArrowRight size={14} className="text-gray-300" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <CategoryLinks
        categories={categories.filter((c) => c.group === "velosypedy")}
        currentSlug={cat.slug}
        title="Інші категорії велосипедів"
      />

      {(CATEGORY_SEO[cat.slug]?.seoText?.length ?? 0) > 0 && (
        <section className="border-t border-black/5 bg-paper">
          <div className="mx-auto max-w-3xl px-4 py-14">
            <h2 className="text-2xl font-bold tracking-tight">
              Про {cat.name.toLowerCase()} велосипеди
            </h2>
            <div className="mt-5 space-y-4">
              {CATEGORY_SEO[cat.slug]!.seoText!.map((para, i) => (
                <p key={i} className="leading-relaxed text-gray-600">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {CATEGORY_FAQ[cat.slug]?.length > 0 && (
        <Faq items={CATEGORY_FAQ[cat.slug]} title={`Питання про ${cat.name.toLowerCase()} велосипеди`} />
      )}
      <Footer />
    </>
  );
}
