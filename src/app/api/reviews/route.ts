import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Прийом відгуку від відвідувача. Завжди створюється зі status='pending'
// (модерація в адмінці). Пишемо через service_role, щоб гарантувати статус
// і не залежати від анонімних RLS-нюансів, але всю валідацію робимо тут.

const MIN_AUTHOR = 2;
const MAX_AUTHOR = 60;
const MAX_BODY = 2000;

export async function POST(request: Request) {
  let payload: {
    product_id?: string;
    slug?: string;
    author?: string;
    rating?: number;
    body?: string;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Некоректні дані" }, { status: 400 });
  }

  const author = String(payload.author ?? "").trim();
  const rating = Number(payload.rating);
  const body = String(payload.body ?? "").trim();
  const productId = String(payload.product_id ?? "").trim();
  const slug = String(payload.slug ?? "").trim();

  // Валідація
  if (author.length < MIN_AUTHOR || author.length > MAX_AUTHOR) {
    return NextResponse.json({ error: "Вкажіть імʼя (2–60 символів)" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Оцінка має бути від 1 до 5" }, { status: 400 });
  }
  if (body.length > MAX_BODY) {
    return NextResponse.json({ error: "Відгук задовгий" }, { status: 400 });
  }
  if (!productId) {
    return NextResponse.json({ error: "Не вказано товар" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Перевіряємо, що товар існує (захист від сміттєвих product_id).
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();
  if (!product) {
    return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    author,
    rating,
    body: body || null,
    status: "pending",
  });

  if (error) {
    console.error("review insert:", error.message);
    return NextResponse.json({ error: "Не вдалося зберегти відгук" }, { status: 500 });
  }

  // Сторінка товару оновиться після схвалення, але прогріваємо кеш модерації.
  revalidatePath("/admin/reviews");
  if (slug) revalidatePath(`/bikes/${slug}`);

  return NextResponse.json({ ok: true });
}
