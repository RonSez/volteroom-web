-- Volteroom — initial schema
-- Localized fields are JSONB holding { "sk": "...", "en": "...", "cs": "..." }
-- to map 1:1 to the app's `Record<Locale, string>` shape.
-- Run in the Supabase SQL Editor (or via `supabase db push`).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.finishes (
  id          text primary key,
  name        jsonb not null,
  hex         text  not null,
  light       boolean not null default false,
  sort_order  integer not null default 0
);

create table if not exists public.categories (
  id          text primary key,
  name        jsonb not null,
  tagline     jsonb not null,
  sort_order  integer not null default 0
);

create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  category_id  text not null references public.categories(id) on delete restrict,
  name         jsonb not null,
  description  jsonb not null,
  base_price   numeric(10,2) not null,
  gangs        integer[] null,
  featured     boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);

-- No rows for a product  =>  "all finishes available" (preserves the current
-- `product.finishes` optional-defaults-to-all behaviour).
create table if not exists public.product_finishes (
  product_id  uuid not null references public.products(id) on delete cascade,
  finish_id   text not null references public.finishes(id) on delete cascade,
  primary key (product_id, finish_id)
);

-- next-intl message overrides, one row per (dotted key, locale).
create table if not exists public.marketing_copy (
  key     text not null,
  locale  text not null check (locale in ('sk','en','cs')),
  value   text not null,
  primary key (key, locale)
);

create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  storage_path  text not null,
  alt           jsonb null,
  sort_order    integer not null default 0,
  is_primary    boolean not null default false
);

create index if not exists product_images_product_idx on public.product_images (product_id);

-- Keep products.updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: public read, authenticated write
-- ---------------------------------------------------------------------------

alter table public.finishes        enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_finishes enable row level security;
alter table public.marketing_copy  enable row level security;
alter table public.product_images  enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'finishes','categories','products','product_finishes','marketing_copy','product_images'
  ] loop
    execute format('drop policy if exists %I_public_read on public.%I;', t, t);
    execute format(
      'create policy %I_public_read on public.%I for select using (true);', t, t);

    execute format('drop policy if exists %I_auth_write on public.%I;', t, t);
    execute format(
      'create policy %I_auth_write on public.%I for all to authenticated using (true) with check (true);',
      t, t);
  end loop;
end$$;

-- ---------------------------------------------------------------------------
-- Storage: public-read bucket for product images
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product_images_auth_write" on storage.objects;
create policy "product_images_auth_write"
  on storage.objects for all to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');
