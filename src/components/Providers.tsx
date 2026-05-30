"use client";

import { CartProvider } from "./CartProvider";
import { ToastProvider } from "./ToastProvider";
import { CartSidebar } from "./CartSidebar";

// Обгортка глобальних провайдерів (кошик, тости) + сама панель кошика,
// яка має бути присутня на всіх сторінках.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        {children}
        <CartSidebar />
      </CartProvider>
    </ToastProvider>
  );
}
