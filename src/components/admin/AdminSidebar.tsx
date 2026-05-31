"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, FileText, ShoppingBag, LogOut, Bike, ExternalLink, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const NAV = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Товари", icon: Package },
  { href: "/admin/accessories", label: "Аксесуари-акції", icon: Sparkles },
  { href: "/admin/blog", label: "Блог", icon: FileText },
  { href: "/admin/orders", label: "Замовлення", icon: ShoppingBag },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-black/5 bg-white">
      <div className="flex items-center gap-2 border-b border-black/5 p-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-amber-500 text-white">
          <Bike size={20} />
        </span>
        <div>
          <div className="font-bold leading-tight">Ardis</div>
          <div className="text-[11px] text-gray-400">Адмінпанель</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((n) => {
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-accent/10 text-accent-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <n.icon size={18} /> {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-black/5 p-3">
        <a
          href="/"
          target="_blank"
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
        >
          <ExternalLink size={18} /> Відкрити сайт
        </a>
        <div className="px-3 py-2 text-[11px] text-gray-400">{email}</div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50"
        >
          <LogOut size={18} /> Вийти
        </button>
      </div>
    </aside>
  );
}
