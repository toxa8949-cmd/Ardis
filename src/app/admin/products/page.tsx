import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { getProductsAdmin, getCategories, getBrands } from "@/lib/products";
import { AdminProductFilters } from "@/components/admin/AdminProductFilters";
import { AdminProductTable } from "@/components/admin/AdminProductTable";
import { AdminPagination } from "@/components/admin/AdminPagination";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  searchParams: Promise<{ search?: string; category?: string; brand?: string; stock?: string; sort?: string; page?: string }>;
};

export default async function AdminProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [{ items, total, page, pages }, categories, brands] = await Promise.all([
    getProductsAdmin({
      search: sp.search,
      category: sp.category,
      brand: sp.brand,
      stock: sp.stock === "in" ? "in" : sp.stock === "out" ? "out" : undefined,
      sort: sp.sort as "price_asc" | "price_desc" | "name" | undefined,
      page: sp.page ? Number(sp.page) : 1,
      perPage: 25,
    }),
    getCategories(),
    getBrands(),
  ]);

  const catName = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Товари</h1>
          <p className="mt-1 text-sm text-gray-500">Знайдено: {total}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent"
        >
          <Plus size={17} /> Додати товар
        </Link>
      </div>

      <Suspense fallback={<div className="mb-6 h-12" />}>
        <AdminProductFilters categories={categories} brands={brands} />
      </Suspense>

      <AdminProductTable items={items} catName={catName} />

      <Suspense fallback={null}>
        <AdminPagination page={page} pages={pages} />
      </Suspense>
    </div>
  );
}
