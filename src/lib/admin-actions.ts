"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Кольори передаються як JSON-рядок: [{name, hue}]
interface ColorInput {
  name: string;
  hue: number;
  hex: string;
  image_url: string | null;
}

interface SpecInput {
  label: string;
  value: string;
}

interface ProductFormData {
  slug: string;
  name: string;
  category_slug: string;
  brand_id: string;
  type: "bike" | "part";
  rider: "adult" | "teen" | "child" | "any";
  price: number;
  old_price: number | null;
  badge: "hit" | "new" | "sale" | null;
  frame: string;
  wheel: string;
  wheel_size: string | null;
  frame_size: string | null;
  speeds: number | null;
  drivetrain: string;
  brakes: string;
  description: string | null;
  in_stock: boolean;
  image_url: string | null;
  colors: ColorInput[];
  specs: SpecInput[];
}

// Перевірка авторизації — кожна дія має пересвідчитись, що це адмін
async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизовано");
  return supabase;
}

// Парсинг форми у структуру
function parseForm(formData: FormData): ProductFormData {
  const num = (k: string): number | null => {
    const v = formData.get(k);
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const str = (k: string): string => String(formData.get(k) ?? "").trim();
  const strOrNull = (k: string): string | null => {
    const v = str(k);
    return v === "" ? null : v;
  };

  let colors: ColorInput[] = [];
  try {
    colors = JSON.parse(String(formData.get("colors") ?? "[]"));
  } catch {
    colors = [];
  }

  let specs: SpecInput[] = [];
  try {
    specs = JSON.parse(String(formData.get("specs") ?? "[]"));
  } catch {
    specs = [];
  }

  const badgeRaw = str("badge");
  const badge = (["hit", "new", "sale"].includes(badgeRaw) ? badgeRaw : null) as ProductFormData["badge"];

  return {
    slug: str("slug"),
    name: str("name"),
    category_slug: str("category_slug"),
    brand_id: str("brand_id"),
    type: (str("type") === "part" ? "part" : "bike"),
    rider: (["adult", "teen", "child", "any"].includes(str("rider")) ? str("rider") : "adult") as ProductFormData["rider"],
    price: num("price") ?? 0,
    old_price: num("old_price"),
    badge,
    frame: str("frame"),
    wheel: str("wheel"),
    wheel_size: strOrNull("wheel_size"),
    frame_size: strOrNull("frame_size"),
    speeds: num("speeds"),
    drivetrain: str("drivetrain"),
    brakes: str("brakes"),
    description: strOrNull("description"),
    in_stock: formData.get("in_stock") === "on",
    image_url: strOrNull("image_url"),
    colors: colors.filter((c) => c.name?.trim()),
    specs: specs.filter((sp) => sp.label?.trim() && sp.value?.trim()),
  };
}

// Запис кольорів товару (видаляємо старі, вставляємо нові)
async function saveColors(
  supabase: Awaited<ReturnType<typeof requireAuth>>,
  productId: string,
  colors: ColorInput[]
) {
  await supabase.from("product_colors").delete().eq("product_id", productId);
  if (colors.length > 0) {
    await supabase.from("product_colors").insert(
      colors.map((c, i) => ({
        product_id: productId,
        name: c.name.trim(),
        hue: Number(c.hue) || 24,
        hex: c.hex || null,
        image_url: c.image_url || null,
        sort_order: i,
      }))
    );
  }
}

// legacy-категорія для сумісності зі стовпцем category (NOT NULL)
function legacyCategory(categorySlug: string): "mountain" | "city" | "gravel" | "parts" {
  if (categorySlug === "zapchastyny" || categorySlug === "aksesuary") return "parts";
  if (["girski", "dvopidvisy", "girski-dytyachi", "bmx"].includes(categorySlug)) return "mountain";
  if (["dorozhni", "elektrovelosipedi"].includes(categorySlug)) return "gravel";
  return "city";
}

export async function createProduct(formData: FormData) {
  const supabase = await requireAuth();
  const d = parseForm(formData);

  const { data, error } = await supabase
    .from("products")
    .insert({
      slug: d.slug,
      name: d.name,
      category: legacyCategory(d.category_slug),
      category_slug: d.category_slug,
      brand_id: d.brand_id || null,
      type: d.type,
      rider: d.rider,
      price: d.price,
      old_price: d.old_price,
      badge: d.badge,
      frame: d.frame,
      wheel: d.wheel,
      wheel_size: d.wheel_size,
      frame_size: d.frame_size,
      speeds: d.speeds,
      drivetrain: d.drivetrain,
      brakes: d.brakes,
      specs: d.specs,
      image_url: d.image_url,
      description: d.description,
      in_stock: d.in_stock,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await saveColors(supabase, data.id, d.colors);

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await requireAuth();
  const d = parseForm(formData);

  const { error } = await supabase
    .from("products")
    .update({
      slug: d.slug,
      name: d.name,
      category: legacyCategory(d.category_slug),
      category_slug: d.category_slug,
      brand_id: d.brand_id || null,
      type: d.type,
      rider: d.rider,
      price: d.price,
      old_price: d.old_price,
      badge: d.badge,
      frame: d.frame,
      wheel: d.wheel,
      wheel_size: d.wheel_size,
      frame_size: d.frame_size,
      speeds: d.speeds,
      drivetrain: d.drivetrain,
      brakes: d.brakes,
      specs: d.specs,
      image_url: d.image_url,
      description: d.description,
      in_stock: d.in_stock,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  await saveColors(supabase, id, d.colors);

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const supabase = await requireAuth();
  // кольори видаляться каскадно (FK on delete cascade)
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
}
