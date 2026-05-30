# Ardis — магазин велосипедів (Next.js 16 + Supabase)

Офіційний магазин велосипедів Ardis. Стек: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, Supabase.

## Що це і де ми зараз

Сайт збирається шарами. **Цей архів — Шар 1: каркас.**

- ✅ Структура проєкту, конфіги (Next 16, Tailwind v4, TS)
- ✅ Клієнти Supabase (server + browser), типи, шар доступу до даних
- ✅ SQL-схема з таблицями, RLS і демо-каталогом
- ✅ Root layout зі шрифтами (Unbounded + Manrope) і глобальним SEO + JSON-LD
- ⏳ Далі: головна, сторінки товарів, кошик, оформлення, sitemap/robots

Тимчасова головна показує список товарів із Supabase — щоб одразу побачити, що зв'язок працює.

## Запуск (по кроках, без терміналу для БД)

### 1. Supabase
1. Відкрий свій проєкт → **SQL Editor**.
2. Скопіюй увесь вміст `supabase/schema.sql` і виконай (Run).
3. Перевір: `select count(*) from products;` → має бути **9**.

### 2. Ключі
1. Project Settings → **API**.
2. Створи файл `.env.local` у корені (скопіюй із `.env.example`) і встав:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

### 3. Локальний запуск / деплой
- Залий файли в репозиторій через GitHub web UI (структуру папок збережено).
- На Vercel: Import репозиторій → додай ті самі 2 env-змінні в Project Settings → Environment Variables → Deploy.

## Структура

```
ardis/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # шрифти + глобальне SEO + JSON-LD
│   │   ├── page.tsx          # ТИМЧАСОВА головна (Шар 1)
│   │   └── globals.css       # дизайн-токени Tailwind v4
│   ├── lib/
│   │   ├── site.ts           # конфіг сайту, формат ціни, розрахунок рами
│   │   ├── supabase-server.ts
│   │   ├── supabase-browser.ts
│   │   └── products.ts       # шар доступу до даних
│   └── types/index.ts        # типи Product / Order / Cart
├── supabase/schema.sql       # таблиці + RLS + сід
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── package.json
└── .env.example
```

## Перед продакшеном
- У `src/lib/site.ts` заміни `url: "https://ardis.example"` на реальний домен.
- Перевір контакти/адреси шоурумів у тому ж файлі.
