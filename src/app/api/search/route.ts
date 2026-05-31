import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ items: [] });

  const products = await searchProducts(q, 6);
  const items = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    image_url: p.image_url,
    brand: p.brand?.name ?? null,
  }));
  return NextResponse.json({ items });
}
