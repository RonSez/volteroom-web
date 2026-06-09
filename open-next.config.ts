import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config: no incremental cache override, since the app does not use
// ISR yet. To enable ISR later, create an R2 bucket, add the
// NEXT_INC_CACHE_R2_BUCKET binding in wrangler.jsonc, then switch to:
//
//   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
//   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
export default defineCloudflareConfig();
