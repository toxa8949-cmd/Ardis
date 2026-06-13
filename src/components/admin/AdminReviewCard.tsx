"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Check, X, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { setReviewStatus, deleteReview } from "@/lib/review-actions";
import { ReviewStars } from "@/components/ReviewStars";
import { REVIEW_STATUS_LABELS, type Review, type ReviewStatus } from "@/types";

const STATUS_STYLE: Record<ReviewStatus, string> = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-emerald-50 text-emerald-600",
  rejected: "bg-gray-100 text-gray-500",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminReviewCard({
  review,
}: {
  review: Review & { product_name: string; product_slug: string };
}) {
  const [pending, startTransition] = useTransition();

  const approve = () =>
    startTransition(() => setReviewStatus(review.id, "approved", review.product_slug));
  const reject = () =>
    startTransition(() => setReviewStatus(review.id, "rejected", review.product_slug));
  const remove = () => {
    if (confirm("Видалити відгук назавжди?")) {
      startTransition(() => deleteReview(review.id, review.product_slug));
    }
  };

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">{review.author}</span>
            <ReviewStars value={review.rating} size={14} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span>{formatDate(review.created_at)}</span>
            <span>·</span>
            {review.product_slug ? (
              <Link
                href={`/bikes/${review.product_slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 font-semibold text-gray-500 hover:text-accent"
              >
                {review.product_name} <ExternalLink size={12} />
              </Link>
            ) : (
              <span>{review.product_name}</span>
            )}
          </div>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-bold ${STATUS_STYLE[review.status]}`}>
          {REVIEW_STATUS_LABELS[review.status]}
        </span>
      </div>

      {review.body && (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
          {review.body}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {review.status !== "approved" && (
          <button
            type="button"
            onClick={approve}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
          >
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            Схвалити
          </button>
        )}
        {review.status !== "rejected" && (
          <button
            type="button"
            onClick={reject}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-amber-300 hover:text-amber-600 disabled:opacity-60"
          >
            <X size={15} /> Відхилити
          </button>
        )}
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-60"
        >
          <Trash2 size={15} /> Видалити
        </button>
      </div>
    </div>
  );
}
