/**
 * One-off safety backup before replacing product photos.
 *
 *   npx tsx scripts/backup-images.ts <stamp>
 *
 * Snapshots the entire `product_images` table to JSON and downloads the current
 * bytes of every front/finish image (the objects the finishes upload overwrites)
 * into scripts/backups/<stamp>/. This is the rollback source: restore the rows
 * from product_images.json and re-upload the objects to their storage_path.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUCKET = "product-images";
const FINISHES = new Set([
  "glossy-white",
  "soft-touch-white",
  "graphite",
  "soft-touch-cashmere",
  "soft-touch-carbon",
]);

async function main() {
  const stamp = process.argv[2] ?? "backup";
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const sb = createAdminClient();

  const outDir = join(__dirname, "backups", stamp);
  mkdirSync(join(outDir, "objects"), { recursive: true });

  const { data: rows, error } = await sb.from("product_images").select("*");
  if (error) throw new Error(`select product_images: ${error.message}`);
  writeFileSync(join(outDir, "product_images.json"), JSON.stringify(rows, null, 2));
  console.log(`Saved ${rows!.length} product_images rows.`);

  // Back up every object the upload scripts can overwrite: all front + back
  // rows (finish photos AND finish-agnostic mechanism front/back). FINISHES is
  // kept for reference but no longer narrows the set.
  void FINISHES;
  const targets = rows!.filter((r: any) => r.view === "front" || r.view === "back");
  let n = 0;
  const failed: string[] = [];
  for (const r of targets) {
    const { data, error: dErr } = await sb.storage
      .from(BUCKET)
      .download((r as any).storage_path);
    if (dErr || !data) {
      failed.push(`${(r as any).storage_path}: ${dErr?.message ?? "no data"}`);
      continue;
    }
    const buf = Buffer.from(await data.arrayBuffer());
    const dest = join(outDir, "objects", (r as any).storage_path);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    n++;
  }
  console.log(`Downloaded ${n}/${targets.length} front-finish objects to ${outDir}/objects`);
  if (failed.length) {
    console.log(`Failed ${failed.length}:`);
    for (const f of failed) console.log(`  • ${f}`);
  }
}

main().catch((err) => {
  console.error("\nBackup failed:", err.message ?? err);
  process.exit(1);
});
