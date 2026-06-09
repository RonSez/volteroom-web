/**
 * Seed Supabase from the placeholder content in the repo.
 *
 *   npm run seed
 *
 * Idempotent: re-running upserts the same rows. Loads .env.local first, then
 * dynamically imports the service-role client (which validates env on import).
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { finishes, categories, products } from "../src/data/catalog";
import { locales } from "../src/i18n/routing";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/** Flatten a nested messages object into dotted keys (arrays → numeric segments). */
function flatten(
  value: unknown,
  prefix = "",
  out: Record<string, string> = {},
): Record<string, string> {
  if (value === null || value === undefined) return out;
  if (typeof value === "string") {
    out[prefix] = value;
    return out;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    out[prefix] = String(value);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) =>
      flatten(item, prefix ? `${prefix}.${i}` : String(i), out),
    );
    return out;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
}

async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const sb = createAdminClient();

  // --- Finishes -------------------------------------------------------------
  const finishRows = finishes.map((f, i) => ({
    id: f.id,
    name: f.name,
    code: f.code,
    hex: f.hex,
    light: f.light ?? false,
    sort_order: i,
  }));
  {
    const { error } = await sb.from("finishes").upsert(finishRows, { onConflict: "id" });
    if (error) throw new Error(`finishes: ${error.message}`);
    console.log(`✓ finishes: ${finishRows.length}`);
  }

  // --- Categories -----------------------------------------------------------
  const categoryRows = categories.map((c, i) => ({
    id: c.id,
    name: c.name,
    tagline: c.tagline,
    sort_order: i,
  }));
  {
    const { error } = await sb.from("categories").upsert(categoryRows, { onConflict: "id" });
    if (error) throw new Error(`categories: ${error.message}`);
    console.log(`✓ categories: ${categoryRows.length}`);
  }

  // --- Products (upsert by slug, then sync explicit finish subsets) ----------
  const productRows = products.map((p, i) => ({
    slug: p.slug,
    category_id: p.category,
    kind: p.kind,
    component_type: p.specs?.componentType ?? null,
    name: p.name,
    description: p.description,
    base_price: p.basePrice,
    sku: p.sku ?? null,
    variant_skus: p.variantSkus ?? {},
    specs: p.specs ?? {},
    gangs: p.gangs ?? null,
    featured: p.featured ?? false,
    sort_order: i,
  }));
  const { data: upserted, error: prodErr } = await sb
    .from("products")
    .upsert(productRows, { onConflict: "slug" })
    .select("id, slug");
  if (prodErr) throw new Error(`products: ${prodErr.message}`);
  console.log(`✓ products: ${upserted?.length ?? 0}`);

  const idBySlug = new Map((upserted ?? []).map((r) => [r.slug, r.id as string]));

  // Prune rows that are no longer in the catalog (e.g. old placeholder data).
  // Order matters: products (FK→categories) before categories before finishes.
  const quote = (xs: string[]) => `(${xs.map((x) => `"${x}"`).join(",")})`;
  {
    const slugs = products.map((p) => p.slug);
    const { error } = await sb.from("products").delete().not("slug", "in", quote(slugs));
    if (error) throw new Error(`prune products: ${error.message}`);
  }
  {
    const ids = categories.map((c) => c.id);
    const { error } = await sb.from("categories").delete().not("id", "in", quote(ids));
    if (error) throw new Error(`prune categories: ${error.message}`);
  }
  {
    const ids = finishes.map((f) => f.id);
    const { error } = await sb.from("finishes").delete().not("id", "in", quote(ids));
    if (error) throw new Error(`prune finishes: ${error.message}`);
  }

  // product_finishes: a product with no explicit `finishes` means "all finishes",
  // represented by NO rows. Clear then re-insert the explicit subsets.
  const explicitProductIds = products
    .filter((p) => p.finishes)
    .map((p) => idBySlug.get(p.slug))
    .filter((id): id is string => Boolean(id));
  if (explicitProductIds.length) {
    await sb.from("product_finishes").delete().in("product_id", explicitProductIds);
  }
  const pfRows = products.flatMap((p) => {
    if (!p.finishes) return [];
    const pid = idBySlug.get(p.slug);
    if (!pid) return [];
    return p.finishes.map((finishId) => ({ product_id: pid, finish_id: finishId }));
  });
  if (pfRows.length) {
    const { error } = await sb
      .from("product_finishes")
      .upsert(pfRows, { onConflict: "product_id,finish_id" });
    if (error) throw new Error(`product_finishes: ${error.message}`);
  }
  console.log(`✓ product_finishes: ${pfRows.length}`);

  // --- Marketing copy (one row per dotted key × locale) ---------------------
  const copyRows: { key: string; locale: string; value: string }[] = [];
  for (const locale of locales) {
    const json = JSON.parse(
      readFileSync(join(root, "src", "messages", `${locale}.json`), "utf8"),
    );
    const flat = flatten(json);
    for (const [key, value] of Object.entries(flat)) {
      copyRows.push({ key, locale, value });
    }
  }
  {
    const { error } = await sb
      .from("marketing_copy")
      .upsert(copyRows, { onConflict: "key,locale" });
    if (error) throw new Error(`marketing_copy: ${error.message}`);
    console.log(`✓ marketing_copy: ${copyRows.length} (${locales.length} locales)`);
  }

  console.log("\nSeed complete.");
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message ?? err);
  process.exit(1);
});
