"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, Lock } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!email || !password) {
      setError("Введіть email і пароль");
      return;
    }
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Невірний email або пароль");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Помилка з'єднання. Спробуйте ще раз");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent to-amber-500 text-white">
            <Bike size={28} />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Адмінка Ardis</h1>
          <p className="mt-1 text-sm text-gray-500">Вхід для адміністратора</p>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="w-full rounded-xl border border-black/10 bg-paper px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Пароль"
            autoComplete="current-password"
            className="w-full rounded-xl border border-black/10 bg-paper px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
          {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
          <button
            onClick={submit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 font-bold text-white transition-all hover:bg-accent active:scale-[.98] disabled:opacity-60"
          >
            <Lock size={16} /> {loading ? "Вхід…" : "Увійти"}
          </button>
        </div>
      </div>
    </main>
  );
}
