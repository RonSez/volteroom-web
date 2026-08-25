/**
 * Merge the hand-maintained mechanism specs (scripts/mechanism-specs.json)
 * into the `specs` JSONB of the matching products in Supabase.
 *
 *   npx tsx scripts/sync-specs.ts [--dry]
 *
 * Only the keys present in that file are touched — every other spec value on
 * the row is preserved, so anything edited in the admin panel survives. Unlike
 * `npm run seed`, which re-upserts every product column from the repo.
 *
 * The current specs of the affected rows are written to scripts/backups/
 * before the write.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { revalidate } from "./revalidate";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

type SpecMap = Record<string, Record<string, string>>;

async function main() {
  const dry = process.argv.includes("--dry");

  const raw: SpecMap = JSON.parse(
    readFileSync(join(__dirname, "mechanism-specs.json"), "utf8"),
  );
  // Invert { specKey: { SKU: value } } into { SKU: { specKey: value } }.
  const bySku = new Map<string, Record<string, string>>();
  for (const [specKey, values] of Object.entries(raw)) {
    if (specKey.startsWith("_") || typeof values !== "object") continue;
    for (const [sku, value] of Object.entries(values)) {
      const entry = bySku.get(sku) ?? {};
      entry[specKey] = value;
      bySku.set(sku, entry);
    }
  }
  if (!bySku.size) throw new Error("mechanism-specs.json has no values.");

  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const sb = createAdminClient();

  const { data: rows, error: readErr } = await sb
    .from("products")
    .select("id, slug, sku, kind, specs");
  if (readErr) throw new Error(`read products: ${readErr.message}`);

  mkdirSync(join(root, "scripts", "backups"), { recursive: true });
  const backup = join(root, "scripts", "backups", "product-specs-before.json");
  writeFileSync(backup, JSON.stringify(rows, null, 2) + "\n", "utf8");
  console.log(`✓ backed up ${rows?.length ?? 0} product rows → ${backup}`);

  let changed = 0;
  const unmatched = new Set(bySku.keys());

  for (const row of rows ?? []) {
    const extra = row.sku ? bySku.get(row.sku) : undefined;
    if (!extra) continue;
    unmatched.delete(row.sku!);

    const current = (row.specs ?? {}) as Record<string, string>;
    const merged = { ...current, ...extra };
    const diff = Object.entries(extra).filter(([k, v]) => current[k] !== v);
    if (!diff.length) continue;

    changed++;
    for (const [k, v] of diff) {
      console.log(`  ${row.sku} ${k}: ${current[k] ?? "—"} → ${v}`);
    }
    if (dry) continue;

    const { error } = await sb
      .from("products")
      .update({ specs: merged })
      .eq("id", row.id);
    if (error) throw new Error(`${row.sku}: ${error.message}`);
  }

  if (unmatched.size) {
    console.warn(
      `\n⚠ No product row for: ${[...unmatched].join(", ")} — check the article numbers.`,
    );
  }
  console.log(`\n${dry ? "[dry run] would update" : "✓ updated"} ${changed} products`);

  if (!dry && changed) await revalidate(["catalog"]);
}

main().catch((err) => {
  console.error("\nSync failed:", err.message ?? err);
  process.exit(1);
});
