import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseStaticClient } from "@/lib/supabase-static";
import type { Product, Brand, Category } from "@/types";

// Шар доступу до даних. Усі запити — через ці функції.

const PRODUCT_SELECT = `
  id, slug, name, category, category_slug, brand_id, rider, type, price, old_price, badge,
  min_height, max_height, frame, wheel, wheel_size, frame_size, speeds, drivetrain, brakes,
  specs, description, rating, reviews, in_stock, created_at,
  colors:product_colors ( id, product_id, name, hue, hex, sort_order ),
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
