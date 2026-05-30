import { createSupabaseServerClient } from "@/lib/supabase-server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// Layout адмінки. Сторінка входу (/admin/login) має власний повноекранний вигляд,
// тож якщо користувача нема — просто показуємо children (це буде login).
// Middleware вже редіректить неавторизованих із захищених сторінок на /admin/login.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Немає користувача → це сторінка входу (middleware не пускає далі без авторизації)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <AdminSidebar email={user.email ?? ""} />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
