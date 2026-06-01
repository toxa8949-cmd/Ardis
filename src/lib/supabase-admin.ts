import { createClient } from "@supabase/supabase-js";

// Адмін-клієнт із service_role ключем — ОБХОДИТЬ RLS, має повний доступ на запис.
// Використовувати ТІЛЬКИ в серверних контекстах (API-роути, cron), НІКОЛИ в браузері.
// Ключ береться з SUPABASE_SERVICE_ROLE_KEY (НЕ NEXT_PUBLIC — не потрапляє в клієнт).
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Відсутні NEXT_PUBLIC_SUPABASE_URL або SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
