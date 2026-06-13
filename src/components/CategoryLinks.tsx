import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";

// Блок внутрішньої перелінковки: текстові посилання на всі категорії велосипедів.
// Прискорює індексацію (бот бачить шляхи до всіх категорій з головної/категорій)
// і допомагає перетіканню ваги між сторінками.
export function CategoryLinks({
  categories,
  currentSlug,
  title = "Категорії велосипедів",
}: {
  categories: Category[];
  currentSlug?: string;
  title?: string;
}) {
  const list = categories.filter((c) => c.slug !== currentSlug);
  if (list.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="mb-5 text-xl font-bold tracking-tight">{title}</h2>
      <div className="flex flex-wrap gap-2.5">
        {list.map((c) => (
          <Link
            key={c.slug}
            href={`/catalog/${c.slug}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-sm"
          >
            {c.name}
            <ArrowRight size={14} className="text-gray-300" />
          </Link>
        ))}
      </div>
    </section>
  );
}
