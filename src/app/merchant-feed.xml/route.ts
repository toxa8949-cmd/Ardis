import { createSupabaseStaticClient } from "@/lib/supabase-static";
import { SITE } from "@/lib/site";

// Google Merchant Center фід: /merchant-feed.xml
// RSS 2.0 із namespace g: — формат, який GMC приймає за URL без файлів.
// Після деплою: Merchant Center → Products → Add products → Add products from a file
// → вказати https://ardis.kyiv.ua/merchant-feed.xml (scheduled fetch, раз на добу).
//
// Дає безкоштовні товарні листинги у вкладці «Покупки» Google — окремий
// канал трафіку під модельні запити («ardis quick», «crossride 24» тощо).

export const revalidate = 3600; // кешуємо на годину

type FeedRow = {
  slug: string;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  in_stock: boolean;
  image_url: string | null;
  images: string[] | null;
  category_slug: string | null;
  type: string | null;
  wheel_size: string | null;
  brand: { name: string } | { name: string }[] | null;
};

// Екранування спецсимволів XML.
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Опис: прибираємо markdown-розмітку, обрізаємо до ліміту GMC (5000 симв.).
function cleanDescription(raw: string | null, fallback: string): string {
  const text = (raw ?? "")
    .replace(/[#*_`>]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return (text || fallback).slice(0, 4900);
}

// Абсолютний URL зображення.
function absUrl(u: string): string {
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${SITE.url}${u.startsWith("/") ? "" : "/"}${u}`;
}

function brandName(b: FeedRow["brand"]): string {
  if (!b) return "Ardis";
  if (Array.isArray(b)) return b[0]?.name ?? "Ardis";
  return b.name ?? "Ardis";
}

// Категорія Google (текстовий шлях таксономії — GMC приймає і текст, і ID).
function googleCategory(row: FeedRow): string {
  if (row.type === "bike") {
    return "Sporting Goods > Outdoor Recreation > Cycling > Bicycles";
  }
  return "Sporting Goods > Outdoor Recreation > Cycling > Bicycle Accessories";
}

export async function GET() {
  const supabase = createSupabaseStaticClient();

  // Тягнемо ВСІ товари з пагінацією (Supabase віддає максимум 1000 рядків за раз).
  const pageSize = 1000;
  const rows: FeedRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("products")
      .select(
        "slug, name, description, price, old_price, in_stock, image_url, images, category_slug, type, wheel_size, brand:brands(name)"
      )
      .gt("price", 0)
      .order("slug", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error || !data || data.length === 0) break;
    rows.push(...(data as unknown as FeedRow[]));
    if (data.length < pageSize) break;
  }

  const items = rows
    .filter((p) => p.image_url || (p.images && p.images.length > 0))
    .map((p) => {
      const link = `${SITE.url}/bikes/${p.slug}`;
      const mainImage = absUrl(p.image_url ?? p.images![0]);
      const extraImages = (p.images ?? [])
        .map(absUrl)
        .filter((u) => u !== mainImage)
        .slice(0, 10);
      const hasSale = typeof p.old_price === "number" && p.old_price > p.price;
      const description = cleanDescription(
        p.description,
        `${p.name} — купити в Києві з доставкою по Україні. Заводська гарантія.`
      );

      return [
        "<item>",
        `<g:id>${esc(p.slug)}</g:id>`,
        `<g:title>${esc(p.name)}</g:title>`,
        `<g:description>${esc(description)}</g:description>`,
        `<g:link>${esc(link)}</g:link>`,
        `<g:image_link>${esc(mainImage)}</g:image_link>`,
        ...extraImages.map((u) => `<g:additional_image_link>${esc(u)}</g:additional_image_link>`),
        `<g:availability>${p.in_stock ? "in_stock" : "out_of_stock"}</g:availability>`,
        hasSale
          ? `<g:price>${p.old_price!.toFixed(2)} UAH</g:price><g:sale_price>${p.price.toFixed(2)} UAH</g:sale_price>`
          : `<g:price>${p.price.toFixed(2)} UAH</g:price>`,
        `<g:condition>new</g:condition>`,
        `<g:brand>${esc(brandName(p.brand))}</g:brand>`,
        // GTIN/MPN у товарів немає — прямо кажемо про це, щоб GMC не відхиляв позиції.
        `<g:identifier_exists>false</g:identifier_exists>`,
        `<g:google_product_category>${esc(googleCategory(p))}</g:google_product_category>`,
        "</item>",
      ].join("");
    });

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">` +
    `<channel>` +
    `<title>${esc(SITE.name)}</title>` +
    `<link>${esc(SITE.url)}</link>` +
    `<description>Велосипеди та аксесуари Ardis</description>` +
    items.join("") +
    `</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
