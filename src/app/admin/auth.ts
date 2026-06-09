import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Require an authenticated user. Returns the request-bound server client plus
 * the user, or redirects to the login page. Call this at the top of every
 * protected admin page/layout AND every admin Server Action — per Next 16,
 * Server Actions are POSTs that bypass the layout guard, so each must re-check.
 */
export async function requireUser(): Promise<{
  supabase: SupabaseClient;
  user: User;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return { supabase, user };
}
