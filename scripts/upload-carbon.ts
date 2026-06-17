/**
 * Upload the client's CARBON (Soft Touch Carbon / "-FBK") cover, button and
 * frame photos to Supabase as `view='front'`, `finish='soft-touch-carbon'`
 * product images.
 *
 *   npm run upload:carbon
 *
 * Reads every image under `scripts/carbon/` (extract the client's archive there
 * first). Files are named by article number, e.g. `E08KB111-FBK.png`.
 *
 * Most files are a product's own primary photo. A few are "universal" parts the
 * client wants shown only as extra carousel slides on a related product's page
 * (some article numbers have no page of their own). That mapping — and the two
 * the client called out by hand — is encoded in MAP below:
 *
 *   E08KB112-FBK → carousel of E08KB111   (button)
 *   E08KA212-FBK → carousel of E08KB211   (2-gang button, same part)
 *   E08TB103/108 → carousel of E08TB102   (covers)
 *   E08TB230-FBK → carousel of E08TB222   (client wrote "E08TB120", a typo)
 *
 * The five frame photos (E08B186…E08B586) all belong to the single "frame"
 * product, one per gang 1–5 (the gallery swaps them with the gang selector).
 *
 * Per-finish photos only show when that finish is selected, so the carbon batch
 * lights up the carbon swatch; other finishes keep the SVG placeholder until
 * their photos arrive.
 *
 * Idempotent: re-running deletes the existing carbon front rows for the touched
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
const carbonDir = join(__dirname, "carbon");
const IMAGE_BUCKET = "product-images";
const FINISH_ID = "soft-touch-carbon";

const CONTENT_TYPE: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/**
 * filename (without extension) → placement.
 *   slug    — the product whose gallery the photo joins
 *   gang    — frame gang (the gallery filters frame photos by gang)
 *   primary — becomes the product's primary/catalogue thumbnail
 *   sort    — order within the gallery (lower first)
 */
type Placement = { slug: string; gang?: number; primary: boolean; sort: number };

const MAP: Record<string, Placement> = {
  // --- Buttons / covers: each its own primary photo ----------------------
  "E08KB111-FBK": { slug: "e08kb111", primary: true, sort: 0 },
  "E08KB113-FBK": { slug: "e08kb113", primary: true, sort: 0 },
  "E08KB211-FBK": { slug: "e08kb211", primary: true, sort: 0 },
  "E08KB213-FBK": { slug: "e08kb213", primary: true, sort: 0 },
  "E08KB311-FBK": { slug: "e08kb311", primary: true, sort: 0 },
  "E08KB215-FBK": { slug: "e08kb215", primary: true, sort: 0 },
  "E08ZB103-FBK": { slug: "e08zb103", primary: true, sort: 0 },
  "E08ZB203-FBK": { slug: "e08zb203", primary: true, sort: 0 },
  "E08TB227-FBK": { slug: "e08tb227", primary: true, sort: 0 },
  "E08TB102-FBK": { slug: "e08tb102", primary: true, sort: 0 },
  "E08TB222-FBK": { slug: "e08tb222", primary: true, sort: 0 },
  "E08TB236-FBK": { slug: "e08tb236", primary: true, sort: 0 },
  "E08BB101-FBK": { slug: "e08bb101", primary: true, sort: 0 },
  "E08BB102-FBK": { slug: "e08bb102", primary: true, sort: 0 },
  "E08DB102-FBK": { slug: "e08db102", primary: true, sort: 0 },
  "E08DB104-FBK": { slug: "e08db104", primary: true, sort: 0 },

  // --- Frame: one photo per gang on the single "frame" product -----------
  "E08B186-FBK": { slug: "frame", gang: 1, primary: true, sort: 1 },
  "E08B286-FBK": { slug: "frame", gang: 2, primary: false, sort: 2 },
  "E08B386-FBK": { slug: "frame", gang: 3, primary: false, sort: 3 },
  "E08B486-FBK": { slug: "frame", gang: 4, primary: false, sort: 4 },
  "E08B586-FBK": { slug: "frame", gang: 5, primary: false, sort: 5 },

  // --- Universal extras: carousel-only slides on a related product -------
  "E08KB112-FBK": { slug: "e08kb111", primary: false, sort: 1 },
  "E08KA212-FBK": { slug: "e08kb211", primary: false, sort: 1 },
  "E08TB103-FBK": { slug: "e08tb102", primary: false, sort: 1 },
  "E08TB108-FBK": { slug: "e08tb102", primary: false, sort: 2 },
  "E08TB230-FBK": { slug: "e08tb222", primary: false, sort: 1 },
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

async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const sb = createAdminClient();

  let files: string[];
  try {
    files = walkImages(carbonDir);
  } catch {
    throw new Error(`No images found. Extract the carbon archive into ${carbonDir} first.`);
  }
  if (!files.length) throw new Error(`No image files under ${carbonDir}.`);

  // slug → product id
  const { data: prodRows, error: prodErr } = await sb
    .from("products")
    .select("id, slug");
  if (prodErr) throw new Error(`load products: ${prodErr.message}`);
  const idBySlug = new Map((prodRows ?? []).map((r) => [r.slug, r.id as string]));

  // Resolve every file first; skip (don't fail) anything not in MAP / missing
  // a product, so a partial batch still uploads what it can.
  type Job = {
    file: string;
    base: string;
    ext: string;
    productId: string;
    place: Placement;
  };
  const jobs: Job[] = [];
  const skipped: string[] = [];
  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const base = basename(file, ext);
    const place = MAP[base.toUpperCase()];
    if (!place) {
      skipped.push(`${base} (not in MAP)`);
      continue;
    }
    const productId = idBySlug.get(place.slug);
    if (!productId) {
      skipped.push(`${base} (no product for slug "${place.slug}")`);
      continue;
    }
    jobs.push({ file, base, ext, productId, place });
  }

  // Idempotency: clear existing carbon front rows for the touched products,
  // then re-insert. Leaves diagrams and other finishes untouched.
  const touchedIds = [...new Set(jobs.map((j) => j.productId))];
  if (touchedIds.length) {
    const { error } = await sb
      .from("product_images")
      .delete()
      .in("product_id", touchedIds)
      .eq("view", "front")
      .eq("finish_id", FINISH_ID);
    if (error) throw new Error(`clear old carbon photos: ${error.message}`);
  }

  let uploaded = 0;
  for (const job of jobs) {
    const path = `${job.productId}/front-${job.base}${job.ext}`;
    const body = readFileSync(job.file);

    const { error: upErr } = await sb.storage
      .from(IMAGE_BUCKET)
      .upload(path, body, { contentType: CONTENT_TYPE[job.ext], upsert: true });
    if (upErr) throw new Error(`upload ${job.base}: ${upErr.message}`);

    const { error: rowErr } = await sb.from("product_images").insert({
      product_id: job.productId,
      storage_path: path,
      view: "front",
      finish_id: FINISH_ID,
      gang: job.place.gang ?? null,
      is_primary: job.place.primary,
      sort_order: job.place.sort,
    });
    if (rowErr) throw new Error(`row ${job.base}: ${rowErr.message}`);

    uploaded++;
    const tags = [
      job.place.gang ? `gang ${job.place.gang}` : null,
      job.place.primary ? "primary" : `carousel #${job.place.sort}`,
    ]
      .filter(Boolean)
      .join(", ");
    console.log(`✓ ${job.base} → ${job.place.slug} (${tags})`);
  }

  console.log(`\nUploaded ${uploaded} carbon photo(s).`);
  if (skipped.length) {
    console.log(`Skipped ${skipped.length}:`);
    for (const s of skipped) console.log(`  • ${s}`);
  }
}

main().catch((err) => {
  console.error("\nUpload failed:", err.message ?? err);
  process.exit(1);
});
