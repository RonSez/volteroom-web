/**
 * Push out-of-band Supabase writes live by pinging the deployed
 * `/api/revalidate` route, which clears the `unstable_cache` entry for the
 * given tag(s). Import and call this at the end of any upload/seed script.
 *
 * Requires (in `.env.local`, loaded by the calling script):
 *   REVALIDATE_URL     — the deployed site origin, e.g. https://volteroom.com
 *   REVALIDATE_SECRET  — must match the same var in the Vercel project env
 *
 * A redeploy will NOT do this: Vercel's Data Cache survives deployments, so the
 * stale catalog snapshot lingers until a live request revalidates the tag.
 *
 * Best-effort: if the env vars are missing or the request fails it prints a
 * clear warning (and the manual fallback) but does not fail the upload — the
 * photos are already in Supabase either way.
 */
export async function revalidate(tags: string[] = ["catalog"]): Promise<void> {
  const base = process.env.REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!base || !secret) {
    console.warn(
      "\n⚠ Skipping cache revalidation — set REVALIDATE_URL and REVALIDATE_SECRET in .env.local.\n" +
        "  The changes are in Supabase but the live site is cached. To push them live now,\n" +
        "  re-save any product in the admin panel.",
    );
    return;
  }

  const url = new URL("/api/revalidate", base);
  for (const tag of tags) url.searchParams.append("tag", tag);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}` },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`${res.status} ${res.statusText} ${body}`.trim());
    }
    console.log(`\n✓ Revalidated live cache: ${tags.join(", ")}`);
  } catch (err) {
    console.warn(
      `\n⚠ Cache revalidation request failed: ${
        err instanceof Error ? err.message : err
      }\n  The changes are in Supabase. Re-save any product in the admin panel to push them live.`,
    );
  }
}
