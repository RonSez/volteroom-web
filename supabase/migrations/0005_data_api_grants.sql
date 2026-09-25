-- Volteroom — explicit Data API grants.
--
-- From 2026-10-30 Supabase no longer auto-grants Data API access to newly
-- created tables in `public`. GRANTs and RLS are two different gates: a table
-- can have perfect policies (as 0001/0003 set up) and still answer
-- "permission denied" through supabase-js / PostgREST if the role was never
-- granted. This migration does two things:
--
--   1. Reasserts the grants on every existing table. A no-op against the live
--      database (those tables kept their grants), but it means running
--      `npx tsx scripts/db-migrate.ts` against a FRESH project / preview
--      branch still produces a working schema — 0005 grants what 0001+0003
--      created.
--   2. Restores the auto-grant for future tables in `public` via
--      ALTER DEFAULT PRIVILEGES, so a new table is reachable the moment it is
--      created (see the caveat at the bottom).
--
-- Roles: `anon` = the public site (read only), `authenticated` = the admin
-- panel, `service_role` = scripts/seed.ts and the upload:* scripts, which talk
-- to PostgREST with the service-role key.
--
-- Idempotent — safe to re-run. Run in the Supabase SQL editor (like 0001-0004).

-- ---------------------------------------------------------------------------
-- 1. Existing tables
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'finishes','categories','products','product_finishes',
    'marketing_copy','product_images','site_slides'
  ] loop
    execute format('grant select on public.%I to anon;', t);
    execute format(
      'grant select, insert, update, delete on public.%I to authenticated;', t);
    execute format(
      'grant select, insert, update, delete on public.%I to service_role;', t);
  end loop;
end$$;

-- The schema itself must be usable too (already true in production).
grant usage on schema public to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Future tables
-- ---------------------------------------------------------------------------
-- Applies to objects created by `postgres` — the role behind the SQL editor
-- and behind DATABASE_URL in scripts/db-migrate.ts.

alter default privileges for role postgres in schema public
  grant select on tables to anon;

alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to service_role;

-- For any future table with an identity/serial column.
alter default privileges for role postgres in schema public
  grant usage, select on sequences to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Caveat / template for new migrations
-- ---------------------------------------------------------------------------
-- The default privileges above only cover tables created by `postgres`. Don't
-- rely on them alone: paste this block after every `create table` from now on,
-- next to the RLS policies, so the migration is self-contained.
--
--   grant select on public.<table> to anon;
--   grant select, insert, update, delete on public.<table> to authenticated;
--   grant select, insert, update, delete on public.<table> to service_role;
--
-- Drop the `anon` line for a table the public site must not read, and narrow
-- the `authenticated` list for a read-only admin table.
