-- Per-gang line diagrams for the universal frame.
-- A frame is one product with 1–5 gang variants; each gang has its own diagram.
-- This column lets the product gallery swap the diagram with the selected gang,
-- mirroring how `finish_id` swaps front photos. NULL = applies to all gangs
-- (covers/mechanisms, which have a single finish-agnostic diagram).
alter table public.product_images
  add column if not exists gang integer;
