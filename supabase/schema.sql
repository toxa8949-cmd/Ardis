-- ===========================================================================
-- ARDIS STORE — Supabase схема
-- Запусти цей файл у Supabase SQL Editor (увесь блок за раз).
-- Безпечний до повторного запуску (idempotent) завдяки IF NOT EXISTS / ON CONFLICT.
-- ===========================================================================

-- --- ENUM-типи ------------------------------------------------------------
do $$ begin
  create type product_category as enum ('mountain','city','gravel','parts');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rider_type as enum ('adult','teen','child','any');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_kind as enum ('bike','part');
exception when duplicate_object then null; end $$;

do $$ begin
  create type badge_type as enum ('hit','new','sale');
exception when duplicate_object then null; end $$;

do $$ begin
  create type delivery_method as enum ('nova_poshta','pickup');
exception when duplicate_object then null; end $$;

-- --- Таблиця товарів ------------------------------------------------------
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  category    product_category not null,
  rider       rider_type not null default 'any',
  type        product_kind not null default 'bike',
  price       integer not null check (price >= 0),
  old_price   integer check (old_price is null or old_price >= price),
  badge       badge_type,
  min_height  integer,
  max_height  integer,
  frame       text not null default '',
  wheel       text not null default '',
  drivetrain  text not null default '',
  brakes      text not null default '',
  description text,
  rating      numeric(2,1) not null default 5.0 check (rating between 0 and 5),
  reviews     integer not null default 0,
  in_stock    boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists products_category_idx on products (category);
create index if not exists products_rider_idx on products (rider);

-- --- Кольори товару (1 товар -> багато кольорів) --------------------------
create table if not exists product_colors (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  name        text not null,
  hue         integer not null default 24,
  sort_order  integer not null default 0
);

create index if not exists product_colors_product_idx on product_colors (product_id);

-- --- Замовлення -----------------------------------------------------------
create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone         text not null,
  city          text,
  delivery      delivery_method not null default 'nova_poshta',
  items         jsonb not null,
  total         integer not null check (total >= 0),
  status        text not null default 'new',
  created_at    timestamptz not null default now()
);

-- ===========================================================================
-- RLS (Row Level Security)
-- ===========================================================================
alter table products enable row level security;
alter table product_colors enable row level security;
alter table orders enable row level security;

-- Товари та кольори — публічне читання
drop policy if exists "public read products" on products;
create policy "public read products" on products
  for select using (true);

drop policy if exists "public read colors" on product_colors;
create policy "public read colors" on product_colors
  for select using (true);

-- Замовлення — анонім може лише СТВОРИТИ (insert), читати/міняти не може.
-- Перегляд замовлень — лише через service_role (адмінка/бекенд).
drop policy if exists "anon can create orders" on orders;
create policy "anon can create orders" on orders
  for insert with check (true);

-- ===========================================================================
-- СІД-ДАНІ (демо-каталог). Повторний запуск не дублює завдяки ON CONFLICT.
-- ===========================================================================
insert into products (slug, name, category, rider, type, price, old_price, badge, min_height, max_height, frame, wheel, drivetrain, brakes, description, rating, reviews) values
  ('summit-amg-29','Ardis Summit AMG 29','mountain','adult','bike',18990,21990,'hit',170,195,'Алюміній 6061-T6','29"','Shimano Deore 12s','Гідравліка Shimano MT200','Флагманський гірський велосипед для вимогливих трас. Легка алюмінієва рама, надійна трансмісія Shimano Deore та гідравлічні гальма.',4.9,42),
  ('trail-x-275','Ardis Trail X 27.5','mountain','adult','bike',14490,null,'new',160,185,'Алюміній Hydroformed','27.5"','Shimano Altus 9s','Механічні дискові Ares','Маневрений хардтейл для лісових стежок і міста. Колеса 27.5" дають баланс між накатом і контролем.',4.7,19),
  ('metro-city-space','Ardis Metro City Space','city','adult','bike',11990,13990,'sale',165,190,'Сталь Hi-Ten','28"','Shimano Nexus 7s','V-Brake','Класичний міський велосипед із плавним ходом і захистом ланцюга. Ідеальний для щоденних поїздок.',4.6,31),
  ('gravel-pro-carbon','Ardis Gravel Pro Carbon','gravel','adult','bike',26990,29990,'hit',172,196,'Carbon Monocoque','700x38c','Shimano GRX RX400','Гідравліка Shimano GRX','Карбоновий грейвл для довгих пригод по змішаному покриттю. Аеродинамічна геометрія та компоненти Shimano GRX.',5.0,14),
  ('junior-mtb-24','Ardis Junior MTB 24','mountain','teen','bike',7990,8990,'sale',130,160,'Полегшена сталь','24"','Shimano Tourney 7s','Дискові механічні','Підлітковий гірський велосипед із заниженою вагою. Дискові гальма для впевненого контролю.',4.6,25),
  ('kids-star-20','Ardis Kids Star 20','city','child','bike',4990,5490,'hit',110,135,'Сталь, занижена геометрія','20"','1 швидкість','Ножні + ручні задні','Перший «дорослий» велосипед для дитини. Стійка геометрія, прості та надійні гальма.',4.9,58),
  ('pro-platform-pedals','Педалі Ardis PRO Platform','parts','any','part',850,1100,'hit',null,null,'Алюміній CNC','Промпідшипники','Змінні шипи','Універсальна різьба 9/16"','Алюмінієві платформи з обробкою CNC і промисловими підшипниками. Чіпкі шипи для будь-якого взуття.',4.8,12),
  ('wireless-computer-14','Велокомп''ютер Ardis Wireless 14','parts','any','part',690,null,'new',null,null,'Корпус IPX7','Бездротовий','14 функцій','Підсвітка екрана','Бездротовий велокомп''ютер із 14 функціями та вологозахистом IPX7. Швидкість, відстань, час у дорозі.',4.5,8),
  ('defender-fenders','Крила Ardis Defender 26–29','parts','any','part',420,550,null,null,null,'Гнучкий пластик','Для коліс 26–29"','Швидкознімне кріплення','Регульований кут','Універсальні крила для захисту від бруду. Підходять до коліс 26–29", легко знімаються.',4.3,21)
on conflict (slug) do nothing;

-- Кольори. Прив'язуємо за slug, щоб не залежати від згенерованих uuid.
-- Спершу чистимо кольори демо-товарів, тоді вставляємо (щоб повторний запуск був чистим).
delete from product_colors where product_id in (
  select id from products where slug in (
    'summit-amg-29','trail-x-275','metro-city-space','gravel-pro-carbon',
    'junior-mtb-24','kids-star-20','pro-platform-pedals','wireless-computer-14','defender-fenders'
  )
);

insert into product_colors (product_id, name, hue, sort_order)
select p.id, c.name, c.hue, c.sort_order
from products p
join (values
  ('summit-amg-29','Матовий графіт',210,0),
  ('summit-amg-29','Вогняний помаранчевий',24,1),
  ('summit-amg-29','Камуфляжний зелений',140,2),
  ('trail-x-275','Глибокий синій',230,0),
  ('trail-x-275','Яскравий лайм',85,1),
  ('metro-city-space','Чорний глянець',0,0),
  ('metro-city-space','Бордовий перламутр',340,1),
  ('gravel-pro-carbon','Кіберпанк фіолетовий',280,0),
  ('gravel-pro-carbon','Сухий карбон',20,1),
  ('junior-mtb-24','Кислотний зелений',100,0),
  ('junior-mtb-24','Неоновий рожевий',320,1),
  ('kids-star-20','Сонячний жовтий',50,0),
  ('kids-star-20','Блакитний аквамарин',190,1),
  ('pro-platform-pedals','Стелс',24,0),
  ('wireless-computer-14','Чорний',200,0),
  ('defender-fenders','Матовий чорний',0,0)
) as c(slug, name, hue, sort_order) on c.slug = p.slug;

-- Готово. Перевір: select count(*) from products;  -> має бути 9
