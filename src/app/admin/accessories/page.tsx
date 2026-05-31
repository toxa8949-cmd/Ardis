import type { Metadata } from "next";
import { getAccessoryOffers, getAccessoryProducts } from "@/lib/products";
import { AccessoryOffersManager } from "@/components/admin/AccessoryOffersManager";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminAccessoriesPage() {
  const [offers, products] = await Promise.all([
    getAccessoryOffers(),
    getAccessoryProducts(),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight">Аксесуари-акції</h1>
      <p className="mt-1 text-sm text-gray-500">
        Глобальний набір аксесуарів, що пропонується до велосипедів зі знижкою.
      </p>

      <div className="mt-6 max-w-3xl">
        <AccessoryOffersManager offers={offers} products={products} />
      </div>
    </div>
  );
}
