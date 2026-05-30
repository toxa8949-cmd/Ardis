import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getBrands, getCategories } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([getBrands(), getCategories()]);
  return (
    <div className="p-8">
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-accent">
        <ChevronLeft size={16} /> До списку товарів
      </Link>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Новий товар</h1>
      <ProductForm brands={brands} categories={categories} />
    </div>
  );
}
