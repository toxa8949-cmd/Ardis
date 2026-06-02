"use server";

import { getProductById } from "@/lib/products";

// Публічний екшен: повертає деталі аксесуара для швидкого перегляду (модалка),
// щоб не переходити на сторінку товару. Лише читання.
export async function getAccessoryDetails(id: string): Promise<{
  name: string;
  description: string | null;
  specs: { label: string; value: string }[];
  images: string[];
  image_url: string | null;
  price: number;
} | null> {
  const p = await getProductById(id);
  if (!p) return null;
  return {
    name: p.name,
    description: p.description ?? null,
    specs: Array.isArray(p.specs) ? p.specs : [],
    images: p.images ?? [],
    image_url: p.image_url ?? null,
    price: p.price,
  };
}
