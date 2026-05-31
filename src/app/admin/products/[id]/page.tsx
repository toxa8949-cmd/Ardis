import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getBrands, getCategories, getProductById, getAccessoryProducts, getProductAccessoryOverrides } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductAccessoryEditor } from "@/components/admin/ProductAccessoryEditor";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([
    getProductById(id), getBrands(), getCategories(),
  ]);
  if (!product) notFound();

  // Аксесуари-перевизначення лише для велосипедів
  const [accessoryProducts, overrides] =
    product.type === "bike"
      ? await Promise.all([getAccessoryProducts(), getProductAccessoryOverrides(id)])
      : [[], []];

  return (
    <div className="p-8">
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-accent">
        <ChevronLeft size={16} /> До списку товарів
      </Link>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Редагувати: {product.name}</h1>
      <ProductForm product={product} brands={brands} categories={categories} />

      {product.type === "bike" && (
        <div className="mt-6 max-w-3xl">
          <ProductAccessoryEditor
            productId={product.id}
            products={accessoryProducts}
            initial={overrides}
          />
        </div>
      )}
    </div>
  );
}
