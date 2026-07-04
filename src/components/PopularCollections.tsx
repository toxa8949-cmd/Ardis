import Link from "next/link";
import { AGE_COLLECTIONS, PRICE_COLLECTIONS, GEO_COLLECTIONS, BRAND_COLLECTIONS, getSeoCollection } from "@/lib/seo-collections";

// Блок внутрішньої перелінковки на головній: посилання на SEO-підбірки,
// згруповані за віком / ціною / типом / районом. Головна — найсильніша
// сторінка за вагою, тож ці посилання передають вагу вузьким лендингам,
// які поки сидять низько у видачі. Це прискорює їх ріст по позиціях.

const TYPE_SLUGS = ["velosypedy-29", "velosypedy-27-5", "velosypedy-26", "velosyped-dlya-pidlitka"];

function Chip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-accent/40 hover:text-accent-600"
    >
      {children}
    </Link>
  );
}

export function PopularCollections() {
  const typeCols = TYPE_SLUGS.map((s) => getSeoCollection(s)).filter(Boolean);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <div className="mb-8">
        <span className="text-sm font-bold uppercase tracking-widest text-accent">Швидкий вибір</span>
        <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Популярні підбірки</h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Готові добірки велосипедів за віком дитини, ціною, типом і районом Києва —
          щоб швидше знайти потрібну модель.
        </p>
      </div>

      <div className="space-y-6">
        {/* За віком дитини */}
        {AGE_COLLECTIONS.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Велосипед дитині за віком</h3>
            <div className="flex flex-wrap gap-2">
              {AGE_COLLECTIONS.map((a) => (
                <Chip key={a.slug} href={`/c/${a.slug}`}>
                  {a.age} {a.age >= 5 ? "років" : "роки"}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* За ціною */}
        {PRICE_COLLECTIONS.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">За бюджетом</h3>
            <div className="flex flex-wrap gap-2">
              {PRICE_COLLECTIONS.map((c) => (
                <Chip key={c.slug} href={`/c/${c.slug}`}>{c.h1}</Chip>
              ))}
            </div>
          </div>
        )}

        {/* За типом */}
        {typeCols.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">За типом</h3>
            <div className="flex flex-wrap gap-2">
              {typeCols.map((c) => (
                <Chip key={c!.slug} href={`/c/${c!.slug}`}>{c!.h1}</Chip>
              ))}
            </div>
          </div>
        )}

        {/* За брендом */}
        {BRAND_COLLECTIONS.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">За брендом</h3>
            <div className="flex flex-wrap gap-2">
              {BRAND_COLLECTIONS.map((c) => (
                <Chip key={c.slug} href={`/c/${c.slug}`}>{c.h1}</Chip>
              ))}
            </div>
          </div>
        )}

        {/* За районом */}
        {GEO_COLLECTIONS.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Магазин у Києві</h3>
            <div className="flex flex-wrap gap-2">
              {GEO_COLLECTIONS.map((c) => (
                <Chip key={c.slug} href={`/c/${c.slug}`}>{c.h1}</Chip>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
