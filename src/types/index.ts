// Типи даних магазину Ardis. Узгоджені зі схемою Supabase (див. supabase/schema.sql)

export type Category = "mountain" | "city" | "gravel" | "parts";
export type RiderType = "adult" | "teen" | "child" | "any";
export type ProductType = "bike" | "part";
export type BadgeType = "hit" | "new" | "sale";

export interface ProductColor {
  id: string;
  product_id: string;
  name: string;
  hue: number;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  rider: RiderType;
  type: ProductType;
  price: number;
  old_price: number | null;
  badge: BadgeType | null;
  // діапазон зросту (см) — null для запчастин
  min_height: number | null;
  max_height: number | null;
  // специфікації
  frame: string;
  wheel: string;
  drivetrain: string;
  brakes: string;
  description: string | null;
  rating: number;
  reviews: number;
  in_stock: boolean;
  created_at: string;
  // приєднується через relation
  colors: ProductColor[];
}

export type DeliveryMethod = "nova_poshta" | "pickup";

export interface OrderItemInput {
  product_id: string;
  name: string;
  color: string;
  qty: number;
  price: number;
}

export interface OrderInput {
  customer_name: string;
  phone: string;
  city: string | null;
  delivery: DeliveryMethod;
  items: OrderItemInput[];
  total: number;
}

// Локальний елемент кошика (з вибраним кольором)
export interface CartItem {
  product: Product;
  colorName: string;
  hue: number;
  qty: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  mountain: "Гірські",
  city: "Міські",
  gravel: "Гравійні",
  parts: "Компоненти",
};

export const BADGE_LABELS: Record<BadgeType, string> = {
  hit: "Хіт",
  new: "Новинка",
  sale: "Акція",
};
