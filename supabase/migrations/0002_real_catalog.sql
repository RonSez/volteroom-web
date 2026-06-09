-- Volteroom — real catalog rebuild (from the client's product Excel).
-- Adds the structured fields the new product model needs:
--   * a `kind` axis (mechanism | cover | frame) that drives the product-page UX
--   * the real article numbers (`sku` for mechanisms, `variant_skus` per finish/gang)
--   * a structured `specs` blob (the numbered characteristics from the sheet)
--   * a `code` (SKU suffix) on finishes, and image `view` + `finish_id` for the gallery
-- Idempotent — safe to re-run. Run in the Supabase SQL editor (like 0001).

-- Finishes: the SKU suffix used to build article numbers (GLW, MW, FBK, CH, GRF).
alter table public.finishes
  add column if not exists code text;

-- Products: the new structured columns.
alter table public.products
  add column if not exists kind text not null default 'mechanism',
  add column if not exists component_type text,
  add column if not exists sku text,
  add column if not exists variant_skus jsonb not null default '{}'::jsonb,
  add column if not exists specs jsonb not null default '{}'::jsonb;

-- A light constraint so only the three known kinds are stored.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_kind_check'
  ) then
    alter table public.products
      add constraint products_kind_check
      check (kind in ('mechanism', 'cover', 'frame'));
  end if;
end$$;

-- Product images: which view this photo is (front / back / diagram) and, for
-- covers/frames, which finish it depicts (so the gallery can swap the front
-- image with the selected colour). Null finish_id = applies to all finishes.
alter table public.product_images
  add column if not exists view text,
  add column if not exists finish_id text
    references public.finishes(id) on delete set null;
