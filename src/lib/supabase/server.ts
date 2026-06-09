import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Server Supabase client (anon key + RLS). Use in Server Components, Route
 * Handlers, and Server Actions. `cookies()` is async in Next 16.
 *
 * During an RSC render, cookies cannot be written — the `setAll` try/catch
 * swallows that. Session refresh happens in `src/middleware.ts` instead, so
 * the thrown-and-ignored write here is harmless.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render — ignore; middleware refreshes.
        }
      },
    },
  });
}
