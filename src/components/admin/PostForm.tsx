"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { createPost, updatePost } from "@/lib/blog-actions";
import { PostCover } from "@/components/PostCover";
import type { Post } from "@/types";

export function PostForm({ post }: { post?: Post }) {
  const isEdit = !!post;
  const [hue, setHue] = useState(post?.cover_hue ?? 24);
  const [submitting, setSubmitting] = useState(false);

  const action = async (formData: FormData) => {
    setSubmitting(true);
    if (isEdit) await updatePost(post!.id, formData);
    else await createPost(formData);
  };

  const field = "w-full rounded-xl border border-black/10 bg-paper px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40";
  const label = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400";

  return (
    <form action={action} className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-black/5 bg-white p-6 space-y-4">
        <div>
          <label className={label}>Заголовок *</label>
          <input name="title" required defaultValue={post?.title} className={field} placeholder="Як обрати велосипед" />
        </div>
        <div>
          <label className={label}>Slug (URL) *</label>
          <input name="slug" required defaultValue={post?.slug} className={field} placeholder="yak-obraty-velosyped" pattern="[a-z0-9\-]+" title="Лише малі латинські літери, цифри та дефіс" />
        </div>
        <div>
          <label className={label}>Короткий опис (для списку та SEO)</label>
          <textarea name="excerpt" rows={2} defaultValue={post?.excerpt ?? ""} className={field} placeholder="1-2 речення, що побачать у пошуку Google" />
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <label className={label}>Обкладинка (відтінок)</label>
        <div className="flex items-center gap-4">
          <PostCover hue={hue} className="h-24 w-44 rounded-xl" />
          <div className="flex-1">
            <input
              type="range" min="0" max="360" value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-accent"
            />
            <input type="hidden" name="cover_hue" value={hue} />
            <p className="mt-1 text-xs text-gray-400">Відтінок: {hue}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <label className={label}>Текст статті (Markdown)</label>
        <textarea
          name="content"
          rows={18}
          defaultValue={post?.content}
          className={`${field} font-mono text-xs leading-relaxed`}
          placeholder={"## Підзаголовок\n\nАбзац тексту. **Жирний** текст, [посилання](/catalog).\n\n- пункт списку\n- ще пункт"}
        />
        <p className="mt-2 text-xs text-gray-400">
          Markdown: <code>## Заголовок</code>, <code>**жирний**</code>, <code>- список</code>, <code>[текст](посилання)</code>
        </p>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-gray-700">
          <input type="checkbox" name="published" defaultChecked={post?.published ?? false} className="h-5 w-5 cursor-pointer rounded accent-accent" />
          Опублікувати (зняти галочку = чернетка)
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-ink px-6 py-3 font-bold text-white transition-all hover:bg-accent active:scale-95 disabled:opacity-60">
          <Save size={17} /> {submitting ? "Збереження…" : isEdit ? "Зберегти зміни" : "Створити статтю"}
        </button>
        <a href="/admin/blog" className="rounded-xl border border-black/10 px-6 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-50">
          Скасувати
        </a>
      </div>
    </form>
  );
}
