-- Міграція: колонка updated_at для products.
--
-- НАВІЩО: sitemap.xml має віддавати Google реальну дату зміни товару.
-- Раніше там стояв час білду — однаковий для всіх 2300+ URL, через що
-- Google перестає довіряти lastmod і обходить сайт рідше.
--
-- Код у src/lib/products.ts (getProductSitemapEntries) сам відкочується
-- на created_at, якщо цієї колонки ще нема. Тому порядок не критичний:
-- можна запустити цей SQL і до, і після деплою.
--
-- Запускати у Supabase → SQL Editor. Ідемпотентно, можна повторювати.

-- 1. Колонка. Наявним рядкам ставимо created_at, щоб не отримати
--    2300 товарів з однаковою «сьогоднішньою» датою — це та сама проблема,
--    яку ми й лікуємо.
alter table products
  add column if not exists updated_at timestamptz not null default now();

update products
set updated_at = created_at
where updated_at > created_at
  and updated_at >= now() - interval '5 minutes';

-- 2. Функція-тригер: оновлює позначку часу при будь-якій зміні рядка.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. Тригер на products.
drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();

-- 4. Індекс — sitemap читає товари пачками по 1000 і сортує за slug,
--    але цей індекс знадобиться для «що змінилось останнім» у майбутньому.
create index if not exists products_updated_at_idx on products (updated_at desc);

-- ПЕРЕВІРКА після запуску:
--   select count(*), min(updated_at), max(updated_at) from products;
-- Очікуємо розкид дат, а не одну спільну.
