"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";
import { useToast } from "./ToastProvider";
import type { Product } from "@/types";

// Кнопка додавання в кошик. colorIndex — який колір обрано (за замовчуванням перший).
export function AddToCartButton({
  product,
  colorIndex = 0,
  className = "",
  label = "Додати в кошик",
}: {
  product: Product;
  colorIndex?: number;
  className?: string;
  label?: string;
}) {
  const { add } = useCart();
  const toast = useToast();
  const color = product.colors[colorIndex] ?? product.colors[0] ?? { hue: 24, name: "" };

  const handle = () => {
    add(product, color.name, color.hue);
    toast(`«${product.name}» додано в кошик`);
  };

  return (
    <button
      type="button"
      onClick={handle}
      className={
        className ||
        "flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-bold text-white transition-all hover:bg-accent active:scale-95"
      }
    >
      <ShoppingCart size={16} /> {label}
    </button>
  );
}
