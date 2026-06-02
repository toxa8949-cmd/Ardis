import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductCard } from "@/components/ProductCard";
import { Markdown } from "@/components/Markdown";
import {
  getProductBySlug, getRelatedProducts, getAllProductSlugs, getCategoryBySlug,
  getAccessoriesForProduct,
} from "@/lib/products";
import { uah, SITE } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Товар не знайдено" };

  const title = `${p.name} — купити в Ardis`;
  const cleanDesc = p.description
    ? p.description.replace(/[#*_>`-]/g, " ").replace(/\s+/g, " ").trim()
    : "";
  const description = cleanDesc
    ? cleanDesc.slice(0, 155)
    : `${p.name}: ${p.frame}, колеса ${p.wheel}, ${p.drivetrain}. Ціна ${uah(p.price)}. Заводська гарантія Ardis.`;

  return {
    title,
    description,
    alternates: { canonical: `/bikes/${p.slug}` },
    openGraph: { type: "website", title, description, url: `${SITE.url}/bikes/${p.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const [related, category] = await Promise.all([
    getRelatedProducts(p.category_slug, p.slug, 4),
    p.category_slug ? getCategoryBySlug(p.category_slug) : Promise.resolve(null),
  ]);

  // Аксесуари-крос-сел показуємо лише для велосипедів (не для самих аксесуарів)
  const accessories = p.type === "bike" ? await getAccessoriesForProduct(p) : [];

  const catName = category?.name ?? "Каталог";
  const catUrl = p.category_slug ? `${SITE.url}/catalog/${p.category_slug}` : `${SITE.url}/catalog`;
  const catHref = p.category_slug ? `/catalog/${p.category_slug}` : "/catalog";

  // priceValidUntil — кінець поточного року (вимога Google для Offer).
  const priceValidUntil = `${new Date().getFullYear()}-12-31`;
  const productImage = p.image_url ?? p.images?.[0] ?? `${SITE.url}/opengraph-image`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? p.name,
    image: productImage,
    sku: p.slug,
    category: catName,
    brand: { "@type": "Brand", name: p.brand?.name ?? "Ardis" },
    aggregateRating:
      p.reviews > 0
        ? { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews }
        : undefined,
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "UAH",
      priceValidUntil,
      itemCondition: "https://schema.org/NewCondition",
      availability: p.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE.url}/bikes/${p.slug}`,
      seller: { "@type": "Organization", name: SITE.name },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "UA" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "UA",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: SITE.url },
      { "@type": "ListItem", position: 2, name: catName, item: catUrl },
      { "@type": "ListItem", position: 3, name: p.name, item: `${SITE.url}/bikes/${p.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-accent">Головна</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <Link href={catHref} className="hover:text-accent">{catName}</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <span className="font-semibold text-ink">{p.name}</span>
        </nav>

        <div className="mt-8">
          <ProductDetail product={p} accessories={accessories} />
        </div>

        {p.description && p.description.includes("\n") && (
          <section className="mt-12 sm:mt-16">
            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-10">
              <Markdown content={p.description} />
            </div>
          </section>
        )}

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
