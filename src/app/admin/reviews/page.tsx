import type { Metadata } from "next";
import Link from "next/link";
import { getReviewsForAdmin, getReviewCounts } from "@/lib/review-actions";
import { AdminReviewCard } from "@/components/admin/AdminReviewCard";
import { REVIEW_STATUS_LABELS, type ReviewStatus } from "@/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ status?: string }> };

const TABS: { key: ReviewStatus | "all"; label: string }[] = [
  { key: "pending", label: "На модерації" },
  { key: "approved", label: "Опубліковані" },
  { key: "rejected", label: "Відхилені" },
  { key: "all", label: "Усі" },
];

export default async function AdminReviewsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const active = (status as ReviewStatus | "all") ?? "pending";

  const [reviews, counts] = await Promise.all([
    getReviewsForAdmin(active === "all" ? undefined : (active as ReviewStatus)),
    getReviewCounts(),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight">Відгуки</h1>
      <p className="mt-1 text-sm text-gray-500">
        Нові відгуки потрапляють на модерацію. Опубліковані формують зірочки рейтингу на сайті та в
        Google.
      </p>

      {/* Вкладки за статусом */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = active === t.key;
          const count =
            t.key === "all"
              ? counts.pending + counts.approved + counts.rejected
              : counts[t.key as ReviewStatus];
          return (
            <Link
              key={t.key}
              href={`/admin/reviews?status=${t.key}`}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                isActive ? "bg-accent/10 text-accent-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive ? "bg-accent/20 text-accent-600" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        {reviews.length > 0 ? (
          reviews.map((r) => <AdminReviewCard key={r.id} review={r} />)
        ) : (
          <div className="rounded-2xl border border-black/5 bg-white p-16 text-center">
            <p className="font-bold text-gray-700">
              {active === "pending"
                ? "Немає відгуків на модерації"
                : `Немає відгуків (${REVIEW_STATUS_LABELS[active as ReviewStatus] ?? "усі"})`}
            </p>
            <p className="mt-1 text-sm text-gray-400">Тут зʼявляться відгуки з сайту</p>
          </div>
        )}
      </div>
    </div>
  );
}
