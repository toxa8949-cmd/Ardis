import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  IMAGE_BUCKET,
  pathFromPublicUrl,
  sourceContentLength,
  refreshImage,
} from "@/lib/image-mirror";

// Перевірка свіжості перенесених зображень.
//
// ПРОБЛЕМА, ЯКУ ЦЕ ЛІКУЄ: після переносу ми віддаємо власну копію. Якщо
// постачальник замінить фото за тією самою адресою — ми про це ніколи не
// дізнаємось і вічно показуватимемо стару картинку. Саме цим «жива» подача
// з velokrai/veloportal була кращою за копію.
//
// ЯК: раз на добу беремо порцію товарів, яких найдовше не перевіряли, і
// робимо HEAD-запит до джерела. Порівнюємо розмір файлу з тим, що лежить у
// нашому сховищі. Розбіжність — привід перезавантажити.
//
// HEAD дешевий: тіло не качається, навантаження на постачальника мізерне.
// Тіло тягнемо лише для тих одиниць, де розмір реально змінився.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Ті самі міркування, що й у /api/mirror-images: перевірка часу має стояти
// перед кожним мережевим запитом, а запас — покривати один таймаут.
// HEAD (5 с) + можливе перезавантаження (10 с) = 15 с найгіршого вильоту.
const TIME_BUDGET_MS = 38_000;
const BATCH = 150;

// Похибка в кілька байтів можлива через переупаковку на боці сервера —
// реагуємо лише на відчутну різницю.
const SIZE_TOLERANCE = 64;

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

    const { data: rows, error } = await supabase
      .from("products")
      .select("slug, image_url, source_image_url, images_checked_at")
      .not("source_image_url", "is", null)
      .like("image_url", "%/storage/v1/object/public/%")
      .order("images_checked_at", { ascending: true, nullsFirst: true })
      .limit(BATCH);

    if (error) {
      return NextResponse.json({ error: `Select failed: ${error.message}` }, { status: 500 });
    }
    if (!rows || rows.length === 0) {
      return NextResponse.json({ ok: true, checked: 0, updated: 0, note: "nothing to check" });
    }

    let checked = 0;
    let updated = 0;
    let unreachable = 0;
    const changed: string[] = [];
    const touched: string[] = [];

    for (const row of rows as {
      slug: string;
      image_url: string;
      source_image_url: string;
    }[]) {
      if (Date.now() - startedAt > TIME_BUDGET_MS) break;

      touched.push(row.slug);
      checked++;

      const remoteSize = await sourceContentLength(row.source_image_url);
      if (remoteSize === null) {
        // Джерело недоступне — не привід щось міняти. Наша копія і є страховкою
        // саме на такий випадок.
        unreachable++;
        continue;
      }

      const path = pathFromPublicUrl(row.image_url);
      if (!path) continue;
      const dir = path.slice(0, path.lastIndexOf("/"));
      const file = path.slice(path.lastIndexOf("/") + 1);
      const { data: objects } = await supabase.storage
        .from(IMAGE_BUCKET)
        .list(dir, { search: file, limit: 1 });
      const localSize = objects?.find((o) => o.name === file)?.metadata?.size as
        | number
        | undefined;
      if (typeof localSize !== "number") continue;

      if (Math.abs(localSize - remoteSize) <= SIZE_TOLERANCE) continue;

      // Розмір змінився — фото замінили. Тягнемо нову версію.
      const fresh = await refreshImage(supabase, supabaseUrl, row.source_image_url);
      if (!fresh) continue;

      const { error: upErr } = await supabase
        .from("products")
        .update({ image_url: fresh.url, images_checked_at: new Date().toISOString() })
        .eq("slug", row.slug);
      if (!upErr) {
        updated++;
        changed.push(row.slug);
      }
    }

    // Позначаємо перевіреними всіх, кого встигли торкнутись, щоб наступний
    // прогін узяв наступну порцію, а не тупцював на тій самій.
    if (touched.length > 0) {
      const now = new Date().toISOString();
      for (let i = 0; i < touched.length; i += 200) {
        await supabase
          .from("products")
          .update({ images_checked_at: now })
          .in("slug", touched.slice(i, i + 200));
      }
    }

    if (updated > 0) revalidatePath("/", "layout");

    return NextResponse.json({
      ok: true,
      checked,
      updated,
      unreachable,
      changed: changed.slice(0, 20),
      elapsedMs: Date.now() - startedAt,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg, elapsedMs: Date.now() - startedAt }, { status: 500 });
  }
}
