import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseStaticClient } from "@/lib/supabase-static";
import type { Product, Brand, Category, AccessoryOffer } from "@/types";

// Шар доступу до даних. Усі запити — через ці функції.

const PRODUCT_SELECT = `
  id, slug, name, category, category_slug, brand_id, rider, type, price, old_price, badge,
  min_height, max_height, frame, wheel, wheel_size, frame_size, speeds, drivetrain, brakes,
  specs, image_url, images, description, rating, reviews, in_stock, created_at,
  colors:product_colors ( id, product_id, name, hue, hex, image_url, images, sort_order ),
  brand:brands ( id, slug, name, is_own, sort_order )
`;

// Supabase повертає relation brand як масив — нормалізуємо в об'єкт.
// Тому приймаємо «сирий» рядок і повертаємо чистий Product.
function normalize(row: Record<string, unknown>): Product {
  const colorsRaw = (row.colors as Product["colors"]) ?? [];
  const brandRaw = row.brand as unknown;
  const brand = Array.isArray(brandRaw) ? (brandRaw[0] ?? null) : (brandRaw ?? null);
  return {
    ...(row as unknown as Product),
    brand,
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    colors: [...colorsRaw].sort((a, b) => a.sort_order - b.sort_order),
  };
}

// --- Фільтри каталогу ---
export type SortOption = "new" | "price_asc" | "price_desc" | "rating" | "sale";

export interface ProductFilters {
  category?: string;   // category_slug
  group?: string;      // група категорії (velosypedy / aksesuary / zapchastyny)
  brand?: string;      // brand slug (одиночний, для сумісності)
  brands?: string[];   // кілька брендів
  wheel?: string;      // wheel_size (одиночний)
  wheels?: string[];   // кілька діаметрів
  frameSize?: string;  // frame_size (одиночний)
  frameSizes?: string[]; // кілька розмірів рами
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sort?: SortOption;
}

// Усі товари з опційними фільтрами
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const supabase = createSupabaseStaticClient();
  let q = supabase.from("products").select(PRODUCT_SELECT);

  if (filters.category) q = q.eq("category_slug", filters.category);
  // Фільтр за групою категорії: беремо slug-и категорій цієї групи
  if (filters.group && !filters.category) {
    const { data: cats } = await supabase
      .from("categories")
      .select("slug")
      .eq("group", filters.group);
    const slugs = (cats ?? []).map((c) => c.slug as string);
    if (slugs.length > 0) q = q.in("category_slug", slugs);
    else return [];
  }
  const wheels = filters.wheels?.length ? filters.wheels : (filters.wheel ? [filters.wheel] : []);
  if (wheels.length) q = q.in("wheel_size", wheels);
  const frameSizes = filters.frameSizes?.length ? filters.frameSizes : (filters.frameSize ? [filters.frameSize] : []);
  if (frameSizes.length) q = q.in("frame_size", frameSizes);
  if (filters.inStock) q = q.eq("in_stock", true);
  if (typeof filters.priceMin === "number") q = q.gte("price", filters.priceMin);
  if (typeof filters.priceMax === "number") q = q.lte("price", filters.priceMax);

  // Сортування
  switch (filters.sort) {
    case "price_asc": q = q.order("price", { ascending: true }); break;
    case "price_desc": q = q.order("price", { ascending: false }); break;
    case "rating": q = q.order("rating", { ascending: false }); break;
    case "sale": q = q.order("old_price", { ascending: false, nullsFirst: false }); break;
    default: q = q.order("created_at", { ascending: false });
  }

  const { data, error } = await q;
  if (error) {
    console.error("getProducts:", error.message);
    return [];
  }

  let result = (data as Record<string, unknown>[]).map(normalize);

  // фільтр по бренду (по приєднаному relation)
  const brandSlugs = filters.brands?.length ? filters.brands : (filters.brand ? [filters.brand] : []);
  if (brandSlugs.length) {
    result = result.filter((p) => p.brand?.slug && brandSlugs.includes(p.brand.slug));
  }
  return result;
}

// Пагінована вибірка для каталогів з великою кількістю товарів (напр. аксесуари).
// Застосовує всі ті самі фільтри, потім ріже на сторінки на сервері.
// Легка вибірка лише для побудови фільтрів (фасетів): без важких полів
// (images/specs/description). Повертає мінімум для підрахунку доступних опцій.
export async function getFacetData(
  group: string
): Promise<{ category_slug: string | null; price: number; brand: string | null; wheel: string | null; frameSize: string | null }[]> {
  const supabase = createSupabaseStaticClient();
  const { data: cats } = await supabase.from("categories").select("slug").eq("group", group);
  const slugs = (cats ?? []).map((c) => c.slug as string);
  if (slugs.length === 0) return [];
  const { data, error } = await supabase
    .from("products")
    .select("category_slug, price, wheel_size, frame_size, brand:brands(slug)")
    .in("category_slug", slugs);
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => {
    const b = r.brand as unknown;
    const brand = Array.isArray(b) ? (b[0] as { slug?: string })?.slug ?? null : (b as { slug?: string })?.slug ?? null;
    return {
      category_slug: (r.category_slug as string) ?? null,
      price: (r.price as number) ?? 0,
      brand,
      wheel: (r.wheel_size as string) ?? null,
      frameSize: (r.frame_size as string) ?? null,
    };
  });
}

export async function getProductsPaged(
  filters: ProductFilters = {},
  page = 1,
  perPage = 24
): Promise<{ items: Product[]; total: number; page: number; perPage: number; pages: number }> {
  const supabase = createSupabaseStaticClient();

  // brand тут фільтруємо на рівні brand_id, тож спершу резолвимо slug -> id
  const brandSlugs = filters.brands?.length ? filters.brands : (filters.brand ? [filters.brand] : []);
  let brandIds: string[] = [];
  if (brandSlugs.length) {
    const { data: bs } = await supabase.from("brands").select("id, slug").in("slug", brandSlugs);
    brandIds = (bs ?? []).map((b) => b.id as string);
    if (brandIds.length === 0) return { items: [], total: 0, page, perPage, pages: 0 };
  }

  let q = supabase.from("products").select(PRODUCT_SELECT, { count: "exact" });

  if (filters.category) q = q.eq("category_slug", filters.category);
  if (filters.group && !filters.category) {
    const { data: cats } = await supabase.from("categories").select("slug").eq("group", filters.group);
    const slugs = (cats ?? []).map((c) => c.slug as string);
    if (slugs.length === 0) return { items: [], total: 0, page, perPage, pages: 0 };
    q = q.in("category_slug", slugs);
  }
  if (brandIds.length) q = q.in("brand_id", brandIds);
  const wheels = filters.wheels?.length ? filters.wheels : (filters.wheel ? [filters.wheel] : []);
  if (wheels.length) q = q.in("wheel_size", wheels);
  const frameSizes = filters.frameSizes?.length ? filters.frameSizes : (filters.frameSize ? [filters.frameSize] : []);
  if (frameSizes.length) q = q.in("frame_size", frameSizes);
  if (filters.inStock) q = q.eq("in_stock", true);
  if (typeof filters.priceMin === "number") q = q.gte("price", filters.priceMin);
  if (typeof filters.priceMax === "number") q = q.lte("price", filters.priceMax);

  switch (filters.sort) {
    case "price_asc": q = q.order("price", { ascending: true }); break;
    case "price_desc": q = q.order("price", { ascending: false }); break;
    case "rating": q = q.order("rating", { ascending: false }); break;
    case "sale": q = q.order("old_price", { ascending: false, nullsFirst: false }); break;
    default: q = q.order("created_at", { ascending: false });
  }

  const pageSafe = Math.max(1, page);
  const from = (pageSafe - 1) * perPage;
  q = q.range(from, from + perPage - 1);

  const { data, error, count } = await q;
  if (error) {
    console.error("getProductsPaged:", error.message);
    return { items: [], total: 0, page: pageSafe, perPage, pages: 0 };
  }
  const total = count ?? 0;
  const items = (data as Record<string, unknown>[]).map(normalize);
  return { items, total, page: pageSafe, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

// Ціновий діапазон усього каталогу — для меж повзунка
export async function getPriceRange(): Promise<{ min: number; max: number }> {
  const supabase = createSupabaseStaticClient();
  const { data, error } = await supabase
    .from("products")
    .select("price")
    .order("price", { ascending: true });
  if (error || !data || data.length === 0) return { min: 0, max: 50000 };
  const prices = data.map((r) => r.price as number);
  return { min: prices[0], max: prices[prices.length - 1] };
}

// Унікальні розміри рам — для фільтра
export async function getFrameSizes(): Promise<string[]> {
  const supabase = createSupabaseStaticClient();
  const { data, error } = await supabase
    .from("products")
    .select("frame_size")
    .not("frame_size", "is", null);
  if (error || !data) return [];
  const set = new Set<string>();
  data.forEach((r) => { if (r.frame_size) set.add(r.frame_size as string); });
  return Array.from(set).sort();
}

// Один товар за slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createSupabaseStaticClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getProductBySlug:", error.message);
    return null;
  }
  return data ? normalize(data as Record<string, unknown>) : null;
}

// Усі slug — для generateStaticParams / sitemap
export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = createSupabaseStaticClient();
  const { data, error } = await supabase.from("products").select("slug");
  if (error || !data) return [];
  return data.map((r) => r.slug as string);
}

// Схожі товари (та сама категорія_slug, крім поточного)
export async function getRelatedProducts(
  categorySlug: string | null,
  excludeSlug: string,
  limit = 4
): Promise<Product[]> {
  if (!categorySlug) return [];
  const supabase = createSupabaseStaticClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_slug", categorySlug)
    .neq("slug", excludeSlug)
    .limit(limit);

  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(normalize);
}

// --- Довідники ---
export async function getBrands(): Promise<Brand[]> {
  const supabase = createSupabaseStaticClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("sort_order");
  if (error || !data) return [];
  return data as Brand[];
}

export async function getCategories(group?: string): Promise<Category[]> {
  const supabase = createSupabaseStaticClient();
  let q = supabase.from("categories").select("*").order("sort_order");
  if (group) q = q.eq("group", group);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as Category[]);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createSupabaseStaticClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as Category;
}

// slug усіх категорій — для generateStaticParams
export async function getAllCategorySlugs(): Promise<string[]> {
  const supabase = createSupabaseStaticClient();
  const { data, error } = await supabase.from("categories").select("slug");
  if (error || !data) return [];
  return data.map((r) => r.slug as string);
}

// Товар за id — для адмін-редагування
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return normalize(data as Record<string, unknown>);
}

// Аксесуари, запропоновані до велосипеда (крос-сел).
// Гібрид: якщо для товару є перевизначення (product_accessories) — беремо їх;
// інакше — глобальний набір (accessory_offers). Ціни рахуємо зі знижкою.
export async function getAccessoriesForProduct(product: Product): Promise<AccessoryOffer[]> {
  const supabase = createSupabaseStaticClient();
  const productId = product.id;

  // 1. перевизначення для товару (ручне — НЕ фільтруємо за сумісністю)
  const { data: override } = await supabase
    .from("product_accessories")
    .select("accessory_id, discount_percent, sort_order, accessory:products!product_accessories_accessory_id_fkey ( id, slug, name, image_url, images, price )")
    .eq("product_id", productId)
    .order("sort_order");

  if (override && override.length > 0) {
    return buildOffers(override as Record<string, unknown>[], productId);
  }

  // 2. глобальний набір — з правилами сумісності
  const { data: global } = await supabase
    .from("accessory_offers")
    .select("accessory_id, discount_percent, sort_order, wheel_min, wheel_max, exclude_electro, exclude_kids, in_stock_only, accessory:products!accessory_offers_accessory_id_fkey ( id, slug, name, image_url, images, price, in_stock )")
    .eq("active", true)
    .order("sort_order");

  // дані велосипеда для перевірки сумісності
  const wheel = parseFloat(String(product.wheel_size ?? product.wheel ?? "").replace(",", "."));
  const isElectro = product.category_slug === "elektrovelosipedi";
  const isKid = product.rider === "child";

  const compatible = (global ?? []).filter((r) => {
    const rec = r as Record<string, unknown>;
    if (rec.exclude_electro && isElectro) return false;
    if (rec.exclude_kids && isKid) return false;
    if (Number.isFinite(wheel)) {
      const wmin = rec.wheel_min == null ? null : Number(rec.wheel_min);
      const wmax = rec.wheel_max == null ? null : Number(rec.wheel_max);
      if (wmin != null && wheel < wmin) return false;
      if (wmax != null && wheel > wmax) return false;
    }
    if (rec.in_stock_only) {
      const rel = rec.accessory as unknown;
      const a = (Array.isArray(rel) ? rel[0] : rel) as Record<string, unknown> | null;
      if (a && a.in_stock === false) return false;
    }
    return true;
  });

  return buildOffers(compatible as Record<string, unknown>[], productId);
}

// Перетворює рядки пропозицій у AccessoryOffer[]
function buildOffers(rows: Record<string, unknown>[], productId: string): AccessoryOffer[] {
  const offers: AccessoryOffer[] = [];
  for (const r of rows) {
    const rel = r.accessory as unknown;
    const a = (Array.isArray(rel) ? rel[0] : rel) as Record<string, unknown> | null;
    if (!a || !a.id) continue;
    if (a.id === productId) continue; // не пропонуємо сам товар
    const price = Number(a.price) || 0;
    const disc = Number(r.discount_percent) || 0;
    const discounted = Math.round(price * (1 - disc / 100));
    offers.push({
      id: a.id as string,
      slug: a.slug as string,
      name: a.name as string,
      image_url: (a.image_url as string) ?? null,
      images: Array.isArray(a.images) ? (a.images as string[]) : [],
      price,
      discount_percent: disc,
      discounted_price: discounted,
    });
  }
  return offers;
}

// --- Адмінські хелпери для крос-селу аксесуарів ---

// Усі товари-аксесуари (для вибору в адмінці)
export async function getAccessoryProducts(): Promise<
  { id: string; name: string; price: number; image_url: string | null }[]
> {
  const supabase = await createSupabaseServerClient();
  // усі категорії групи "аксесуари" + запчастини
  const { data: cats } = await supabase
    .from("categories")
    .select("slug")
    .in("group", ["aksesuary", "zapchastyny"]);
  const slugs = (cats ?? []).map((c) => c.slug as string);
  // беремо товари цих категорій АБО будь-який type='part'
  let query = supabase
    .from("products")
    .select("id, name, price, image_url, category_slug, type")
    .order("name");
  if (slugs.length > 0) {
    const inList = slugs.map((s) => `category_slug.eq.${s}`).join(",");
    query = query.or(`type.eq.part,${inList}`);
  } else {
    query = query.eq("type", "part");
  }
  const { data } = await query;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    price: Number(r.price) || 0,
    image_url: (r.image_url as string) ?? null,
  }));
}

// Поточний глобальний набір (accessory_offers) з даними товару
export async function getAccessoryOffers(): Promise<
  { id: string; accessory_id: string; name: string; price: number; image_url: string | null; discount_percent: number; active: boolean; wheel_min: number | null; wheel_max: number | null; exclude_electro: boolean; exclude_kids: boolean; in_stock_only: boolean }[]
> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("accessory_offers")
    .select("id, accessory_id, discount_percent, active, sort_order, wheel_min, wheel_max, exclude_electro, exclude_kids, in_stock_only, accessory:products!accessory_offers_accessory_id_fkey ( name, price, image_url )")
    .order("sort_order");
  return (data ?? []).map((r) => {
    const rel = r.accessory as unknown;
    const a = (Array.isArray(rel) ? rel[0] : rel) as Record<string, unknown> | undefined;
    return {
      id: r.id as string,
      accessory_id: r.accessory_id as string,
      name: (a?.name as string) ?? "—",
      price: Number(a?.price) || 0,
      image_url: (a?.image_url as string) ?? null,
      discount_percent: Number(r.discount_percent) || 0,
      active: Boolean(r.active),
      wheel_min: r.wheel_min == null ? null : Number(r.wheel_min),
      wheel_max: r.wheel_max == null ? null : Number(r.wheel_max),
      exclude_electro: Boolean(r.exclude_electro),
      exclude_kids: Boolean(r.exclude_kids),
      in_stock_only: Boolean(r.in_stock_only),
    };
  });
}

// Перевизначення для товару (product_accessories)
export async function getProductAccessoryOverrides(
  productId: string
): Promise<{ accessory_id: string; discount_percent: number }[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("product_accessories")
    .select("accessory_id, discount_percent, sort_order")
    .eq("product_id", productId)
    .order("sort_order");
  return (data ?? []).map((r) => ({
    accessory_id: r.accessory_id as string,
    discount_percent: Number(r.discount_percent) || 0,
  }));
}

// --- Адмінський список товарів: серверний пошук + фільтри + пагінація ---
export interface AdminProductQuery {
  search?: string;       // пошук за назвою / slug / артикулом
  category?: string;     // category_slug
  brand?: string;        // brand slug
  stock?: "in" | "out";  // фільтр наявності
  sort?: "new" | "price_asc" | "price_desc" | "name";  // сортування
  page?: number;         // сторінка (з 1)
  perPage?: number;      // розмір сторінки
}

export async function getProductsAdmin(
  q: AdminProductQuery = {}
): Promise<{ items: Product[]; total: number; page: number; perPage: number; pages: number }> {
  const supabase = await createSupabaseServerClient();
  const page = Math.max(1, q.page ?? 1);
  const perPage = Math.min(100, Math.max(10, q.perPage ?? 25));

  // brand slug -> id (фільтр за брендом на рівні запиту)
  let brandId: string | null = null;
  if (q.brand) {
    const { data: b } = await supabase.from("brands").select("id").eq("slug", q.brand).maybeSingle();
    brandId = (b?.id as string) ?? null;
    if (!brandId) return { items: [], total: 0, page, perPage, pages: 0 };
  }

  let query = supabase.from("products").select(PRODUCT_SELECT, { count: "exact" });

  if (q.category) query = query.eq("category_slug", q.category);
  if (brandId) query = query.eq("brand_id", brandId);
  if (q.stock === "in") query = query.eq("in_stock", true);
  if (q.stock === "out") query = query.eq("in_stock", false);
  if (q.search && q.search.trim()) {
    const s = q.search.trim();
    // пошук за назвою або slug
    query = query.or(`name.ilike.%${s}%,slug.ilike.%${s}%`);
  }

  const from = (page - 1) * perPage;
  switch (q.sort) {
    case "price_asc": query = query.order("price", { ascending: true }); break;
    case "price_desc": query = query.order("price", { ascending: false }); break;
    case "name": query = query.order("name", { ascending: true }); break;
    default: query = query.order("created_at", { ascending: false });
  }
  query = query.range(from, from + perPage - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error("getProductsAdmin:", error.message);
    return { items: [], total: 0, page, perPage, pages: 0 };
  }
  const items = (data as Record<string, unknown>[]).map(normalize);
  const total = count ?? items.length;
  return { items, total, page, perPage, pages: Math.ceil(total / perPage) };
}

// --- Пошук по сайту (вітрина) ---
// Шукає за назвою/slug серед усіх товарів. limit — для підказок (autocomplete).
export async function searchProducts(query: string, limit = 50): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .or(`name.ilike.%${q}%,slug.ilike.%${q}%`)
    .order("in_stock", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(normalize);
}
