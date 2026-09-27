import type { MetadataRoute } from "next";
import { isPublicOrigin, siteUrl } from "@/lib/site";

/**
 * robots.txt.
 *
 * Until `NEXT_PUBLIC_SITE_URL` names a real domain we are running on a Vercel
 * preview host, and the whole point of a preview is that it must not be
 * indexed — an indexed preview competes with the real site for its own brand
 * terms. So the origin gates the rules: block everything until launch, then
 * open up automatically.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isPublicOrigin) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin", // login + CMS, never indexable
        "/api/", // revalidation hook
      ],
      // `/*/basket` is deliberately NOT disallowed. It has no search value, but
      // the way to keep a URL out of the index is `noindex` (which the page
      // sets), and a crawler that is disallowed from fetching the page never
      // reads that tag — leaving Google free to index the bare URL from any
      // link to it. Blocking and noindexing the same URL is the one
      // combination that cannot work; the page's own tag is the real control.
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
