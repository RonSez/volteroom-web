import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Locale } from "@/i18n/routing";

/**
 * Marketing copy overrides from Supabase, merged over the next-intl JSON
 * message files. The JSON files remain the structural source (nesting, arrays,
 * ICU strings) AND the fallback, so a missing/unreachable DB never breaks the
 * site — DB rows only override individual leaf values by dotted key.
 *
 * Admin edits call `revalidateTag(MARKETING_TAG)` to push copy live.
 */

export const MARKETING_TAG = "marketing";

type Messages = Record<string, unknown>;

/** Cached per-locale fetch of `{ dottedKey: value }` overrides. */
const loadOverrides = unstable_cache(
  async (locale: string): Promise<Record<string, string>> => {
    const sb = createPublicClient();
    const { data, error } = await sb
      .from("marketing_copy")
      .select("key, value")
      .eq("locale", locale);
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  },
  ["marketing-copy"],
  { tags: [MARKETING_TAG] },
);

/** Set `value` at a dotted `path` inside `target`, creating containers as needed. */
function setByPath(target: Messages, path: string, value: string): void {
  const segments = path.split(".");
  let node: Record<string, unknown> | unknown[] = target;

  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    const nextIsIndex = /^\d+$/.test(segments[i + 1]);
    const container = node as Record<string, unknown>;
    if (
      container[key] === undefined ||
      container[key] === null ||
      typeof container[key] !== "object"
    ) {
      container[key] = nextIsIndex ? [] : {};
    }
    node = container[key] as Record<string, unknown> | unknown[];
  }

  (node as Record<string, unknown>)[segments[segments.length - 1]] = value;
}

/**
 * Deep-clone the base messages and overlay the DB overrides. Falls back to the
 * untouched base if Supabase is unreachable (e.g. before the project is set up).
 */
export async function applyMarketingOverrides(
  locale: Locale,
  base: Messages,
): Promise<Messages> {
  let overrides: Record<string, string>;
  try {
    overrides = await loadOverrides(locale);
  } catch {
    return base; // DB not ready — use JSON as-is.
  }

  const merged = structuredClone(base);
  for (const [key, value] of Object.entries(overrides)) {
    setByPath(merged, key, value);
  }
  return merged;
}
