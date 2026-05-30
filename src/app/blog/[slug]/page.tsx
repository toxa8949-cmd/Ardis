import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calendar } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostCover } from "@/components/PostCover";
import { Markdown } from "@/components/Markdown";
import { getPublishedPostBySlug, getPublishedPostSlugs } from "@/lib/posts";
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Статтю не знайдено" };

  const description = post.excerpt ?? post.title;
  return {
    title: post.title,
    description: description.slice(0, 160),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `${SITE.url}/blog/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
    },
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? post.title,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: "Ardis" },
    publisher: { "@type": "Organization", name: "Ardis" },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Блог", item: `${SITE.url}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE.url}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-accent">Головна</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <Link href="/blog" className="hover:text-accent">Блог</Link>
          <ChevronRight size={15} className="text-gray-300" />
          <span className="font-semibold text-ink line-clamp-1">{post.title}</span>
        </nav>

        <article className="mt-6">
          {post.published_at && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400">
              <Calendar size={14} /> {formatDate(post.published_at)}
            </span>
          )}
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-3 text-lg text-gray-500">{post.excerpt}</p>}

          <PostCover hue={post.cover_hue} className="mt-6 h-56 w-full rounded-3xl object-cover sm:h-72" />

          <div className="mt-8">
            <Markdown content={post.content} />
          </div>
        </article>

        <div className="mt-12 rounded-2xl bg-ink p-6 text-center text-white">
          <p className="text-lg font-bold">Готові обрати велосипед?</p>
          <p className="mt-1 text-sm text-white/60">Перегляньте каталог Ardis — понад десяток моделей у наявності.</p>
          <Link href="/catalog" className="mt-4 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-600">
            До каталогу
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
