import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseStaticClient } from "@/lib/supabase-static";
import type { Post } from "@/types";

// Опубліковані статті (для публічного блогу)
export async function getPublishedPosts(): Promise<Post[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return data as Post[];
}

// Одна опублікована стаття за slug
export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as Post;
}

// Усі статті (для адмінки — включно з чернетками)
export async function getAllPosts(): Promise<Post[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Post[];
}

// Стаття за id (адмін-редагування)
export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as Post;
}

// slug опублікованих статей — для sitemap / generateStaticParams
export async function getPublishedPostSlugs(): Promise<string[]> {
  const supabase = createSupabaseStaticClient();
  const { data, error } = await supabase.from("posts").select("slug").eq("published", true);
  if (error || !data) return [];
  return data.map((r) => r.slug as string);
}
