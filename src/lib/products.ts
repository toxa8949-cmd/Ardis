import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseStaticClient } from "@/lib/supabase-static";
import type { Product, Brand, Category, AccessoryOffer } from "@/types";

// Шар доступу до даних. Усі запити — через ці функції.

const PRODUCT_SELECT = `
  id, slug, name, category, category_slug, brand_id, rider, type, price, old_price, badge,
  min_height, max_height, frame, wheel, wheel_size, frame_size, speeds, drivetrain, brakes,
  specs, image_url, images, description, rating, reviews, in_stock, created_at,
  colors:product_colors ( id, product_id, name, hue, hex, image_url, sort_order ),
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
export type SortOption = "new" | "price_asc" | "price_desc" | "rating";

export interface ProductFilters {
  category?: string;   // category_slug
  brand?: string;      // brand slug
  wheel?: string;      // wheel_size
  frameSize?: string;  // frame_size
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sort?: SortOption;
}

// Усі товари з опційними фільтрами
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from("products").select(PRODUCT_SELECT);

  if (filters.category) q = q.eq("category_slug", filters.category);
  if (filters.wheel) q = q.eq("wheel_size", filters.wheel);
  if (filters.frameSize) q = q.eq("frame_size", filters.frameSize);
  if (filters.inStock) q = q.eq("in_stock", true);
  if (typeof filters.priceMin === "number") q = q.gte("price", filters.priceMin);
  if (typeof filters.priceMax === "number") q = q.lte("price", filters.priceMax);

  // Сортування
  switch (filters.sort) {
    case "price_asc": q = q.order("price", { ascending: true }); break;
    case "price_desc": q = q.order("price", { ascending: false }); break;
    case "rating": q = q.order("rating", { ascending: false }); break;
    default: q = q.order("created_at", { ascending: false });
  }

  const { data, error } = await q;
  if (error) {
    console.error("getProducts:", error.message);
    return [];
  }

  let result = (data as Record<string, unknown>[]).map(normalize);

  // фільтр по бренду (по приєднаному relation)
  if (filters.brand) {
    result = result.filter((p) => p.brand?.slug === filters.brand);
  }
  return result;
}

// Ціновий діапазон усього каталогу — для меж повзунка
export async function getPriceRange(): Promise<{ min: number; max: number }> {
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("sort_order");
  if (error || !data) return [];
  return data as Brand[];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error || !data) return [];
  return (data as Category[]);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createSupabaseServerClient();
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
export async function getAccessoriesForProduct(productId: string): Promise<AccessoryOffer[]> {
  const supabase = await createSupabaseServerClient();

  // 1. перевизначення для товару
  const { data: override } = await supabase
    .from("product_accessories")
    .select("accessory_id, discount_percent, sort_order, accessory:products!product_accessories_accessory_id_fkey ( id, slug, name, image_url, images, price )")
    .eq("product_id", productId)
    .order("sort_order");

  let rows = override ?? [];

  // 2. якщо перевизначень нема — глобальний набір
  if (rows.length === 0) {
    const { data: global } = await supabase
      .from("accessory_offers")
      .select("accessory_id, discount_percent, sort_order, accessory:products!accessory_offers_accessory_id_fkey ( id, slug, name, image_url, images, price )")
      .eq("active", true)
      .order("sort_order");
    rows = global ?? [];
  }

  const offers: AccessoryOffer[] = [];
  for (const r of rows as Record<string, unknown>[]) {
    const rel = r.accessory as unknown;
    const a = (Array.isArray(rel) ? rel[0] : rel) as Record<string, unknown> | null;
    if (!a || !a.id) continue;
    // не пропонуємо сам велосипед як аксесуар до себе
    if (a.id === productId) continue;
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
  const { data } = await supabase
    .from("products")
    .select("id, name, price, image_url, category_slug")
    .or("category_slug.eq.aksesuary,category_slug.eq.zapchastyny")
    .order("name");
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    price: Number(r.price) || 0,
    image_url: (r.image_url as string) ?? null,
  }));
}

// Поточний глобальний набір (accessory_offers) з даними товару
export async function getAccessoryOffers(): Promise<
  { id: string; accessory_id: string; name: string; price: number; image_url: string | null; discount_percent: number; active: boolean }[]
> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("accessory_offers")
    .select("id, accessory_id, discount_percent, active, sort_order, accessory:products!accessory_offers_accessory_id_fkey ( name, price, image_url )")
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
