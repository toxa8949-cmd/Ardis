// Типи даних магазину Ardis. Узгоджені зі схемою Supabase.

// Старий enum (лишається для сумісності зі стовпцем category)
export type LegacyCategory = "mountain" | "city" | "gravel" | "parts";
export type RiderType = "adult" | "teen" | "child" | "any";
export type ProductType = "bike" | "part";
export type BadgeType = "hit" | "new" | "sale";
export type CategoryGroup = "velosypedy" | "zapchastyny" | "aksesuary";

export interface Brand {
  id: string;
  slug: string;
  name: string;
  is_own: boolean;
  sort_order: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  group: CategoryGroup;
  sort_order: number;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface ProductColor {
  id: string;
  product_id: string;
  name: string;
  hue: number;
  hex: string | null;
  image_url: string | null;
  images: string[];
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: LegacyCategory;        // старе поле (сумісність)
  category_slug: string | null;    // нова категорія-довідник
  brand_id: string | null;
  rider: RiderType;
  type: ProductType;
  price: number;
  old_price: number | null;
  badge: BadgeType | null;
  min_height: number | null;
  max_height: number | null;
  frame: string;
  wheel: string;
  wheel_size: string | null;
  frame_size: string | null;
  speeds: number | null;
  drivetrain: string;
  brakes: string;
  specs: SpecItem[];
  image_url: string | null;
  images: string[];                // галерея фото (кілька ракурсів)
  description: string | null;
  rating: number;
  reviews: number;
  in_stock: boolean;
  created_at: string;
  colors: ProductColor[];
  // приєднується через relation
  brand?: Brand | null;
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

export interface CartItem {
  product: Product;
  colorName: string;
  hue: number;
  qty: number;
  // Якщо товар доданий як аксесуар зі знижкою при купівлі з велосипедом:
  unitPrice?: number;       // фактична ціна за одиницю (зі знижкою)
  accessoryDiscount?: number; // % знижки (для позначки в кошику)
}

export const BADGE_LABELS: Record<BadgeType, string> = {
  hit: "Хіт",
  new: "Новинка",
  sale: "Акція",
};

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_hue: number;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = "new" | "processing" | "done" | "canceled";

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  city: string | null;
  delivery: DeliveryMethod;
  items: OrderItemInput[];
  total: number;
  status: OrderStatus;
  created_at: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Нове",
  processing: "В обробці",
  done: "Виконане",
  canceled: "Скасоване",
};

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  nova_poshta: "Нова Пошта",
  pickup: "Самовивіз (Київ)",
};

// Аксесуар, запропонований до велосипеда (зі знижкою при купівлі разом)
export interface AccessoryOffer {
  id: string;              // id товару-аксесуара
  slug: string;
  name: string;
  image_url: string | null;
  images: string[];
  price: number;           // звичайна ціна
  discount_percent: number;
  discounted_price: number; // ціна зі знижкою (для купівлі з велосипедом)
}
