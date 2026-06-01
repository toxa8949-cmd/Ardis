import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";

export default function Loading() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-6">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
          <div className="mt-2 h-9 w-64 animate-pulse rounded bg-gray-100" />
          <div className="mt-2 h-3 w-28 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="mb-8 h-20 animate-pulse rounded-3xl bg-gray-50" />
        <ProductGridSkeleton count={24} />
      </main>
      <Footer />
    </>
  );
}
