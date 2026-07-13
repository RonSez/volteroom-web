import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Makes Cloudflare bindings (env, R2, Images, etc.) available during
// `next dev`. Guarded to dev only: during `next build` its internal check
// still fires and tries to spawn wrangler, which breaks non-Cloudflare
// builders (e.g. Vercel) with an EPIPE crash.
//
// Also skipped in Next's static-generation jest-worker children (which set
// JEST_WORKER_ID and re-import this config): the main dev process already
// owns wrangler, so re-initializing it in a worker crashes it with `write
// EPIPE`, surfacing as "Jest worker encountered N child process exceptions"
// and failing generateStaticParams for every route.
if (process.env.NODE_ENV === "development" && !process.env.JEST_WORKER_ID) {
  initOpenNextCloudflareForDev();
}

// Allow next/image to load product photos from the Supabase Storage host.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 defaults images.qualities to [75]; whitelist 90 so the
    // `quality={90}` props on our <Image>s aren't coerced back down to 75.
    qualities: [75, 90],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default withNextIntl(nextConfig);
