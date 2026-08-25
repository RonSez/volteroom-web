/**
 * Push selected marketing copy keys from the message JSON files into the
 * `marketing_copy` table, which OVERRIDES those JSON files at runtime.
 *
 *   tsx scripts/sync-copy.ts <dotted.key> [<dotted.key> ...]
 *
 * Only the named keys are touched — unlike `npm run seed`, which re-upserts
 * the entire table (and the whole catalog) from the repo and would clobber
 * anything edited in the admin panel since the last seed.
 *
 * The previous values are written to scripts/backups/ before the write, so a
 * bad copy change can be reverted.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { locales } from "../src/i18n/routing";
import { revalidate } from "./revalidate";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/** Read a dotted key out of a nested messages object (numeric = array index). */
function getByPath(source: unknown, path: string): string | undefined {
  let node: unknown = source;
  for (const segment of path.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === "string" ? node : undefined;
}

async function main() {
  const keys = process.argv.slice(2);
  if (!keys.length) throw new Error("Pass at least one dotted message key.");

  // Dynamic imports: both modules validate Supabase env vars on load, which
  // must happen after dotenv has run (static imports are hoisted above it).
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const { MARKETING_TAG } = await import("../src/lib/marketing");
  const sb = createAdminClient();

  const rows: { key: string; locale: string; value: string }[] = [];
  for (const locale of locales) {
    const messages = JSON.parse(
      readFileSync(join(root, "src", "messages", `${locale}.json`), "utf8"),
    );
    for (const key of keys) {
      const value = getByPath(messages, key);
      if (value === undefined) {
        throw new Error(`${key} is missing from ${locale}.json`);
      }
      rows.push({ key, locale, value });
    }
  }

  // Snapshot what's live before overwriting it.
  const { data: before, error: readErr } = await sb
    .from("marketing_copy")
    .select("key, locale, value")
    .in("key", keys);
  if (readErr) throw new Error(`read current rows: ${readErr.message}`);

  // Timestamped so a later run never clobbers an earlier snapshot.
  mkdirSync(join(root, "scripts", "backups"), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = join(root, "scripts", "backups", `marketing-copy-${stamp}.json`);
  writeFileSync(backup, JSON.stringify(before, null, 2) + "\n", "utf8");
  console.log(`✓ backed up ${before?.length ?? 0} existing rows → ${backup}`);

  for (const row of before ?? []) {
    const next = rows.find((r) => r.key === row.key && r.locale === row.locale);
    if (next && next.value !== row.value) {
      console.log(`\n  ${row.key} [${row.locale}]`);
      console.log(`    - ${row.value}`);
      console.log(`    + ${next.value}`);
    }
  }

  const { error } = await sb
    .from("marketing_copy")
    .upsert(rows, { onConflict: "key,locale" });
  if (error) throw new Error(`marketing_copy: ${error.message}`);
  console.log(`\n✓ marketing_copy: ${rows.length} rows (${keys.length} keys)`);

  await revalidate([MARKETING_TAG]);
}

main().catch((err) => {
  console.error("\nSync failed:", err.message ?? err);
  process.exit(1);
});
