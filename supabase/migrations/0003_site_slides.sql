-- Volteroom — homepage "switch" slideshow images
-- Three fixed slides (slot 1..3). The localized title/caption for each slide
-- live in `marketing_copy` under `home.switchShowcase.items.<i>.{title,caption}`;
-- only the IMAGE is stored here. A null/empty storage_path => the public site
-- falls back to the static `/brand/switch-pic-<slot>.jpg`.
-- Run in the Supabase SQL Editor (or via `supabase db push`).

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists public.site_slides (
  slot          integer primary key check (slot in (1, 2, 3)),
  storage_path  text,
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security: public read, authenticated write
-- ---------------------------------------------------------------------------

alter table public.site_slides enable row level security;

drop policy if exists site_slides_public_read on public.site_slides;
create policy site_slides_public_read
  on public.site_slides for select using (true);

drop policy if exists site_slides_auth_write on public.site_slides;
create policy site_slides_auth_write
  on public.site_slides for all to authenticated
  using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Storage: public-read bucket for site (non-product) images
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

drop policy if exists "site_images_public_read" on storage.objects;
create policy "site_images_public_read"
  on storage.objects for select
  using (bucket_id = 'site-images');

drop policy if exists "site_images_auth_write" on storage.objects;
create policy "site_images_auth_write"
  on storage.objects for all to authenticated
  using (bucket_id = 'site-images')
  with check (bucket_id = 'site-images');
