"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизовано");
  return supabase;
}

function parsePost(formData: FormData) {
  const str = (k: string) => String(formData.get(k) ?? "").trim();
  const strOrNull = (k: string) => { const v = str(k); return v === "" ? null : v; };
  const published = formData.get("published") === "on";
  return {
    slug: str("slug"),
    title: str("title"),
    excerpt: strOrNull("excerpt"),
    content: str("content"),
    cover_hue: Number(formData.get("cover_hue")) || 24,
    published,
  };
}

export async function createPost(formData: FormData) {
  const supabase = await requireAuth();
  const d = parsePost(formData);
  const { error } = await supabase.from("posts").insert({
    ...d,
    published_at: d.published ? new Date().toISOString() : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = await requireAuth();
  const d = parsePost(formData);

  // Якщо публікуємо вперше — ставимо дату публікації
  const { data: existing } = await supabase
    .from("posts")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  const published_at =
    d.published
      ? (existing?.published_at ?? new Date().toISOString())
      : null;

  const { error } = await supabase
    .from("posts")
    .update({ ...d, published_at, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${d.slug}`);
  redirect("/admin/blog");
}

export async function deletePost(id: string) {
  const supabase = await requireAuth();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
