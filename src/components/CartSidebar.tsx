"use client";

import { useState } from "react";
import { X, Minus, Plus, ShoppingCart, Truck, MapPin } from "lucide-react";
import { useCart } from "./CartProvider";
import { useToast } from "./ToastProvider";
import { BikeArt } from "./BikeArt";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { uah } from "@/lib/site";
import type { DeliveryMethod } from "@/types";

export function CartSidebar() {
  const { items, total, isOpen, close, setQty, remove, clear } = useCart();
  const toast = useToast();

  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [delivery, setDelivery] = useState<DeliveryMethod>("nova_poshta");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; city?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (form.name.trim().length < 2) e.name = "Вкажіть ім'я";
    if (!/^[\d+()\s-]{9,}$/.test(form.phone.trim())) e.phone = "Невірний номер телефону";
    if (delivery === "nova_poshta" && form.city.trim().length < 2) e.city = "Вкажіть місто";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const checkout = async () => {
    if (items.length === 0) {
      toast("Кошик порожній", "err");
      return;
    }
    if (!validate()) {
      toast("Перевірте поля форми", "err");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("orders").insert({
        customer_name: form.name.trim(),
        phone: form.phone.trim(),
        city: delivery === "nova_poshta" ? form.city.trim() : null,
        delivery,
        total,
        items: items.map((i) => ({
          product_id: i.product.id,
          name: i.product.name,
          color: i.colorName,
          qty: i.qty,
          price: i.unitPrice ?? i.product.price,
        })),
      });

      if (error) {
        console.error(error);
        toast("Не вдалося оформити. Спробуйте ще раз", "err");
        return;
      }

      toast(`Дякуємо, ${form.name}! Замовлення прийнято ✓`, "ok");
      clear();
      setForm({ name: "", phone: "", city: "" });
      setErrors({});
      close();
    } catch (err) {
      console.error(err);
      toast("Помилка з'єднання. Спробуйте ще раз", "err");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Затемнення */}
      <div
        onClick={close}
        className={`fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Панель */}
      <aside
        className={`fixed right-0 top-0 z-[60] flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/5 p-5">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <ShoppingCart size={22} className="text-accent" /> Кошик
            {items.length > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-sm text-white">
                {items.length}
              </span>
            )}
          </h2>
          <button
            onClick={close}
            className="grid h-9 w-9 place-items-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
              <ShoppingCart size={56} strokeWidth={1.2} />
              <p className="mt-4 font-semibold">Кошик порожній</p>
              <p className="text-sm">Додайте велосипед, щоб оформити замовлення</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <div
                  key={`${it.product.id}-${it.colorName}`}
                  className="flex gap-3 rounded-2xl border border-black/5 bg-white p-3"
                >
                  <BikeArt hue={it.hue} type={it.product.type} className="h-16 w-24 shrink-0 rounded-xl" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-bold leading-tight">{it.product.name}</h4>
                      <button
                        onClick={() => remove(it.product.id, it.colorName)}
                        className="text-gray-400 hover:text-rose-500"
                        aria-label="Видалити"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {it.colorName && (
                      <span className="text-xs text-gray-400">Колір: {it.colorName}</span>
                    )}
                    {it.accessoryDiscount ? (
                      <span className="mt-0.5 inline-block w-fit rounded bg-accent/10 px-1.5 py-0.5 text-[11px] font-bold text-accent">
                        Аксесуар −{it.accessoryDiscount}%
                      </span>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-lg border border-black/10 bg-gray-50">
                        <button
                          onClick={() => setQty(it.product.id, it.colorName, it.qty - 1)}
                          className="grid h-7 w-7 place-items-center text-gray-600 hover:text-accent"
                          aria-label="Менше"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-bold">{it.qty}</span>
                        <button
                          onClick={() => setQty(it.product.id, it.colorName, it.qty + 1)}
                          className="grid h-7 w-7 place-items-center text-gray-600 hover:text-accent"
                          aria-label="Більше"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-bold">{uah((it.unitPrice ?? it.product.price) * it.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Форма оформлення */}
              <div className="mt-5 space-y-3 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <h3 className="font-bold">Швидке оформлення</h3>

                <div>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ваше ім'я"
                    className={`w-full rounded-xl border bg-paper px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 ${
                      errors.name ? "border-rose-400" : "border-black/10"
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                </div>

                <div>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+380 __ ___ __ __"
                    inputMode="tel"
                    className={`w-full rounded-xl border bg-paper px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 ${
                      errors.phone ? "border-rose-400" : "border-black/10"
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDelivery("nova_poshta")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-xs font-bold transition-all ${
                      delivery === "nova_poshta"
                        ? "border-accent bg-accent/5 text-accent-600"
                        : "border-black/10 text-gray-500"
                    }`}
                  >
                    <Truck size={15} /> Нова Пошта
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelivery("pickup")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-xs font-bold transition-all ${
                      delivery === "pickup"
                        ? "border-accent bg-accent/5 text-accent-600"
                        : "border-black/10 text-gray-500"
                    }`}
                  >
                    <MapPin size={15} /> Самовивіз (Київ)
                  </button>
                </div>

                {delivery === "nova_poshta" && (
                  <div>
                    <input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Місто доставки"
                      className={`w-full rounded-xl border bg-paper px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 ${
                        errors.city ? "border-rose-400" : "border-black/10"
                      }`}
                    />
                    {errors.city && <p className="mt-1 text-xs text-rose-500">{errors.city}</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-black/5 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">Разом:</span>
              <span className="text-2xl font-bold">{uah(total)}</span>
            </div>
            <button
              onClick={checkout}
              disabled={submitting}
              className="w-full rounded-2xl bg-accent py-3.5 font-bold text-white transition-all hover:bg-accent-600 active:scale-[.98] disabled:opacity-60"
            >
              {submitting ? "Оформлюємо…" : "Оформити замовлення"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
