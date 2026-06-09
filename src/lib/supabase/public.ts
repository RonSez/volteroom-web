import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Cookie-less anon client for cached PUBLIC reads.
 *
 * The cookie-bound `./server` client cannot be used inside `unstable_cache`
 * (reading cookies there throws). Public content tables have RLS `select
 * using (true)`, so the anon key reads them fine without a session.
 */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
