// Парсер фіду veloportal (goods.xml) — та сама логіка, що у Python-генераторі.
// Використовується cron-роутом /api/sync-accessories для автооновлення.

export type FeedItem = {
  slug: string;
  name: string;
  category_slug: string;
  brand_slug: string;
  brand_name: string;
  price: number;
  in_stock: boolean;
  specs: { label: string; value: string }[];
  image_url: string;
  images: string[];
  description: string;
};

// veloportal-категорія -> наша (slug, назва, sort)
export const CAT_MAP: Record<string, [string, string, number]> = {
  "Світло": ["acc-svitlo", "Освітлення", 101],
  "Кріплення для ліхтарів": ["acc-svitlo", "Освітлення", 101],
  "Замки": ["acc-zamky", "Замки", 102],
  "Крила/бризковики": ["acc-kryla", "Крила", 103],
  "Насоси та манометри": ["acc-nasosy", "Насоси", 104],
  "Дзвоники та сигнали": ["acc-dzvinky", "Дзвінки", 105],
  "Багажники": ["acc-bagazhnyky", "Багажники", 106],
  "Сумки": ["acc-sumky", "Сумки", 108],
  "Кошики": ["acc-koshyky", "Кошики", 109],
  "Захист рами і комплектуючих": ["acc-zakhyst", "Захист", 107],
  "Захист для тіла": ["acc-zakhyst", "Захист", 107],
  "Заглушки керма": ["acc-inshe", "Інше", 120],
  "Дзеркала": ["acc-inshe", "Інше", 120],
  "Шоломи": ["acc-sholomy", "Шоломи", 110],
  "Фляги": ["acc-flyagy", "Фляги та тримачі", 111],
  "Гріпси": ["acc-gripsy", "Гріпси", 112],
  "Очищувачі та мастила": ["acc-mastyla", "Догляд та мастила", 113],
  "Велокомп`ютери": ["acc-kompyutery", "Велокомп'ютери", 114],
  "Дитячі велокрісла": ["acc-dytyachi-krisla", "Дитячі крісла", 115],
  "Рукавички": ["acc-rukavychky", "Рукавички", 130],
  "Окуляри та маски": ["acc-okulyary", "Окуляри", 131],
  "Веломайки": ["acc-odyag", "Одяг", 132],
  "Велотруси": ["acc-odyag", "Одяг", 132],
  "Велоштани": ["acc-odyag", "Одяг", 132],
  "Куртки та дощовики": ["acc-odyag", "Одяг", 132],
  "Головні убори": ["acc-odyag", "Одяг", 132],
  "Бахіли": ["acc-odyag", "Одяг", 132],
  "Взуття": ["acc-vzuttya", "Взуття", 133],
};

const TRANSLIT: Record<string, string> = {
  а:"a",б:"b",в:"v",г:"h",ґ:"g",д:"d",е:"e",є:"ie",ж:"zh",з:"z",и:"y",і:"i",ї:"i",й:"i",
  к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"kh",ц:"ts",ч:"ch",
  ш:"sh",щ:"shch",ь:"",ю:"iu",я:"ia","’":"","'":"","`":"",
};

function translit(s: string): string {
  let out = "";
  for (const ch of s.toLowerCase()) {
    if (ch in TRANSLIT) out += TRANSLIT[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else out += "-";
  }
  return out.replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function unent(s: string): string {
  return (s || "")
    .replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'").replace(/&laquo;/g, "«").replace(/&raquo;/g, "»").replace(/&deg;/g, "°");
}

function pick(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : "";
}

// Парсить весь фід, повертає лише товари обраних категорій у наявності з ціною > 0.
export function parseVeloportalFeed(xml: string): FeedItem[] {
  const items = xml.split("<item>").slice(1);
  const result: FeedItem[] = [];
  const usedSlugs = new Set<string>();

  for (const raw of items) {
    const it = raw.slice(0, raw.indexOf("</item>") + 0 || raw.length);
    const category = pick(it, "category");
    if (!category || !(category in CAT_MAP)) continue;
    const stock = parseInt((pick(it, "is_in_stock") || "0").replace(/\D/g, "") || "0", 10);
    if (stock <= 0) continue;
    const price = parseFloat(pick(it, "price_r") || "0");
    if (price <= 0) continue;

    const title = unent(pick(it, "title"));
    const article = pick(it, "article");
    const brand = unent(pick(it, "brand"));
    const [ourCat] = CAT_MAP[category];

    let brandSlug = translit(brand) || "noname";
    if (!brand) brandSlug = "noname";

    let base = translit(`${brand}-${title}`).slice(0, 70) || `acc-${translit(article)}`;
    let slug = base;
    let i = 2;
    while (usedSlugs.has(slug)) { slug = `${base}-${i}`; i++; }
    usedSlugs.add(slug);

    const imgs = [...it.matchAll(/<image>([^<]*)<\/image>/g)]
      .map((m) => m[1].trim())
      .filter((u) => u.startsWith("http"));

    const specs: { label: string; value: string }[] = [];
    for (const pm of it.matchAll(/<name>([^<]*)<\/name>\s*<value>([^<]*)<\/value>/g)) {
      const nm = unent(pm[1].trim());
      const val = unent(pm[2].trim());
      if (nm && val) specs.push({ label: nm, value: val });
    }
    if (article) specs.push({ label: "Артикул", value: article });

    // опис
    let descrRaw = pick(it, "descr");
    descrRaw = unent(descrRaw.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, " "));
    const lines = descrRaw.split("\n").map((l) => l.replace(/^[\s•*\-\t]+/, "").trim())
      .filter((l) => l && l.toLowerCase() !== "опис:");
    let description: string;
    if (lines.length && lines.join("").length > 30) {
      const body = lines.slice(0, 20).map((l) => (l.includes(":") && l.length < 80 ? `* ${l}` : l)).join("\n");
      description = `**${title}**\n\n${body}\n\nОфіційна продукція бренду ${brand}. Доставка по всій Україні Новою Поштою.`;
    } else {
      description = `**${title}** — якісний велоаксесуар від бренду ${brand}. Офіційна продукція із гарантією. Доставка по всій Україні Новою Поштою.`;
    }

    result.push({
      slug, name: title, category_slug: ourCat,
      brand_slug: brandSlug, brand_name: brand || "NoName",
      price: Math.round(price), in_stock: true,
      specs, image_url: imgs[0] || "", images: imgs, description,
    });
  }
  return result;
}
