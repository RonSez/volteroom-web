/**
 * Apply SQL migration files to the Postgres database in DATABASE_URL.
 *
 *   npx tsx scripts/db-migrate.ts                 # all files in supabase/migrations
 *   npx tsx scripts/db-migrate.ts 0002_real_catalog.sql
 *
 * Reads DATABASE_URL from .env.local (Supabase → Settings → Database → URI).
 * Migrations here are written to be idempotent, so re-running is safe.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Client } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "supabase", "migrations");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set in .env.local. Add the Supabase Postgres URI " +
        "(Settings → Database → Connection string).",
    );
  }

  const args = process.argv.slice(2);
  const files = (
    args.length
      ? args
      : readdirSync(migrationsDir)
          .filter((f) => f.endsWith(".sql"))
          .sort()
  ).map((f) => (f.endsWith(".sql") ? f : `${f}.sql`));

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), "utf8");
      process.stdout.write(`Applying ${file} … `);
      await client.query(sql);
      console.log("ok");
    }
  } finally {
    await client.end();
  }
  console.log("\nMigrations applied.");
}

main().catch((err) => {
  console.error("\nMigration failed:", err.message ?? err);
  process.exit(1);
});
