import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog";
import { MARKETING_TAG } from "@/lib/marketing";
import { SLIDESHOW_TAG } from "@/lib/slideshow";

/**
 * On-demand cache revalidation for out-of-band data writes.
 *
 * The public content (catalog, marketing copy, slideshow) is served from
 * `unstable_cache` and only refreshes when something calls `revalidateTag` in a
 * live request. The admin panel does that on every mutation, but the bulk
 * upload/seed SCRIPTS write straight to Supabase and can't call `revalidateTag`
 * — and, crucially, Vercel's Data Cache persists across deployments, so a
 * redeploy does NOT clear it either. This route lets those scripts push their
 * changes live by POSTing here after they finish (see `scripts/revalidate.ts`).
 *
 * Auth: a shared secret in `REVALIDATE_SECRET` (set in the Vercel project env
 * and in `.env.local` for the scripts). No secret configured => the route
 * refuses to run, so it can never be left open by accident.
 *
 *   POST /api/revalidate                      → revalidates the catalog (default)
 *   POST /api/revalidate?tag=marketing        → a specific tag
 *   POST /api/revalidate?tag=catalog&tag=slideshow  → several
 *
 * `{ expire: 0 }` expires the entry immediately (the webhook/external-writer
 * pattern from the Next docs), matching what the admin actions use.
 */

// Only tags we own may be revalidated — never trust an arbitrary string.
const ALLOWED_TAGS = new Set([CATALOG_TAG, MARKETING_TAG, SLIDESHOW_TAG]);

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return Response.json(
      { revalidated: false, error: "REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.headers.get("x-revalidate-secret") ??
    request.nextUrl.searchParams.get("secret");
  if (provided !== secret) {
    return Response.json({ revalidated: false, error: "Unauthorized" }, { status: 401 });
  }

  // Default to the catalog (the common case) when no tag is given.
  const requested = request.nextUrl.searchParams.getAll("tag");
  const tags = requested.length ? requested : [CATALOG_TAG];

  const invalid = tags.filter((t) => !ALLOWED_TAGS.has(t));
  if (invalid.length) {
    return Response.json(
      { revalidated: false, error: `Unknown tag(s): ${invalid.join(", ")}` },
      { status: 400 },
    );
  }

  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return Response.json({ revalidated: true, tags });
}
