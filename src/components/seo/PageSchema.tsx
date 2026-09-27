import { JsonLd } from "./JsonLd";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

/**
 * The structured-data block for a simple content page: a typed WebPage node
 * plus the two-level breadcrumb back to the locale root.
 *
 * The catalogue pages build their own richer graphs (Product, CollectionPage)
 * inline; this exists so the flat pages — about, contact, certificates,
 * partnership — don't each repeat the same six lines. The breadcrumb name is
 * the page's own H1, which is what Google renders in the SERP crumb trail, so
 * it must be the visible heading rather than the (longer) meta title.
 */
export function PageSchema({
  locale,
  path,
  name,
  description,
  type = "WebPage",
}: {
  locale: Locale;
  path: string;
  /** The page's visible heading — also the breadcrumb leaf. */
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "ContactPage";
}) {
  return (
    <JsonLd
      data={[
        webPageJsonLd(locale, { type, name, description, path }),
        // Root crumb is the brand, matching the catalogue's own trails in
        // CategoryView/ProductView — one convention across the whole site.
        breadcrumbJsonLd(locale, [
          { name: siteConfig.name, path: "/" },
          { name, path },
        ]),
      ]}
    />
  );
}
