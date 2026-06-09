/**
 * One-off: apply SK/CZ product name/description translations to Supabase.
 *
 *   npx tsx scripts/apply-translations.ts
 *
 * Merges only the `sk`/`cs` keys into each product's existing `name`/
 * `description` JSONB (live `en` is preserved), matched by slug. Idempotent.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { products } from "../src/data/catalog";

type Loc = { sk: string; en: string; cs: string };

async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const sb = createAdminClient();

  const { data: existing, error } = await sb
    .from("products")
    .select("slug, name, description");
  if (error) throw new Error(`fetch products: ${error.message}`);

  const bySlug = new Map(
    (existing ?? []).map((r) => [
      r.slug as string,
      { name: r.name as Loc, description: r.description as Loc },
    ]),
  );

  let updated = 0;
  const missing: string[] = [];
  for (const p of products) {
    const cur = bySlug.get(p.slug);
    if (!cur) {
      missing.push(p.slug);
      continue;
    }
    const name = { ...cur.name, sk: p.name.sk, cs: p.name.cs };
    const description = {
      ...cur.description,
      sk: p.description.sk,
      cs: p.description.cs,
    };
    const { error: upErr } = await sb
      .from("products")
      .update({ name, description })
      .eq("slug", p.slug);
    if (upErr) throw new Error(`update ${p.slug}: ${upErr.message}`);
    updated++;
  }

  console.log(`✓ updated ${updated}/${products.length} products`);
  if (missing.length) {
    console.warn(
      `⚠ ${missing.length} catalog slug(s) not found in DB (run seed first?): ` +
        missing.join(", "),
    );
  }
}

main().catch((err) => {
  console.error("\nFailed:", err.message ?? err);
  process.exit(1);
});
