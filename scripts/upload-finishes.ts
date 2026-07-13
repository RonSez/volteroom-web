/**
 * Upload the client's "5 colour options" photo set to Supabase as `view='front'`
 * product images, one finish per source sub-folder.
 *
 *   npm run upload:finishes                 # default source path below
 *   npx tsx scripts/upload-finishes.ts "D:\\path\\to\\5 color options"
 *
 * The client delivered one folder per finish, each holding the cover/button,
 * frame and a few "universal" part photos named by article number. Crucially
 * this set numbers the parts WITHOUT the internal cover letter the catalog uses
 * (file `E08K111` == catalog cover `e08kb111`), and numbers the USB cover 229
 * where the catalog slug is `e08tb227`. PLACEMENTS below maps the file article
 * (this set's scheme) → the product slug + gallery placement; it mirrors the
 * carbon batch (see upload-carbon.ts) but is finish-agnostic — every finish
 * folder reuses it, with the finish taken from the folder name.
 *
 * Folder → finish is resolved by the code in the folder name:
 *   （G1)     glossy-white       (files have no colour suffix)
 *   T105UY    soft-touch-white   (-WH)
 *   T103UY    graphite           (-GR)
 *   452UYF    soft-touch-cashmere(-FCG)
 *   3003UYF   soft-touch-carbon  (-FBK)
 *
 * Idempotent: for each finish it clears that finish's existing `front` rows on
 * the products it touches, then re-uploads to deterministic storage paths
 * (upsert). Re-running never accumulates duplicates. Requires
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
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SOURCE = join(
  __dirname,
  "..",
  "..",
  "5款颜色图片Images of 5 color options",
);
const sourceDir = process.argv[2] ?? DEFAULT_SOURCE;

const IMAGE_BUCKET = "product-images";

const CONTENT_TYPE: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/** Folder-name token → finish id. Checked as a substring of the sub-folder. */
const FINISH_BY_TOKEN: { token: string; finishId: string }[] = [
  { token: "3003UYF", finishId: "soft-touch-carbon" },
  { token: "452UYF", finishId: "soft-touch-cashmere" },
  { token: "T105UY", finishId: "soft-touch-white" },
  { token: "T103UY", finishId: "graphite" },
  { token: "G1)", finishId: "glossy-white" },
];

/** Colour suffixes this set appends to file names (glossy has none). */
const COLOR_SUFFIX = /-(WH|GR|FCG|FBK)$/;

/**
 * Known mislabels in the client's file names → the correct article.
 *   E08A102 — the graphite dimmer cover, shipped as A102 instead of D102
 *             (same round-knob faceplate as E08D102 in every other finish).
 */
const ARTICLE_FIXUPS: Record<string, string> = { E08A102: "E08D102" };

/**
 * file article (this set's scheme, no internal cover letter) → placement.
 *   slug    — the product whose gallery the photo joins
 *   gang    — frame gang (the gallery filters frame photos by gang)
 *   primary — becomes the product's primary/catalogue thumbnail
 *   sort    — order within the gallery (lower first)
 */
type Placement = { slug: string; gang?: number; primary: boolean; sort: number };

const PLACEMENTS: Record<string, Placement> = {
  // --- Buttons / covers: each its own primary photo ----------------------
  E08K111: { slug: "e08kb111", primary: true, sort: 0 },
  E08K113: { slug: "e08kb113", primary: true, sort: 0 },
  E08K211: { slug: "e08kb211", primary: true, sort: 0 },
  E08K213: { slug: "e08kb213", primary: true, sort: 0 },
  E08K215: { slug: "e08kb215", primary: true, sort: 0 },
  E08K311: { slug: "e08kb311", primary: true, sort: 0 },
  E08Z103: { slug: "e08zb103", primary: true, sort: 0 },
  E08Z104: { slug: "e08zb104", primary: true, sort: 0 },
  E08Z203: { slug: "e08zb203", primary: true, sort: 0 },
  E08T102: { slug: "e08tb102", primary: true, sort: 0 },
  E08T222: { slug: "e08tb222", primary: true, sort: 0 },
  E08T229: { slug: "e08tb227", primary: true, sort: 0 }, // USB cover (client numbers it 229)
  E08T236: { slug: "e08tb236", primary: true, sort: 0 },
  E08B101: { slug: "e08bb101", primary: true, sort: 0 },
  E08B102: { slug: "e08bb102", primary: true, sort: 0 },
  E08D102: { slug: "e08db102", primary: true, sort: 0 },
  E08D104: { slug: "e08db104", primary: true, sort: 0 },

  // --- Frame: one photo per gang on the single "frame" product -----------
  E08B186: { slug: "frame", gang: 1, primary: true, sort: 1 },
  E08B286: { slug: "frame", gang: 2, primary: false, sort: 2 },
  E08B386: { slug: "frame", gang: 3, primary: false, sort: 3 },
  E08B486: { slug: "frame", gang: 4, primary: false, sort: 4 },
  E08B586: { slug: "frame", gang: 5, primary: false, sort: 5 },

  // --- Universal extras: carousel-only slides on a related product -------
  E08K112: { slug: "e08kb111", primary: false, sort: 1 },
  E08K212: { slug: "e08kb211", primary: false, sort: 1 },
  E08T103: { slug: "e08tb102", primary: false, sort: 1 },
  E08T108: { slug: "e08tb102", primary: false, sort: 2 },
  E08T230: { slug: "e08tb222", primary: false, sort: 1 },
};

/** Finish for a sub-folder, from the code embedded in its name. */
function finishOfFolder(name: string): string | undefined {
  return FINISH_BY_TOKEN.find((f) => name.includes(f.token))?.finishId;
}

/** Normalise a file name to its catalog-ish article (drop spaces + colour suffix). */
function articleOf(fileName: string): string {
  const art = basename(fileName, extname(fileName))
    .replace(/\s+/g, "")
    .toUpperCase()
    .replace(COLOR_SUFFIX, "");
  return ARTICLE_FIXUPS[art] ?? art;
}

async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const sb = createAdminClient();

  let folders: string[];
  try {
    folders = readdirSync(sourceDir).filter((e) =>
      statSync(join(sourceDir, e)).isDirectory(),
    );
  } catch {
    throw new Error(`Cannot read source folder: ${sourceDir}`);
  }

  // slug → product id
  const { data: prodRows, error: prodErr } = await sb
    .from("products")
    .select("id, slug");
  if (prodErr) throw new Error(`load products: ${prodErr.message}`);
  const idBySlug = new Map((prodRows ?? []).map((r) => [r.slug, r.id as string]));

  type Job = {
    file: string;
    article: string;
    ext: string;
    finishId: string;
    productId: string;
    place: Placement;
    dup: number; // 0 = first file for this (finish, article); >0 = extra angle
  };

  const jobs: Job[] = [];
  const skipped: string[] = [];
  const seen = new Map<string, number>(); // finish|article → count
  // Byte-identical photos within one product+finish (the client ships the same
  // faceplate photo for the 1-way/2-way/intermediate variants) would show as a
  // repeated carousel slide, so a hash-collision within a group is dropped.
  const hashesByGroup = new Map<string, Set<string>>();

  // Sort primaries (sort 0) ahead of their carousel extras so the extra is the
  // one dropped on a content collision, never the primary.
  for (const folder of folders) {
    const finishId = finishOfFolder(folder);
    if (!finishId) {
      skipped.push(`folder "${folder}" (no finish token)`);
      continue;
    }
    const dir = join(sourceDir, folder);
    const entries = readdirSync(dir)
      .filter((e) => extname(e).toLowerCase() in CONTENT_TYPE)
      .sort((a, b) => (PLACEMENTS[articleOf(a)]?.sort ?? 0) - (PLACEMENTS[articleOf(b)]?.sort ?? 0) || a.localeCompare(b));
    for (const entry of entries) {
      const ext = extname(entry).toLowerCase();
      const article = articleOf(entry);
      const place = PLACEMENTS[article];
      if (!place) {
        skipped.push(`${folder}/${entry} (article ${article} not mapped)`);
        continue;
      }
      const productId = idBySlug.get(place.slug);
      if (!productId) {
        skipped.push(`${folder}/${entry} (no product for slug "${place.slug}")`);
        continue;
      }
      const groupKey = `${finishId}|${productId}`;
      const hash = createHash("md5").update(readFileSync(join(dir, entry))).digest("hex");
      const groupHashes = hashesByGroup.get(groupKey) ?? new Set<string>();
      if (groupHashes.has(hash)) {
        skipped.push(`${folder}/${entry} (identical to another photo on ${place.slug})`);
        continue;
      }
      groupHashes.add(hash);
      hashesByGroup.set(groupKey, groupHashes);
      const key = `${finishId}|${article}`;
      const dup = seen.get(key) ?? 0;
      seen.set(key, dup + 1);
      jobs.push({ file: join(dir, entry), article, ext, finishId, productId, place, dup });
    }
  }

  // Dry run: print the resolved plan and stop before any DB/storage writes.
  if (process.env.DRY) {
    console.log(`Source: ${sourceDir}\n`);
    for (const j of jobs.sort((a, b) => (a.finishId + a.article).localeCompare(b.finishId + b.article))) {
      const tag = [
        j.place.gang ? `gang ${j.place.gang}` : null,
        j.place.primary && j.dup === 0 ? "primary" : `carousel`,
        j.dup ? `angle ${j.dup + 1}` : null,
      ]
        .filter(Boolean)
        .join(", ");
      console.log(`  ${j.finishId.padEnd(20)} ${j.article.padEnd(9)} → ${j.place.slug.padEnd(9)} (${tag})`);
    }
    console.log(`\n${jobs.length} to upload.`);
    if (skipped.length) {
      console.log(`Skipped ${skipped.length}:`);
      for (const s of skipped) console.log(`  • ${s}`);
    }
    return;
  }

  // Idempotency: clear each touched finish's existing front rows on its
  // products before re-inserting. Done per finish so refreshing one finish
  // never disturbs another.
  const productsByFinish = new Map<string, Set<string>>();
  for (const j of jobs) {
    const set = productsByFinish.get(j.finishId) ?? new Set<string>();
    set.add(j.productId);
    productsByFinish.set(j.finishId, set);
  }
  for (const [finishId, ids] of productsByFinish) {
    const { error } = await sb
      .from("product_images")
      .delete()
      .in("product_id", [...ids])
      .eq("view", "front")
      .eq("finish_id", finishId);
    if (error) throw new Error(`clear ${finishId} photos: ${error.message}`);
  }

  let uploaded = 0;
  for (const job of jobs) {
    // Only the default-finish photo becomes the product's primary/catalogue
    // thumbnail, so the default (no finish selected) card shows that finish.
    // Keep this in sync with DEFAULT_FINISH_ID in src/data/catalog.ts. Other
    // finishes' photos are non-primary and surface only when that finish is
    // selected. A duplicate file for the same finish+article (e.g. a second
    // angle) is also demoted so it never fights the primary.
    const primary =
      job.place.primary && job.dup === 0 && job.finishId === "soft-touch-cashmere";
    const sort = job.dup === 0 ? job.place.sort : 90 + job.dup;
    const suffix = job.dup === 0 ? "" : `-${job.dup + 1}`;
    const path = `${job.productId}/front-${job.finishId}-${job.article}${suffix}${job.ext}`;
    const body = readFileSync(job.file);

    const { error: upErr } = await sb.storage
      .from(IMAGE_BUCKET)
      .upload(path, body, { contentType: CONTENT_TYPE[job.ext], upsert: true });
    if (upErr) throw new Error(`upload ${job.article} (${job.finishId}): ${upErr.message}`);

    const { error: rowErr } = await sb.from("product_images").insert({
      product_id: job.productId,
      storage_path: path,
      view: "front",
      finish_id: job.finishId,
      gang: job.place.gang ?? null,
      is_primary: primary,
      sort_order: sort,
    });
    if (rowErr) throw new Error(`row ${job.article} (${job.finishId}): ${rowErr.message}`);

    uploaded++;
  }

  // Summary per finish.
  const byFinish = new Map<string, number>();
  for (const j of jobs) byFinish.set(j.finishId, (byFinish.get(j.finishId) ?? 0) + 1);
  console.log(`\nUploaded ${uploaded} photo(s):`);
  for (const [f, n] of byFinish) console.log(`  • ${f}: ${n}`);
  if (skipped.length) {
    console.log(`\nSkipped ${skipped.length}:`);
    for (const s of skipped) console.log(`  • ${s}`);
  }

  if (uploaded) await revalidate();
}

main().catch((err) => {
  console.error("\nUpload failed:", err.message ?? err);
  process.exit(1);
});
