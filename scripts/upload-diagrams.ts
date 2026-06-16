/**
 * Upload the client's line-diagram images to Supabase as `view='diagram'`
 * product images.
 *
 *   npm run upload:diagrams
 *
 * Reads every image under `scripts/diagrams/` (extract the client's archive
 * there first — see the plan / README). Each file is named by article number:
 *
 *   E08KA111.png            → mechanism, slug "e08ka111"
 *   E08KB111.png            → cover,     slug "e08kb111" (base code, finish-agnostic)
 *   E08B186.png … E08B586   → the single "frame" product, one diagram per gang 1–5
 *
 * Idempotent: re-running deletes the existing diagram rows for the touched
 * products and re-uploads to deterministic storage paths (upsert), so it never
 * accumulates duplicates. Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *
 * Note: the public catalog is cached under the `"catalog"` tag; a script can't
 * call revalidateTag from outside a request. After running, trigger a catalog
 * revalidation (re-save any product in the admin panel, or redeploy) so the
 * change goes live. A fresh `next dev` process also picks it up immediately.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, basename } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const diagramsDir = join(__dirname, "diagrams");
const IMAGE_BUCKET = "product-images";

const CONTENT_TYPE: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/** Recursively collect every image file under a directory. */
function walkImages(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkImages(full));
    } else if (extname(entry).toLowerCase() in CONTENT_TYPE) {
      out.push(full);
    }
  }
  return out;
}

/** Map an article-number filename to its product slug and (frame-only) gang. */
function resolve(base: string): { slug: string; gang: number | null } {
  const frame = base.match(/^E08B([1-5])86$/i);
  if (frame) return { slug: "frame", gang: Number(frame[1]) };
  return { slug: base.toLowerCase(), gang: null };
}

async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const sb = createAdminClient();

  let files: string[];
  try {
    files = walkImages(diagramsDir);
  } catch {
    throw new Error(
      `No images found. Extract the diagram archive into ${diagramsDir} first.`,
    );
  }
  if (!files.length) {
    throw new Error(`No image files under ${diagramsDir}.`);
  }

  // slug → product id
  const { data: prodRows, error: prodErr } = await sb
    .from("products")
    .select("id, slug");
  if (prodErr) throw new Error(`load products: ${prodErr.message}`);
  const idBySlug = new Map((prodRows ?? []).map((r) => [r.slug, r.id as string]));

  // Resolve every file first; skip (don't fail) anything without a product.
  type Job = { file: string; base: string; ext: string; productId: string; gang: number | null };
  const jobs: Job[] = [];
  const skipped: string[] = [];
  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const base = basename(file, ext);
    const { slug, gang } = resolve(base);
    const productId = idBySlug.get(slug);
    if (!productId) {
      skipped.push(`${base} (no product for slug "${slug}")`);
      continue;
    }
    jobs.push({ file, base, ext, productId, gang });
  }

  // Idempotency: clear existing diagram rows for the products we're about to
  // (re)populate, then re-insert. Storage uses deterministic paths + upsert.
  const touchedIds = [...new Set(jobs.map((j) => j.productId))];
  if (touchedIds.length) {
    const { error } = await sb
      .from("product_images")
      .delete()
      .in("product_id", touchedIds)
      .eq("view", "diagram");
    if (error) throw new Error(`clear old diagrams: ${error.message}`);
  }

  let uploaded = 0;
  for (const job of jobs) {
    const path = `${job.productId}/diagram-${job.base}${job.ext}`;
    const body = readFileSync(job.file);

    const { error: upErr } = await sb.storage
      .from(IMAGE_BUCKET)
      .upload(path, body, {
        contentType: CONTENT_TYPE[job.ext],
        upsert: true,
      });
    if (upErr) throw new Error(`upload ${job.base}: ${upErr.message}`);

    const { error: rowErr } = await sb.from("product_images").insert({
      product_id: job.productId,
      storage_path: path,
      view: "diagram",
      finish_id: null,
      gang: job.gang,
      is_primary: false,
      sort_order: job.gang ?? 0,
    });
    if (rowErr) throw new Error(`row ${job.base}: ${rowErr.message}`);

    uploaded++;
    console.log(`✓ ${job.base} → ${job.productId}${job.gang ? ` (gang ${job.gang})` : ""}`);
  }

  console.log(`\nUploaded ${uploaded} diagram(s).`);
  if (skipped.length) {
    console.log(`Skipped ${skipped.length}:`);
    for (const s of skipped) console.log(`  • ${s}`);
  }
}

main().catch((err) => {
  console.error("\nUpload failed:", err.message ?? err);
  process.exit(1);
});
