import { createClient } from "@supabase/supabase-js";

// Клієнт без cookies — для контекстів, де немає HTTP-запиту
// (generateStaticParams, sitemap, build-час). Лише публічне читання через RLS.
export function createSupabaseStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
