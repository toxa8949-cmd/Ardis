import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  mirrorImage,
  isExternal,
  isMirrored,
  MAX_IMAGES_PER_PRODUCT,
} from "@/lib/image-mirror";

// Перенос зображень товарів у власне сховище — порціями, з можливістю
// зупинитись і продовжити.
//
// ЧОМУ ПОРЦІЯМИ: ~2300 товарів це кілька тисяч файлів. За один запит їх не
// обробити — впремось у ліміт часу функції. Тому роут працює рівно стільки,
// скільки дозволяє бюджет, і повертає, скільки лишилось. Cron викликає його
// раз на 10 хвилин, доки remaining не стане нулем.
//
// Повторний прогін безпечний: mirrorImage рахує шлях як хеш від вихідного URL,
// тож уже перенесені файли не качаються вдруге.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Лишаємо запас до maxDuration, щоб встигнути записати результат у базу.
const TIME_BUDGET_MS = 45_000;

// Скільки товарів беремо за один прохід (обмеження зверху, реально
// зупинить раніше бюджет часу).
const BATCH = 60;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_SUPABASE_URL missing" }, { status: 500 });
  }

  try {
    const supabase = createSupabaseAdminClient();

    // Беремо товари, у яких головне зображення ще зовнішнє.
    // like 'http%' відсікає локальні шляхи, not like — уже перенесені.
    const { data: rows, error } = await supabase
      .from("products")
      .select("slug, image_url, images")
      .like("image_url", "http%")
      .not("image_url", "like", "%/storage/v1/object/public/%")
      .order("slug", { ascending: true })
      .limit(BATCH);

    if (error) {
      return NextResponse.json({ error: `Select failed: ${error.message}` }, { status: 500 });
    }
    if (!rows || rows.length === 0) {
      const { count } = await supabase
        .from("products")
        .select("slug", { count: "exact", head: true })
        .like("image_url", "http%")
        .not("image_url", "like", "%/storage/v1/object/public/%");
      return NextResponse.json({ ok: true, done: true, processed: 0, remaining: count ?? 0 });
    }

    let processed = 0;
    let uploaded = 0;
    let reused = 0;
    const failures: { slug: string; reason: string }[] = [];
    let outOfTime = false;

    for (const row of rows as { slug: string; image_url: string; images: string[] | null }[]) {
      if (Date.now() - startedAt > TIME_BUDGET_MS) {
        outOfTime = true;
        break;
      }

      const main = await mirrorImage(supabase, supabaseUrl, row.image_url);
      if (!main.ok) {
        // Не блокуємо решту: пропускаємо товар, він потрапить у наступний прогін.
        failures.push({ slug: row.slug, reason: main.reason });
        continue;
      }
      main.skipped ? reused++ : uploaded++;

      // Додаткові зображення — з тим самим правилом ідемпотентності.
      const source = (row.images ?? []).slice(0, MAX_IMAGES_PER_PRODUCT);
      const mirroredExtras: string[] = [];
      for (const img of source) {
        if (Date.now() - startedAt > TIME_BUDGET_MS) break;
        if (isMirrored(img)) {
          mirroredExtras.push(img);
          continue;
        }
        if (!isExternal(img)) continue;
        const r = await mirrorImage(supabase, supabaseUrl, img);
        if (r.ok) {
          mirroredExtras.push(r.url);
          r.skipped ? reused++ : uploaded++;
        }
        // Невдале додаткове зображення просто не потрапляє в масив.
      }

      // Головне зображення має бути першим у масиві.
      const images = [main.url, ...mirroredExtras.filter((u) => u !== main.url)];

      const { error: upErr } = await supabase
        .from("products")
        .update({ image_url: main.url, images })
        .eq("slug", row.slug);
      if (upErr) {
        failures.push({ slug: row.slug, reason: `update failed: ${upErr.message}` });
        continue;
      }
      processed++;
    }

    const { count: remaining } = await supabase
      .from("products")
      .select("slug", { count: "exact", head: true })
      .like("image_url", "http%")
      .not("image_url", "like", "%/storage/v1/object/public/%");

    if (processed > 0) revalidatePath("/", "layout");

    return NextResponse.json({
      ok: true,
      done: (remaining ?? 0) === 0,
      processed,
      uploaded,
      reused,
      remaining: remaining ?? 0,
      outOfTime,
      failures: failures.slice(0, 20),
      failureCount: failures.length,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg, elapsedMs: Date.now() - startedAt }, { status: 500 });
  }
}
