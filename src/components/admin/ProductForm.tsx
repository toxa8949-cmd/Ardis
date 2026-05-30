"use client";

import { useState } from "react";
import { Plus, X, Save } from "lucide-react";
import { createProduct, updateProduct } from "@/lib/admin-actions";
import { ImageUpload } from "./ImageUpload";
import type { Product, Brand, Category } from "@/types";

interface ColorRow { name: string; hue: number; hex: string; image_url: string | null }
interface SpecRow { label: string; value: string }

// Готова палітра кольорів (назва + hex + приблизний hue для SVG)
const PALETTE: { name: string; hex: string; hue: number }[] = [
  { name: "Чорний", hex: "#1f2937", hue: 0 },
  { name: "Графіт", hex: "#4b5563", hue: 210 },
  { name: "Білий", hex: "#f3f4f6", hue: 210 },
  { name: "Червоний", hex: "#dc2626", hue: 0 },
  { name: "Помаранчевий", hex: "#f97316", hue: 24 },
  { name: "Жовтий", hex: "#eab308", hue: 48 },
  { name: "Зелений", hex: "#16a34a", hue: 140 },
  { name: "Лайм", hex: "#84cc16", hue: 85 },
  { name: "Синій", hex: "#2563eb", hue: 220 },
  { name: "Блакитний", hex: "#06b6d4", hue: 190 },
  { name: "Фіолетовий", hex: "#7c3aed", hue: 270 },
  { name: "Рожевий", hex: "#ec4899", hue: 320 },
  { name: "Бордовий", hex: "#9f1239", hue: 345 },
  { name: "Сріблястий", hex: "#cbd5e1", hue: 210 },
];

// Часті характеристики велосипеда — для швидкого додавання
const SPEC_PRESETS = [
  "Вилка", "Хід вилки", "Задній перемикач", "Передній перемикач", "Шифтери",
  "Система (шатуни)", "Каретка", "Касета", "Втулки", "Обода", "Покришки",
  "Сідло", "Кермо", "Виніс керма", "Вага", "Макс. навантаження",
  "Модельний рік", "Країна виробництва", "Гарантія", "Артикул",
];

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
    product?.colors.map((c) => ({
      name: c.name,
      hue: c.hue,
      hex: c.hex ?? "#1f2937",
      image_url: c.image_url ?? null,
    })) ?? [{ name: "Чорний", hue: 0, hex: "#1f2937", image_url: null }]
  );

  const [specs, setSpecs] = useState<SpecRow[]>(
    product?.specs?.length ? product.specs.map((s) => ({ label: s.label, value: s.value })) : []
  );

  const [mainImage, setMainImage] = useState<string | null>(product?.image_url ?? null);
  const [submitting, setSubmitting] = useState(false);

  const bikeCats = categories.filter((c) => c.group === "velosypedy");
  const partCats = categories.filter((c) => c.group !== "velosypedy");

  // --- Кольори ---
  const addColor = () => setColors([...colors, { name: "Чорний", hue: 0, hex: "#1f2937", image_url: null }]);
  const removeColor = (i: number) => setColors(colors.filter((_, idx) => idx !== i));
  const pickPalette = (i: number, p: typeof PALETTE[number]) =>
    setColors(colors.map((c, idx) => (idx === i ? { ...c, name: p.name, hue: p.hue, hex: p.hex } : c)));
  const updateColorName = (i: number, name: string) =>
    setColors(colors.map((c, idx) => (idx === i ? { ...c, name } : c)));
  const updateColorImage = (i: number, url: string | null) =>
    setColors(colors.map((c, idx) => (idx === i ? { ...c, image_url: url } : c)));

  // --- Характеристики ---
  const addSpec = (label = "") => setSpecs([...specs, { label, value: "" }]);
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, patch: Partial<SpecRow>) =>
    setSpecs(specs.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const action = async (formData: FormData) => {
    setSubmitting(true);
    formData.set("colors", JSON.stringify(colors.filter((c) => c.name.trim())));
    formData.set("specs", JSON.stringify(specs.filter((s) => s.label.trim() && s.value.trim())));
    formData.set("image_url", mainImage ?? "");
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

      {/* Основні характеристики (фіксовані поля для фільтрів) */}
      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-4 font-bold">Основні характеристики</h2>
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
            <label className={label}>Діаметр коліс (фільтр)</label>
            <input name="wheel_size" defaultValue={product?.wheel_size ?? ""} className={field} placeholder="29" />
          </div>
          <div>
            <label className={label}>Розмір рами (фільтр)</label>
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

      {/* Додаткові характеристики (довільні пари назва/значення) */}
      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Додаткові характеристики</h2>
          <button type="button" onClick={() => addSpec()} className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200">
            <Plus size={14} /> Рядок
          </button>
        </div>
        <p className="mb-3 text-xs text-gray-400">Вилка, шатуни, обода, покришки, вага тощо. Швидко додати:</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {SPEC_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => addSpec(preset)}
              className="rounded-lg border border-black/10 px-2.5 py-1 text-xs font-semibold text-gray-500 transition-colors hover:border-accent/40 hover:text-accent-600"
            >
              + {preset}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={s.label}
                onChange={(e) => updateSpec(i, { label: e.target.value })}
                placeholder="Характеристика"
                className="w-1/3 rounded-lg border border-black/10 bg-paper px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              />
              <input
                value={s.value}
                onChange={(e) => updateSpec(i, { value: e.target.value })}
                placeholder="Значення"
                className="flex-1 rounded-lg border border-black/10 bg-paper px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              />
              <button type="button" onClick={() => removeSpec(i)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-500">
                <X size={16} />
              </button>
            </div>
          ))}
          {specs.length === 0 && (
            <p className="rounded-lg bg-gray-50 px-3 py-3 text-xs text-gray-400">
              Поки немає додаткових характеристик. Натисніть кнопку вище, щоб додати.
            </p>
          )}
        </div>
      </div>

      {/* Головне фото товару */}
      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-1 font-bold">Головне фото</h2>
        <p className="mb-4 text-xs text-gray-400">
          Показується, якщо в обраного кольору немає власного фото. Якщо фото немає взагалі — буде намальований силует.
        </p>
        <ImageUpload value={mainImage} onChange={setMainImage} label="Головне фото" />
      </div>

      {/* Кольори — вибір із палітри */}
      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Кольори</h2>
          <button type="button" onClick={addColor} className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200">
            <Plus size={14} /> Додати колір
          </button>
        </div>
        <div className="space-y-4">
          {colors.map((c, i) => (
            <div key={i} className="rounded-xl border border-black/5 bg-gray-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-black/10" style={{ backgroundColor: c.hex }} />
                <input
                  value={c.name}
                  onChange={(e) => updateColorName(i, e.target.value)}
                  placeholder="Назва кольору"
                  className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
                />
                {colors.length > 1 && (
                  <button type="button" onClick={() => removeColor(i)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-500">
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PALETTE.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => pickPalette(i, p)}
                    title={p.name}
                    className={`h-7 w-7 rounded-lg ring-offset-1 transition-transform hover:scale-110 ${
                      c.hex === p.hex ? "ring-2 ring-accent" : "ring-1 ring-black/10"
                    }`}
                    style={{ backgroundColor: p.hex }}
                  />
                ))}
              </div>
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Фото цього кольору
                </p>
                <ImageUpload
                  value={c.image_url}
                  onChange={(url) => updateColorImage(i, url)}
                  label="Фото кольору"
                />
              </div>
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
