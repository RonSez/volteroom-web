import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/**
 * Service-role Supabase client — BYPASSES Row Level Security.
 *
 * Use ONLY for trusted server-side maintenance (the seed script, one-off
 * migrations). The key is read from a non-NEXT_PUBLIC_ env var, so it is never
 * bundled into client code (it would be `undefined` there). Normal admin
 * mutations use the authenticated server client (`./server`) so RLS + login
 * still apply.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local (server only).",
    );
  }
  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
