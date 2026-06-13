-- ===========================================================================
-- МІГРАЦІЯ: реальні відгуки покупців (заміна фейкових статичних зірочок).
-- Запускати в Supabase SQL Editor. Повторний запуск безпечний (IF NOT EXISTS).
-- ===========================================================================

create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  author      text not null check (char_length(author) between 2 and 60),
  rating      smallint not null check (rating between 1 and 5),
  body        text check (char_length(body) <= 2000),
  -- Статус модерації: pending (нове), approved (показуємо), rejected (відхилено).
  status      text not null default 'pending'
              check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now()
);

-- Індекс для швидкого читання схвалених відгуків товару.
create index if not exists reviews_product_status_idx
  on reviews (product_id, status);

alter table reviews enable row level security;

-- Анонім (відвідувач сайту) може ЛИШЕ створити відгук, який одразу 'pending'.
-- Захист від підробки статусу: WITH CHECK дозволяє вставку тільки зі status='pending'.
drop policy if exists "anon can submit review" on reviews;
create policy "anon can submit review" on reviews
  for insert
  with check (status = 'pending');

-- Анонім може ЧИТАТИ лише схвалені відгуки (для показу на сторінці товару).
drop policy if exists "public read approved reviews" on reviews;
create policy "public read approved reviews" on reviews
  for select
  using (status = 'approved');

-- Перегляд усіх відгуків (зокрема pending), зміна статусу та видалення —
-- лише через service_role (адмінка), який обходить RLS. Окремих policy не треба.

-- ===========================================================================
-- ОПЦІОНАЛЬНО: обнулити старі фейкові рейтинги в products.
-- Поля rating/reviews лишаються в таблиці для сумісності, але БІЛЬШЕ НЕ
-- використовуються у JSON-LD (тепер агрегат рахується з таблиці reviews).
-- Розкоментуй, якщо хочеш одразу прибрати демо-значення з адмінки/сортувань.
-- ---------------------------------------------------------------------------
-- update products set rating = 0, reviews = 0;
