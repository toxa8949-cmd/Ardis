import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostCover } from "@/components/PostCover";
import { getPublishedPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

// ISR: сторінка перебудовується раз на 5 хв — нові статті з БД зʼявляються
// без повного редеплою.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Блог про велосипеди",
  description:
    "Корисні статті про велосипеди Ardis: як обрати велосипед, догляд, поради для новачків та досвідчених райдерів.",
  alternates: { canonical: "/blog" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Блог Ardis",
    url: `${SITE.url}/blog`,
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE.url}/blog/${p.slug}`,
      datePublished: p.published_at,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="mb-10 text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-accent">Блог</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Корисні статті про велосипеди</h1>
          <p className="mt-2 text-gray-500">Поради, гайди та новини світу Ardis</p>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <PostCover hue={p.cover_hue} className="h-44 w-full object-cover" />
                <div className="flex flex-1 flex-col p-5">
                  {p.published_at && (
                    <span className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                      <Calendar size={13} /> {formatDate(p.published_at)}
                    </span>
                  )}
                  <h2 className="text-lg font-bold leading-snug text-ink transition-colors group-hover:text-accent">
                    {p.title}
                  </h2>
                  {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-gray-500">{p.excerpt}</p>}
                  <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-bold text-accent-600">
                    Читати <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-black/5 bg-white p-16 text-center">
            <p className="font-bold text-gray-700">Статей поки немає</p>
            <p className="mt-1 text-sm text-gray-400">Незабаром тут з'являться корисні матеріали</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
