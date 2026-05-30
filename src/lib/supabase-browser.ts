"use client";

import { createBrowserClient } from "@supabase/ssr";

// Клієнтський клієнт Supabase для Client Components (оформлення замовлення тощо).
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
