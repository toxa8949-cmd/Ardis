import type { FaqItem } from "@/lib/faq";

// Блок поширених запитань: видимий accordion (<details>, працює без JS) +
// FAQPage JSON-LD у тому ж компоненті для розгорнутих сніпетів Google.
export function Faq({ items, title = "Поширені запитання" }: { items: FaqItem[]; title?: string }) {
  if (!items.length) return null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <h2 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <div className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white">
        {items.map((it, i) => (
          <details key={i} className="group">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-ink transition-colors hover:bg-gray-50 sm:text-base">
              {it.q}
              <span className="shrink-0 text-accent transition-transform group-open:rotate-45">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
            </summary>
            <div className="px-5 pb-4 text-sm leading-relaxed text-gray-600">{it.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
