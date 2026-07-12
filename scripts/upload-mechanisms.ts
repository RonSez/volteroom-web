/**
 * Upload the client's mechanism (functional-part) photos to Supabase as the
 * `view='front'` and `view='back'` product images for the 29 mechanism products.
 *
 *   npm run upload:mechanisms
 *   npx tsx scripts/upload-mechanisms.ts "D:\\front" "D:\\reverse"   # custom paths
 *   DRY=1 npm run upload:mechanisms                                  # print plan only
 *
 * The client delivered two archives — a front view ("正面图") and a reverse view
 * ("功能件") — each holding one PNG per mechanism, named by the exact SKU:
 *
 *   E08KA111.png  → mechanism, slug "e08ka111"   (front → primary thumbnail)
 *   F08ZA103.png  → mechanism, slug "f08za103"   (back  → second gallery slide)
 *
 * Unlike the cover set (see upload-finishes.ts), the file names ARE the catalog
 * SKUs, so the mapping is a plain lower-case — no PLACEMENTS table. Mechanisms
 * are finish-agnostic, so `finish_id` is null (like the line diagrams).
 *
 * Extract the two archives into `scripts/mechanism-photos/front/` and
 * `scripts/mechanism-photos/reverse/` first (both gitignored), or pass the two
 * folder paths as CLI args. Sub-folders are walked recursively.
 *
 * Idempotent: re-running deletes the existing front/back rows for the touched
 * products (diagram rows are left untouched) and re-uploads to deterministic
 * storage paths (upsert), so it never accumulates duplicates. Requires
 * SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *
 * Note: the public catalog is cached under the `"catalog"` tag. When it
 * finishes this script pings the deployed `/api/revalidate` route to push the
 * change live — set REVALIDATE_URL + REVALIDATE_SECRET in .env.local (see
 * scripts/revalidate.ts). Without them it warns; re-save any product in the
 * admin panel to push it live. A redeploy does NOT suffice — Vercel's Data
 * Cache survives deployments, so the stale snapshot would linger.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { revalidate } from "./revalidate";

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, basename } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const photosDir = join(__dirname, "mechanism-photos");
const frontDir = process.argv[2] ?? join(photosDir, "front");
const reverseDir = process.argv[3] ?? join(photosDir, "reverse");

const IMAGE_BUCKET = "product-images";

const CONTENT_TYPE: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/** Each source folder maps to a gallery view, sort order and primary flag. */
type ViewSpec = { dir: string; view: "front" | "back"; sort: number; primary: boolean };
const VIEWS: ViewSpec[] = [
  { dir: frontDir, view: "front", sort: 0, primary: true },
  { dir: reverseDir, view: "back", sort: 1, primary: false },
];

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

async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const sb = createAdminClient();

  // slug → product id (mechanisms only, so a stray cover/frame file is skipped).
  const { data: prodRows, error: prodErr } = await sb
    .from("products")
    .select("id, slug, kind");
  if (prodErr) throw new Error(`load products: ${prodErr.message}`);
  const mechIdBySlug = new Map(
    (prodRows ?? [])
      .filter((r) => r.kind === "mechanism")
      .map((r) => [r.slug, r.id as string]),
  );

  type Job = {
    file: string;
    base: string;
    ext: string;
    productId: string;
    view: "front" | "back";
    sort: number;
    primary: boolean;
  };
  const jobs: Job[] = [];
  const skipped: string[] = [];

  for (const { dir, view, sort, primary } of VIEWS) {
    let files: string[];
    try {
      files = walkImages(dir);
    } catch {
      throw new Error(
        `Cannot read ${view} folder: ${dir}. Extract the ${view} archive there first.`,
      );
    }
    for (const file of files) {
      const ext = extname(file).toLowerCase();
      const base = basename(file, ext).replace(/\s+/g, "").toUpperCase();
      const slug = base.toLowerCase();
      const productId = mechIdBySlug.get(slug);
      if (!productId) {
        skipped.push(`${view}/${base} (no mechanism for slug "${slug}")`);
        continue;
      }
      jobs.push({ file, base, ext, productId, view, sort, primary });
    }
  }

  // Dry run: print the resolved plan and stop before any DB/storage writes.
  if (process.env.DRY) {
    console.log(`Front:   ${frontDir}\nReverse: ${reverseDir}\n`);
    for (const j of [...jobs].sort((a, b) => a.base.localeCompare(b.base) || a.view.localeCompare(b.view))) {
      console.log(
        `  ${j.base.padEnd(9)} → ${j.view.padEnd(5)} ${j.primary ? "(primary thumbnail)" : "(gallery slide)"}`,
      );
    }
    console.log(`\n${jobs.length} to upload across ${new Set(jobs.map((j) => j.productId)).size} mechanism(s).`);
    if (skipped.length) {
      console.log(`Skipped ${skipped.length}:`);
      for (const s of skipped) console.log(`  • ${s}`);
    }
    return;
  }

  // Idempotency: clear existing front/back rows for the touched products, then
  // re-insert. Diagram rows are left in place (different `view`).
  const touchedIds = [...new Set(jobs.map((j) => j.productId))];
  if (touchedIds.length) {
    const { error } = await sb
      .from("product_images")
      .delete()
      .in("product_id", touchedIds)
      .in("view", ["front", "back"]);
    if (error) throw new Error(`clear old photos: ${error.message}`);
  }

  let uploaded = 0;
  for (const job of jobs) {
    const path = `${job.productId}/${job.view}-${job.base}${job.ext}`;
    const body = readFileSync(job.file);

    const { error: upErr } = await sb.storage
      .from(IMAGE_BUCKET)
      .upload(path, body, { contentType: CONTENT_TYPE[job.ext], upsert: true });
    if (upErr) throw new Error(`upload ${job.base} (${job.view}): ${upErr.message}`);

    const { error: rowErr } = await sb.from("product_images").insert({
      product_id: job.productId,
      storage_path: path,
      view: job.view,
      finish_id: null,
      gang: null,
      is_primary: job.primary,
      sort_order: job.sort,
    });
    if (rowErr) throw new Error(`row ${job.base} (${job.view}): ${rowErr.message}`);

    uploaded++;
    console.log(`✓ ${job.base} → ${job.view}`);
  }

  const fronts = jobs.filter((j) => j.view === "front").length;
  const backs = jobs.filter((j) => j.view === "back").length;
  console.log(`\nUploaded ${uploaded} photo(s): ${fronts} front, ${backs} back.`);
  if (skipped.length) {
    console.log(`Skipped ${skipped.length}:`);
    for (const s of skipped) console.log(`  • ${s}`);
  }

  if (uploaded) await revalidate();
}

main().catch((err) => {
  console.error("\nUpload failed:", err.message ?? err);
  process.exit(1);
});
