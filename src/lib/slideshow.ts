import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Homepage "switch" slideshow images.
 *
 * Three fixed slides (slot 1..3). Each slot's image is stored in the
 * `site_slides` table (path into the public `site-images` bucket); the
 * localized title/caption live in `marketing_copy` and are read through
 * next-intl, not here. When a slot has no uploaded image (or the DB is
 * unreachable), we fall back to the static `/brand/switch-pic-<slot>.jpg`
 * shipped in `public/`, so the slideshow always renders.
 *
 * Admin uploads call `revalidateTag(SLIDESHOW_TAG)` to push new images live.
 */

export const SLIDESHOW_TAG = "slideshow";
export const SLIDE_BUCKET = "site-images";
export const SLIDE_SLOTS = [1, 2, 3] as const;

const fallbackFor = (slot: number) => `/brand/switch-pic-${slot}.jpg`;

/** Cached fetch of `{ slot: storage_path }` for the slideshow. */
const loadSlidePaths = unstable_cache(
  async (): Promise<Record<number, string>> => {
    const sb = createPublicClient();
    const { data, error } = await sb
      .from("site_slides")
      .select("slot, storage_path");
    if (error) throw error;
    return Object.fromEntries(
      (data ?? [])
        .filter((r) => r.storage_path)
        .map((r) => [r.slot as number, r.storage_path as string]),
    );
  },
  ["site-slides"],
  { tags: [SLIDESHOW_TAG] },
);

/**
 * Public image URL per slide, in slot order (1..3). Uploaded image when present,
 * otherwise the static brand fallback. Never throws — a missing/unreachable DB
 * yields all fallbacks.
 */
export async function getSlideImages(): Promise<string[]> {
  let paths: Record<number, string>;
  try {
    paths = await loadSlidePaths();
  } catch {
    paths = {};
  }

  const sb = createPublicClient();
  return SLIDE_SLOTS.map((slot) => {
    const path = paths[slot];
    if (!path) return fallbackFor(slot);
    return sb.storage.from(SLIDE_BUCKET).getPublicUrl(path).data.publicUrl;
  });
}
