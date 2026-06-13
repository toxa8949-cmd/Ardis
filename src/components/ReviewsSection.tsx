"use client";

import { useState } from "react";
import { MessageSquarePlus, CheckCircle2, Loader2 } from "lucide-react";
import { ReviewStars } from "./ReviewStars";
import { useToast } from "./ToastProvider";
import type { Review, ReviewAggregate } from "@/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Секція відгуків на сторінці товару: агрегат + список схвалених + форма.
// Дані схвалених відгуків приходять із сервера (ISR). Нові відгуки йдуть
// на модерацію через /api/reviews і зʼявляються після схвалення в адмінці.
export function ReviewsSection({
  productId,
  slug,
  reviews,
  aggregate,
}: {
  productId: string;
  slug: string;
  reviews: Review[];
  aggregate: ReviewAggregate;
}) {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (author.trim().length < 2) {
      toast("Вкажіть, будь ласка, імʼя");
      return;
    }
    if (rating < 1) {
      toast("Оберіть оцінку від 1 до 5 зірок");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          slug,
          author: author.trim(),
          rating,
          body: body.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Не вдалося надіслати відгук");
        return;
      }
      setDone(true);
      setAuthor("");
      setRating(0);
      setBody("");
    } catch {
      toast("Помилка зʼєднання. Спробуйте ще раз");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="mt-16 sm:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Відгуки покупців</h2>
          {aggregate.count > 0 ? (
            <div className="mt-2 flex items-center gap-2">
              <ReviewStars value={aggregate.average} size={18} />
              <span className="text-sm font-bold text-ink">{aggregate.average}</span>
              <span className="text-sm text-gray-400">
                · {aggregate.count}{" "}
                {aggregate.count === 1 ? "відгук" : aggregate.count < 5 ? "відгуки" : "відгуків"}
              </span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              Ще немає відгуків. Будьте першим, хто поділиться враженням.
            </p>
          )}
        </div>

        {!showForm && !done && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent"
          >
            <MessageSquarePlus size={17} /> Залишити відгук
          </button>
        )}
      </div>

      {/* Форма */}
      {showForm && !done && (
        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
          <h3 className="text-lg font-bold">Ваш відгук про {""}</h3>
          <p className="mt-1 text-xs text-gray-500">
            Відгук зʼявиться на сайті після перевірки модератором.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Ваша оцінка
              </label>
              <ReviewStars value={rating} onChange={setRating} size={28} interactive />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Імʼя</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={60}
                placeholder="Як вас підписати"
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Відгук <span className="font-normal text-gray-400">(необовʼязково)</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Що сподобалось, як показав себе велосипед…"
                className="w-full resize-y rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent disabled:opacity-60"
              >
                {submitting ? <Loader2 size={17} className="animate-spin" /> : null}
                Надіслати відгук
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-accent/40"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Подяка після відправки */}
      {done && (
        <div className="mt-6 flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-bold text-emerald-800">Дякуємо за відгук!</p>
            <p className="mt-0.5 text-sm text-emerald-700">
              Він зʼявиться на сторінці після перевірки модератором.
            </p>
          </div>
        </div>
      )}

      {/* Список схвалених відгуків */}
      {reviews.length > 0 && (
        <div className="mt-8 space-y-4">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-2xl border border-black/5 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-sm font-bold text-accent-600">
                    {r.author.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <div className="font-bold text-ink">{r.author}</div>
                    <ReviewStars value={r.rating} size={14} />
                  </div>
                </div>
                <time className="text-xs text-gray-400">{formatDate(r.created_at)}</time>
              </div>
              {r.body && (
                <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-600">{r.body}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
