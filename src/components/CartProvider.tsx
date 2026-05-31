"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Product, CartItem } from "@/types";

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (
    product: Product,
    colorName: string,
    hue: number,
    opts?: { unitPrice?: number; accessoryDiscount?: number; silent?: boolean }
  ) => void;
  remove: (productId: string, colorName: string) => void;
  setQty: (productId: string, colorName: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "ardis_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Завантаження з localStorage при старті
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // пошкоджені дані — ігноруємо
    }
    setHydrated(true);
  }, []);

  // Збереження при зміні (тільки після гідрації, щоб не затерти порожнім)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage недоступний — мовчки пропускаємо
    }
  }, [items, hydrated]);

  const add = useCallback(
    (
      product: Product,
      colorName: string,
      hue: number,
      opts?: { unitPrice?: number; accessoryDiscount?: number; silent?: boolean }
    ) => {
      setItems((prev) => {
        const idx = prev.findIndex(
          (i) => i.product.id === product.id && i.colorName === colorName
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
          return next;
        }
        return [
          ...prev,
          {
            product,
            colorName,
            hue,
            qty: 1,
            unitPrice: opts?.unitPrice,
            accessoryDiscount: opts?.accessoryDiscount,
          },
        ];
      });
      if (!opts?.silent) setIsOpen(true);
    },
    []
  );

  const remove = useCallback((productId: string, colorName: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.colorName === colorName))
    );
  }, []);

  const setQty = useCallback((productId: string, colorName: string, qty: number) => {
    setItems((prev) => {
      if (qty < 1) {
        return prev.filter((i) => !(i.product.id === productId && i.colorName === colorName));
      }
      return prev.map((i) =>
        i.product.id === productId && i.colorName === colorName ? { ...i, qty } : i
      );
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + (i.unitPrice ?? i.product.price) * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, count, total, isOpen, open, close, add, remove, setQty, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart має використовуватись усередині CartProvider");
  return ctx;
}
