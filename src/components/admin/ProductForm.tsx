"use client";

import { useState } from "react";
import { Plus, X, Save } from "lucide-react";
import { createProduct, updateProduct } from "@/lib/admin-actions";
import type { Product, Brand, Category } from "@/types";

interface ColorRow { name: string; hue: number }

export function ProductForm({
  product,
  brands,
  categories,
}: {
  product?: Product;
  brands: Brand[];
  categories: Category[];
}) {
  const isEdit = !!product;
  const [colors, setColors] = useState<ColorRow[]>(
    product?.colors.map((c) => ({ name: c.name, hue: c.hue })) ?? [{ name: "", hue: 24 }]
  );
  const [submitting, setSubmitting] = useState(false);

  const bikeCats = categories.filter((c) => c.group === "velosypedy");
  const partCats = categories.filter((c) => c.group !== "velosypedy");

  const addColor = () => setColors([...colors, { name: "", hue: 24 }]);
  const removeColor = (i: number) => setColors(colors.filter((_, idx) => idx !== i));
  const updateColor = (i: number, patch: Partial<ColorRow>) =>
    setColors(colors.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  // Server action обгортка: додаємо кольори у formData
  const action = async (formData: FormData) => {
    setSubmitting(true);
    formData.set("colors", JSON.stringify(colors.filter((c) => c.name.trim())));
    if (isEdit) await updateProduct(product!.id, formData);
    else await createProduct(formData);
  };

  const field = "w-full rounded-xl border border-black/10 bg-paper px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40";
  const label = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400";

  return (
    <form action={action} className="max-w-3xl space-y-6">
      {/* Основне */}
      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-4 font-bold">Основне</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>Назва *</label>
            <input name="name" required defaultValue={product?.name} className={field} placeholder="Велосипед Ardis MTB 26 ..." />
          </div>
          <div>
            <label className={label}>Slug (URL) *</label>
            <input name="slug" required defaultValue={product?.slug} className={field} placeholder="ardis-mtb-26-summit" pattern="[a-z0-9\-]+" title="Лише малі латинські літери, цифри та дефіс" />
          </div>
          <div>
            <label className={label}>Тип</label>
            <select name="type" defaultValue={product?.type ?? "bike"} className={field}>
              <option value="bike">Велосипед</option>
              <option value="part">Запчастина / аксесуар</option>
            </select>
          </div>
          <div>
            <label className={label}>Категорія *</label>
            <select name="category_slug" required defaultValue={product?.category_slug ?? ""} className={field}>
              <option value="" disabled>Оберіть категорію</option>
              <optgroup label="Велосипеди">
                {bikeCats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </optgroup>
              <optgroup label="Інше">
                {partCats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </optgroup>
            </select>
          </div>
          <div>
            <label className={label}>Бренд</label>
            <select name="brand_id" defaultValue={product?.brand_id ?? ""} className={field}>
              <option value="">— без бренду —</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Ціна та наявність */}
      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-4 font-bold">Ціна та наявність</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={label}>Ціна, ₴ *</label>
            <input name="price" type="number" required min="0" defaultValue={product?.price} className={field} />
          </div>
          <div>
            <label className={label}>Стара ціна, ₴</label>
            <input name="old_price" type="number" min="0" defaultValue={product?.old_price ?? ""} className={field} placeholder="—" />
          </div>
          <div>
            <label className={label}>Бейдж</label>
            <select name="badge" defaultValue={product?.badge ?? ""} className={field}>
              <option value="">— немає —</option>
              <option value="hit">Хіт</option>
              <option value="new">Новинка</option>
              <option value="sale">Акція</option>
            </select>
          </div>
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-gray-700">
          <input type="checkbox" name="in_stock" defaultChecked={product?.in_stock ?? true} className="h-5 w-5 cursor-pointer rounded accent-accent" />
          В наявності
        </label>
      </div>

      {/* Характеристики */}
      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-4 font-bold">Характеристики</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Рама</label>
            <input name="frame" defaultValue={product?.frame} className={field} placeholder="Алюміній 6061" />
          </div>
          <div>
            <label className={label}>Колеса (текст)</label>
            <input name="wheel" defaultValue={product?.wheel} className={field} placeholder='29"' />
          </div>
          <div>
            <label className={label}>Діаметр коліс (для фільтра)</label>
            <input name="wheel_size" defaultValue={product?.wheel_size ?? ""} className={field} placeholder="29" />
          </div>
          <div>
            <label className={label}>Розмір рами (для фільтра)</label>
            <input name="frame_size" defaultValue={product?.frame_size ?? ""} className={field} placeholder="19" />
          </div>
          <div>
            <label className={label}>Трансмісія</label>
            <input name="drivetrain" defaultValue={product?.drivetrain} className={field} placeholder="Shimano Deore 12s" />
          </div>
          <div>
            <label className={label}>Гальма</label>
            <input name="brakes" defaultValue={product?.brakes} className={field} placeholder="Гідравлічні дискові" />
          </div>
          <div>
            <label className={label}>Кількість швидкостей</label>
            <input name="speeds" type="number" min="1" defaultValue={product?.speeds ?? ""} className={field} placeholder="24" />
          </div>
          <div>
            <label className={label}>Для кого</label>
            <select name="rider" defaultValue={product?.rider ?? "adult"} className={field}>
              <option value="adult">Дорослий</option>
              <option value="teen">Підліток</option>
              <option value="child">Дитина</option>
              <option value="any">Будь-хто</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className={label}>Опис</label>
          <textarea name="description" defaultValue={product?.description ?? ""} rows={4} className={field} placeholder="Короткий опис товару для сторінки та SEO..." />
        </div>
      </div>

      {/* Кольори */}
      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Кольори</h2>
          <button type="button" onClick={addColor} className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200">
            <Plus size={14} /> Додати колір
          </button>
        </div>
        <p className="mb-3 text-xs text-gray-400">
          Hue — відтінок 0-360 (0 = чорний/графіт, 24 = помаранчевий, 130 = зелений, 220 = синій).
        </p>
        <div className="space-y-2">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: c.hue === 0 ? "#0f1115" : `hsl(${c.hue} 80% 50%)` }} />
              <input
                value={c.name}
                onChange={(e) => updateColor(i, { name: e.target.value })}
                placeholder="Назва кольору (напр. Графіт)"
                className="flex-1 rounded-lg border border-black/10 bg-paper px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              />
              <input
                type="number" min="0" max="360"
                value={c.hue}
                onChange={(e) => updateColor(i, { hue: Number(e.target.value) })}
                className="w-20 rounded-lg border border-black/10 bg-paper px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              />
              {colors.length > 1 && (
                <button type="button" onClick={() => removeColor(i)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-500">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-ink px-6 py-3 font-bold text-white transition-all hover:bg-accent active:scale-95 disabled:opacity-60">
          <Save size={17} /> {submitting ? "Збереження…" : isEdit ? "Зберегти зміни" : "Створити товар"}
        </button>
        <a href="/admin/products" className="rounded-xl border border-black/10 px-6 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-50">
          Скасувати
        </a>
      </div>
    </form>
  );
}
