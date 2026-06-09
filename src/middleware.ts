import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./lib/supabase/env";

const handleI18n = createMiddleware(routing);

/**
 * Edge Middleware (the legacy `middleware.ts` convention).
 *
 * Next 16 renamed Middleware to Proxy, but Proxy is locked to the Node.js
 * runtime, which our deploy target (Cloudflare Workers via @opennextjs/
 * cloudflare) does not support. Keeping the `middleware.ts` filename makes
 * Next emit this as Edge Middleware, which Cloudflare runs. next-intl and
 * @supabase/ssr are both Edge-compatible, so nothing here needs the Node API.
 *
 * Two jobs, in order:
 *   1. next-intl handles locale detection / prefixing and produces the response.
 *   2. Supabase reads the request cookies and writes any refreshed-session
 *      cookies onto that same response, so the auth token stays fresh.
 *
 * Auth is NOT enforced here — the matcher excludes `/admin`, and Server
 * Actions are POSTs to their own route that bypass middleware guards anyway.
 * Admin pages/actions verify the user themselves (see src/app/admin).
 */
export default async function middleware(request: NextRequest) {
  const response = handleI18n(request);

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refreshes the session and writes updated cookies onto `response`.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Match all pathnames except:
  // - admin (its own layout/actions handle auth + it has no locale prefix)
  // - API routes, Next internals, and static files (with an extension)
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
