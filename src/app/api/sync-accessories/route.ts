import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { parseVeloportalFeed, CAT_MAP } from "@/lib/veloportal-feed";

// Автосинк аксесуарів veloportal: ціни + наявність + нові товари.
// Викликається Vercel Cron раз на день. Захищений CRON_SECRET.
export const dynamic = "force-dynamic";
export const maxDuration = 60; // секунд (Hobby-ліміт)

const FEED_URL = "https://b2b.veloportal.com.ua/xml/1686922726/goods.xml";

export async function GET(request: Request) {
  // 1. Захист: лише Vercel Cron із правильним секретом
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Завантажуємо фід
    const res = await fetch(FEED_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `Feed fetch failed: ${res.status}` }, { status: 502 });
    }
    const xml = await res.text();
    const items = parseVeloportalFeed(xml);
    if (items.length === 0) {
      return NextResponse.json({ error: "Feed parsed but empty" }, { status: 422 });
    }

    const supabase = createSupabaseAdminClient();

    // 3. Бренди (upsert за slug)
    const brandMap = new Map<string, string>();
    for (const it of items) brandMap.set(it.brand_slug, it.brand_name);
    const brandRows = [...brandMap.entries()].map(([slug, name], i) => ({
      slug, name, is_own: false, sort_order: 50 + i,
    }));
    await supabase.from("brands").upsert(brandRows, { onConflict: "slug", ignoreDuplicates: true });

    // мапа slug -> id для прив'язки товарів
    const { data: brandsData } = await supabase.from("brands").select("id, slug");
    const brandIdBySlug = new Map((brandsData ?? []).map((b) => [b.slug as string, b.id as string]));

    // 4. Категорії (upsert)
    const catMap = new Map<string, { name: string; sort: number }>();
    for (const v of Object.values(CAT_MAP)) catMap.set(v[0], { name: v[1], sort: v[2] });
    const catRows = [...catMap.entries()].map(([slug, { name, sort }]) => ({
      slug, name, group: "aksesuary", sort_order: sort,
    }));
    await supabase.from("categories").upsert(catRows, { onConflict: "slug", ignoreDuplicates: true });

    // 5. Товари: upsert ціни + наявність + нові (з описом/фото/специфікаціями)
    const productRows = items.map((it) => ({
      slug: it.slug,
      name: it.name,
      category: "parts" as const,          // legacy enum NOT NULL
      category_slug: it.category_slug,
      brand_id: brandIdBySlug.get(it.brand_slug) ?? null,
      type: "part" as const,
      rider: "any" as const,
      price: it.price,
      in_stock: it.in_stock,
      specs: it.specs,
      image_url: it.image_url,
      images: it.images,
      description: it.description,
      group_key: it.group_key,
      mpn: it.mpn || null,
      color: it.color || null,
      size_label: it.size || null,
    }));

    // upsert порціями (щоб не впертись у ліміти запиту)
    const CHUNK = 500;
    let upserted = 0;
    for (let i = 0; i < productRows.length; i += CHUNK) {
      const slice = productRows.slice(i, i + CHUNK);
      const { error } = await supabase
        .from("products")
        .upsert(slice, { onConflict: "slug", ignoreDuplicates: false });
      if (error) {
        return NextResponse.json({ error: `Upsert failed: ${error.message}`, upserted }, { status: 500 });
      }
      upserted += slice.length;
    }

    // 6. Зниклі з фіду аксесуари -> in_stock=false (не видаляємо)
    const feedSlugs = new Set(items.map((it) => it.slug));
    const accCatSlugs = [...new Set(Object.values(CAT_MAP).map((v) => v[0]))];
    const { data: existing } = await supabase
      .from("products")
      .select("slug")
      .eq("type", "part")
      .in("category_slug", accCatSlugs)
      .eq("in_stock", true);
    const goneSlugs = (existing ?? [])
      .map((r) => r.slug as string)
      .filter((s) => !feedSlugs.has(s));
    let markedGone = 0;
    if (goneSlugs.length > 0) {
      // порціями, бо .in() має ліміт
      for (let i = 0; i < goneSlugs.length; i += 200) {
        const slice = goneSlugs.slice(i, i + 200);
        await supabase.from("products").update({ in_stock: false }).in("slug", slice);
        markedGone += slice.length;
      }
    }

    // оновити кеш вітрини, щоб зміни були видні одразу
    revalidatePath("/", "layout");

    return NextResponse.json({
      ok: true,
      feedItems: items.length,
      upserted,
      markedUnavailable: markedGone,
      brands: brandRows.length,
      at: new Date().toISOString(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
