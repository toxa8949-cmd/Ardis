"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Review, ReviewStatus } from "@/types";

async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизовано");
  return supabase;
}

// Усі відгуки для адмінки (включно з pending). RLS пускає лише авторизованих —
// тут читаємо через серверний клієнт у межах сесії адміна.
// Приєднуємо назву та slug товару, щоб у списку було видно, до чого відгук.
export async function getReviewsForAdmin(
  status?: ReviewStatus
): Promise<(Review & { product_name: string; product_slug: string })[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from("reviews")
    .select("id, product_id, author, rating, body, status, created_at, product:products(name, slug)")
    .order("created_at", { ascending: false });

  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error || !data) return [];

  return (data as Record<string, unknown>[]).map((r) => {
    const prod = r.product as { name?: string; slug?: string } | { name?: string; slug?: string }[] | null;
    const p = Array.isArray(prod) ? prod[0] : prod;
    return {
      id: r.id as string,
      product_id: r.product_id as string,
      author: r.author as string,
      rating: r.rating as number,
      body: (r.body as string) ?? null,
      status: r.status as ReviewStatus,
      created_at: r.created_at as string,
      product_name: p?.name ?? "—",
      product_slug: p?.slug ?? "",
    };
  });
}

// Лічильники для бейджів у адмінці.
export async function getReviewCounts(): Promise<Record<ReviewStatus, number>> {
  const supabase = await createSupabaseServerClient();
  const statuses: ReviewStatus[] = ["pending", "approved", "rejected"];
  const counts = { pending: 0, approved: 0, rejected: 0 } as Record<ReviewStatus, number>;
  await Promise.all(
    statuses.map(async (s) => {
      const { count } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", s);
      counts[s] = count ?? 0;
    })
  );
  return counts;
}

// Зміна статусу відгуку. Після зміни оновлюємо сторінку товару (агрегат/зірочки).
export async function setReviewStatus(
  id: string,
  status: ReviewStatus,
  productSlug: string
) {
  const supabase = await requireAuth();
  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  if (productSlug) revalidatePath(`/bikes/${productSlug}`);
}

export async function deleteReview(id: string, productSlug: string) {
  const supabase = await requireAuth();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  if (productSlug) revalidatePath(`/bikes/${productSlug}`);
}
