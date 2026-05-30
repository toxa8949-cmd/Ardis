import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllPosts } from "@/lib/posts";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminBlogPage() {
  const posts = await getAllPosts();
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Блог</h1>
          <p className="mt-1 text-sm text-gray-500">Усього статей: {posts.length}</p>
        </div>
        <Link href="/admin/blog/new" className="flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent">
          <Plus size={17} /> Нова стаття
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">Заголовок</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3 text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-black/5 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink">{p.title}</div>
                  <div className="text-xs text-gray-400">/blog/{p.slug}</div>
                </td>
                <td className="px-4 py-3">
                  {p.published ? (
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">Опубліковано</span>
                  ) : (
                    <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">Чернетка</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/blog/${p.id}`} title="Редагувати"
                      className="grid h-9 w-9 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-accent">
                      <Pencil size={16} />
                    </Link>
                    <DeletePostButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-12 text-center text-gray-400">Статей ще немає. Натисніть «Нова стаття».</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
