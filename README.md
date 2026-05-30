# Ardis — магазин велосипедів (Next.js 16 + Supabase)

Офіційний магазин велосипедів Ardis українського виробництва.
Стек: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, Supabase, Vercel.

## Готово (усі 5 шарів)

- ✅ Шар 1 — каркас, Supabase, типи, SQL-схема, глобальне SEO
- ✅ Шар 2 — головна: Hero, каталог, картки, фільтри, калькулятор ростовки
- ✅ Шар 3 — сторінки товарів /bikes/[slug], метадані, Product + Breadcrumb JSON-LD
- ✅ Шар 4 — кошик (Context + localStorage), оформлення, запис замовлень у Supabase
- ✅ Шар 5 — sitemap.xml, robots.txt, OG-зображення, ItemList JSON-LD

## Структура

```
src/
├── app/
│   ├── layout.tsx              # шрифти, глобальне SEO, JSON-LD організації, провайдери
│   ├── page.tsx                # головна (SSR) + ItemList JSON-LD
│   ├── bikes/[slug]/page.tsx   # сторінка товару (SSG) + Product/Breadcrumb JSON-LD
│   ├── not-found.tsx           # 404
│   ├── sitemap.ts              # /sitemap.xml (головна + усі товари)
│   ├── robots.ts               # /robots.txt
│   ├── opengraph-image.tsx     # прев'ю посилань
│   └── globals.css             # дизайн-токени Tailwind v4
├── components/                 # Hero, Catalog, ProductCard, кошик, тости тощо
├── lib/                        # supabase-*, products (data layer), site (конфіг)
└── types/                      # типи Product / Order / Cart
supabase/schema.sql             # таблиці + RLS + сід
```

## ⚠️ Перед підключенням домену — обов'язково

Коли купиш домен, зроби ДВІ речі, щоб уникнути проблеми www / non-www
(тієї самої, що була на іншому проєкті):

1. **У `src/lib/site.ts`** заміни:
   ```
   url: "https://ardis.example"
   ```
   на реальний домен БЕЗ www і БЕЗ слешу в кінці, напр.:
   ```
   url: "https://ardis.ua"
   ```
   Залий зміну в GitHub — від цього залежать canonical, sitemap, OG-теги.

2. **На Vercel** (Settings → Domains): додай і `ardis.ua`, і `www.ardis.ua`,
   але ОДИН признач основним (Primary), а другий хай робить redirect на нього.
   Обери той самий варіант (без www), що в site.ts.

Після цього в Google Search Console додай домен і submit `https://ardis.ua/sitemap.xml`.

## Контакти/адреси
Шоуруми, телефони, години — у `src/lib/site.ts` (SITE.showrooms).
