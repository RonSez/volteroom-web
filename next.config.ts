import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Makes Cloudflare bindings (env, R2, Images, etc.) available during
// `next dev`. Guarded to dev only: during `next build` its internal check
// still fires and tries to spawn wrangler, which breaks non-Cloudflare
// builders (e.g. Vercel) with an EPIPE crash.
if (process.env.NODE_ENV === "development") {
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
