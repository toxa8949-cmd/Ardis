import { getProducts } from "@/lib/products";

// ТИМЧАСОВА головна для Шару 1 — перевірка, що Supabase під'єднаний і дані читаються.
// У Шарі 2 замінимо на повноцінну головну (Hero, каталог, картки, калькулятор).
export default async function HomePage() {
  const products = await getProducts();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Ardis — каркас готовий ✅</h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        Шар 1 (структура + Supabase) працює. Знайдено товарів: {products.length}
      </p>
      <ul style={{ display: "grid", gap: "0.75rem" }}>
        {products.map((p) => (
          <li
            key={p.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "0.75rem 1rem",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              {p.name}{" "}
              <small style={{ color: "#9ca3af" }}>
                ({p.colors.length} кол., {p.category})
              </small>
            </span>
            <strong>{p.price.toLocaleString("uk-UA")} ₴</strong>
          </li>
        ))}
      </ul>
      {products.length === 0 && (
        <p style={{ marginTop: "1.5rem", color: "#dc2626" }}>
          0 товарів — перевір, що ти запустив supabase/schema.sql і додав ключі в .env.local
        </p>
      )}
    </main>
  );
}
