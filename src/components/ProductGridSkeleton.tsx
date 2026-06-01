// Скелетон-заглушка сітки товарів — показується миттєво під час завантаження сторінки.
export function ProductGridSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-3xl border border-black/5 bg-white"
        >
          {/* фото */}
          <div className="aspect-square w-full animate-pulse bg-gray-100" />
          {/* текст */}
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="mt-4 flex items-center justify-between">
              <div className="h-6 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
