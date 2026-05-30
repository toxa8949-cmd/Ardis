import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseStaticClient } from "@/lib/supabase-static";
import type { Product } from "@/types";

// Шар доступу до даних. Усі запити до товарів — через ці функції,
// щоб логіка вибірки була в одному місці.

const PRODUCT_SELECT = `
  id, slug, name, category, rider, type, price, old_price, badge,
  min_height, max_height, frame, wheel, drivetrain, brakes,
  description, rating, reviews, in_stock, created_at,
  colors:product_colors ( id, product_id, name, hue, sort_order )
`;

function sortColors(p: Product): Product {
  return { ...p, colors: [...(p.colors ?? [])].sort((a, b) => a.sort_order - b.sort_order) };
}

// Усі товари (для каталогу)
export async function getProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProducts:", error.message);
    return [];
  }
  return (data as Product[]).map(sortColors);
}

// Один товар за slug (для сторінки товару)
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
  return data ? sortColors(data as Product) : null;
}

// Усі slug — для generateStaticParams / sitemap.
// Використовує статичний клієнт (без cookies), бо викликається на етапі білду,
// де немає HTTP-запиту.
export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = createSupabaseStaticClient();
  const { data, error } = await supabase.from("products").select("slug");
  if (error || !data) return [];
  return data.map((r) => r.slug as string);
}

// Схожі товари (та сама категорія, крім поточного)
export async function getRelatedProducts(
  category: string,
  excludeSlug: string,
  limit = 4
): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category", category)
    .neq("slug", excludeSlug)
    .limit(limit);

  if (error || !data) return [];
  return (data as Product[]).map(sortColors);
}
