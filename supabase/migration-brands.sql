-- ===========================================================================
-- ARDIS — Міграція до Шару 6: бренди + категорії-довідник
-- Запусти ВЕСЬ цей файл у Supabase SQL Editor (один раз). Idempotent.
-- ===========================================================================

-- --- 1. Таблиця категорій (довідник) --------------------------------------
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  "group"    text not null default 'velosypedy',  -- група: velosypedy / zapchastyny / aksesuary
  sort_order integer not null default 0
);

alter table categories enable row level security;
drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);

insert into categories (slug, name, "group", sort_order) values
  ('girski','Гірські','velosypedy',0),
  ('dvopidvisy','Двопідвіси','velosypedy',1),
  ('komfortni','Комфортні','velosypedy',2),
  ('dorozhni','Дорожні','velosypedy',3),
  ('pidlitkovi','Підліткові','velosypedy',4),
  ('girski-dytyachi','Гірські дитячі','velosypedy',5),
  ('dytyachi','Дитячі','velosypedy',6),
  ('bmx','BMX','velosypedy',7),
  ('elektrovelosipedi','Електровелосипеди','velosypedy',8),
  ('inshi','Інші','velosypedy',9),
  ('zapchastyny','Запчастини','zapchastyny',20),
  ('aksesuary','Аксесуари','aksesuary',30)
on conflict (slug) do nothing;

-- --- 2. Таблиця брендів ---------------------------------------------------
create table if not exists brands (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  is_own     boolean not null default false,
  sort_order integer not null default 0
);

alter table brands enable row level security;
drop policy if exists "public read brands" on brands;
create policy "public read brands" on brands for select using (true);

insert into brands (slug, name, is_own, sort_order) values
  ('ardis','Ardis', true, 0),
  ('crossride','Crossride', false, 1),
  ('corrado','Corrado', false, 2),
  ('forever','Forever', false, 3),
  ('rockshark','RockShark', false, 4),
  ('royalbaby','RoyalBaby', false, 5),
  ('swiftpro','SwiftPro', false, 6)
on conflict (slug) do nothing;

-- --- 3. Нові поля у products ----------------------------------------------
alter table products add column if not exists brand_id uuid references brands(id);
alter table products add column if not exists category_slug text;
alter table products add column if not exists wheel_size text;
alter table products add column if not exists frame_size text;
alter table products add column if not exists speeds integer;

create index if not exists products_brand_idx on products (brand_id);
create index if not exists products_category_slug_idx on products (category_slug);

-- --- 4. Мапимо старі демо-категорії на нові slug --------------------------
update products set category_slug = 'girski'    where category::text = 'mountain' and category_slug is null;
update products set category_slug = 'komfortni' where category::text = 'city'     and category_slug is null;
update products set category_slug = 'dorozhni'  where category::text = 'gravel'   and category_slug is null;
update products set category_slug = 'zapchastyny' where category::text = 'parts'  and category_slug is null;

-- Прив'язуємо наявні товари до бренду Ardis
update products
set brand_id = (select id from brands where slug = 'ardis')
where brand_id is null;

-- --- 5. Кілька демо-товарів інших брендів (приклад роботи фільтра) --------
insert into products (slug, name, category, category_slug, rider, type, price, old_price, badge, min_height, max_height, frame, wheel, wheel_size, drivetrain, brakes, speeds, description, rating, reviews, brand_id) values
  ('crossride-29-jet','Crossride 29 MTB ST "JET"','mountain','girski','adult','bike',9990,11490,'hit',175,195,'Сталь','29"','29','Shimano 21s','Дискові механічні',21,'Гірський велосипед Crossride на сталевій рамі з колесами 29 дюймів. Надійний вибір для активного відпочинку.',4.7,33,(select id from brands where slug='crossride')),
  ('corrado-26-cherry','Corrado 26 MTB ST "CHERRY"','mountain','girski','adult','bike',8490,null,'new',160,180,'Сталь','26"','26','Shimano 18s','V-brake',18,'Класичний гірський велосипед Corrado з колесами 26". Чудово підходить для міста та легкого бездоріжжя.',4.5,18,(select id from brands where slug='corrado')),
  ('royalbaby-16-kids','RoyalBaby 16 "Freestyle"','city','dytyachi','child','bike',5990,6490,'hit',105,120,'Сталь','16"','16','1 швидкість','Ножні + ручні',1,'Дитячий велосипед RoyalBaby 16" з додатковими колесами. Безпечний та яскравий.',4.9,64,(select id from brands where slug='royalbaby')),
  ('rockshark-275-e','Електровелосипед RockShark 27.5 "ROCK003" 350W','gravel','elektrovelosipedi','adult','bike',28990,null,'new',170,190,'Алюміній','27.5"','27.5','Shimano 21s + мотор 350W','Гідравлічні дискові',21,'Електровелосипед RockShark із мотором 350W. До 60 км на одному заряді.',4.8,11,(select id from brands where slug='rockshark'))
on conflict (slug) do nothing;

update products set category_slug = 'elektrovelosipedi' where slug = 'rockshark-275-e';

-- Кольори для нових демо-товарів
insert into product_colors (product_id, name, hue, sort_order)
select p.id, c.name, c.hue, c.sort_order
from products p
join (values
  ('crossride-29-jet','Чорно-помаранчевий',24,0),
  ('crossride-29-jet','Чорно-синій',220,1),
  ('corrado-26-cherry','Вишневий',350,0),
  ('royalbaby-16-kids','Червоний',0,0),
  ('royalbaby-16-kids','Зелений',130,1),
  ('rockshark-275-e','Графіт',210,0)
) as c(slug, name, hue, sort_order) on c.slug = p.slug
where not exists (
  select 1 from product_colors pc where pc.product_id = p.id
);

-- Готово. Перевір: select count(*) from brands;  -> 7
--               select count(*) from categories; -> 12
--               select count(*) from products;   -> 13
