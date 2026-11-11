-- Per-variant prices for covers and frames.
-- Keyed exactly like `variant_skus`: by finish id for covers, by
-- `${gang}-${finishId}` for frames. Values are VAT-inclusive EUR amounts.
-- A variant without an entry falls back to `base_price`.
alter table public.products
  add column if not exists variant_prices jsonb;
