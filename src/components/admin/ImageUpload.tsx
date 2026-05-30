"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

// Завантажувач одного зображення в Supabase Storage (бакет product-images).
// Повертає публічний URL у onChange; URL зберігається у прихованому полі форми.
export function ImageUpload({
  value,
  onChange,
  label = "Фото",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Лише зображення");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Макс. 5 МБ");
      return;
    }

    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) {
        setError("Помилка завантаження");
        return;
      }

      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch {
      setError("Помилка з'єднання");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {value ? (
        <div className="relative inline-block">
          <div className="relative h-32 w-44 overflow-hidden rounded-xl border border-black/10 bg-white">
            <Image src={value} alt={label} fill className="object-contain" sizes="176px" />
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600"
            title="Прибрати фото"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-32 w-44 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 text-gray-400 transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-semibold">Завантаження…</span>
            </>
          ) : (
            <>
              <Upload size={22} />
              <span className="text-xs font-semibold">{label}</span>
            </>
          )}
        </button>
      )}
      {error && <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>}
    </div>
  );
}
