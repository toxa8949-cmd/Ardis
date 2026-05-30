import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseStaticClient } from "@/lib/supabase-static";
import type { Product, Brand, Category } from "@/types";

// Шар доступу до даних. Усі запити — через ці функції.

const PRODUCT_SELECT = `
  id, slug, name, category, category_slug, brand_id, rider, type, price, old_price, badge,
  min_height, max_height, frame, wheel, wheel_size, frame_size, speeds, drivetrain, brakes,
  description, rating, reviews, in_stock, created_at,
  colors:product_colors ( id, product_id, name, hue, sort_order ),
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
export interface ProductFilters {
  category?: string;   // category_slug
  brand?: string;      // brand slug
  wheel?: string;      // wheel_size
}

// Усі товари з опційними фільтрами
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false });

  if (filters.category) q = q.eq("category_slug", filters.category);
  if (filters.wheel) q = q.eq("wheel_size", filters.wheel);

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
