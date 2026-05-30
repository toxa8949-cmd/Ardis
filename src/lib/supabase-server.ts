import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Серверний клієнт Supabase для Server Components, Route Handlers, Server Actions.
// Використовує анонімний ключ + RLS. Викликати в межах запиту (cookies() асинхронний у Next 16).
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll викликаний із Server Component — ігноруємо, оновлення сесії
            // відбувається через middleware (для read-only сторінок це нормально).
          }
        },
      },
    }
  );
}
