"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизовано");
  return supabase;
}

// --- Глобальний набір аксесуарів (accessory_offers) ---

export async function addAccessoryOffer(accessoryId: string, discount: number) {
  const supabase = await requireAuth();
  const { error } = await supabase.from("accessory_offers").upsert(
    { accessory_id: accessoryId, discount_percent: clampDiscount(discount) },
    { onConflict: "accessory_id" }
  );
  if (error) throw new Error(error.message);
  revalidatePath("/admin/accessories");
  revalidatePath("/catalog");
}

export async function updateAccessoryOffer(
  id: string,
  data: {
    discount: number;
    active: boolean;
    wheel_min: number | null;
    wheel_max: number | null;
    exclude_electro: boolean;
    exclude_kids: boolean;
    in_stock_only: boolean;
  }
) {
  const supabase = await requireAuth();
  const { error } = await supabase
    .from("accessory_offers")
    .update({
      discount_percent: clampDiscount(data.discount),
      active: data.active,
      wheel_min: data.wheel_min,
      wheel_max: data.wheel_max,
      exclude_electro: data.exclude_electro,
      exclude_kids: data.exclude_kids,
      in_stock_only: data.in_stock_only,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/accessories");
  revalidatePath("/catalog");
}

export async function removeAccessoryOffer(id: string) {
  const supabase = await requireAuth();
  const { error } = await supabase.from("accessory_offers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/accessories");
  revalidatePath("/catalog");
}

// --- Перевизначення для конкретного велосипеда (product_accessories) ---

// Зберігає повний список перевизначень товару (замінює попередній).
export async function saveProductAccessories(
  productId: string,
  items: { accessory_id: string; discount_percent: number }[]
) {
  const supabase = await requireAuth();
  // видаляємо старі
  await supabase.from("product_accessories").delete().eq("product_id", productId);
  // вставляємо нові
  if (items.length > 0) {
    const rows = items.map((it, i) => ({
      product_id: productId,
      accessory_id: it.accessory_id,
      discount_percent: clampDiscount(it.discount_percent),
      sort_order: i,
    }));
    const { error } = await supabase.from("product_accessories").insert(rows);
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/catalog");
}

function clampDiscount(d: number): number {
  if (!Number.isFinite(d)) return 0;
  return Math.max(0, Math.min(90, Math.round(d)));
}
