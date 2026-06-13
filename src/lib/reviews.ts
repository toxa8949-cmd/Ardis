import { createSupabaseStaticClient } from "@/lib/supabase-static";
import type { Review, ReviewAggregate } from "@/types";

// Шар читання відгуків для публічних сторінок (ISR-сумісний, static-клієнт).
// Пишемо через API-роут із service_role; модеруємо через server actions.

// Схвалені відгуки одного товару — для показу на сторінці.
export async function getApprovedReviews(productId: string): Promise<Review[]> {
  const supabase = createSupabaseStaticClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, product_id, author, rating, body, status, created_at")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Review[];
}

// Агрегат (середній бал + кількість) зі СХВАЛЕНИХ відгуків одного товару.
// Використовується для зірочок у UI та JSON-LD AggregateRating.
// Якщо схвалених відгуків нема — повертає count: 0 (зірочки/JSON-LD не показуємо).
export async function getReviewAggregate(productId: string): Promise<ReviewAggregate> {
  const supabase = createSupabaseStaticClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("status", "approved");

  if (error || !data || data.length === 0) return { average: 0, count: 0 };

  const sum = data.reduce((s, r) => s + (r.rating as number), 0);
  const average = Math.round((sum / data.length) * 10) / 10;
  return { average, count: data.length };
}
