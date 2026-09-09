import type { Metadata } from "next";
import { locales, routing, type Locale } from "@/i18n/routing";
import { siteConfig, siteUrl } from "./site";
import type { Category, Finish, Product } from "@/data/catalog";

/**
 * SEO primitives: canonical + hreflang generation and JSON-LD builders.
 *
 * Two things this module is careful about:
 *
 *  - **hreflang.** The site ships one page in three languages, and without an
 *    explicit alternates set Google treats sk/en/cs as three unrelated pages
 *    that compete for the same query. Every public page must therefore declare
 *    the full cluster, and every page in the cluster must point back at all the
 *    others (including itself) or Google discards the annotation.
 *  - **Canonicals.** `/catalog` accepts five filter params and the product page
 *    two, so the same content is reachable under a combinatorial number of
 *    URLs. Each of those must collapse onto one canonical, or the crawl budget
 *    goes into facets instead of products.
 */

/* ------------------------------------------------------------------ */
/* URLs                                                                */
/* ------------------------------------------------------------------ */

/**
 * Locale-prefixed pathname for a route. Mirrors what next-intl's `getPathname`
 * would return, but without needing request context — safe to call from
 * `sitemap.ts`. Valid because routing uses `localePrefix: "always"` and has no
 * translated pathnames; revisit both assumptions if `routing.ts` changes.
 */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  return `/${locale}${clean}`;
}

/** Absolute URL for a locale-prefixed route. */
export function localeUrl(locale: Locale, path = "/"): string {
  return `${siteUrl}${localePath(locale, path)}`;
}

/**
 * The canonical + hreflang cluster for one logical page.
 *
 * `x-default` points at the Slovak version: Slovakia is the primary market,
 * and sk is the routing default a bare visit already lands on.
 */
export function alternatesFor(
  locale: Locale,
  path = "/",
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = localeUrl(l, path);
  languages["x-default"] = localeUrl(routing.defaultLocale, path);
  return { canonical: localeUrl(locale, path), languages };
}

/** The same cluster in the shape `sitemap.ts` expects. */
export function sitemapAlternates(path = "/") {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = localeUrl(l, path);
  languages["x-default"] = localeUrl(routing.defaultLocale, path);
  return { languages };
}

/**
 * Standard metadata for a public page: title, description, the canonical +
 * hreflang cluster, and matching Open Graph fields.
 *
 * `index: false` marks a page as no-value-for-search (the basket) — it still
 * gets a canonical so any inbound link consolidates correctly.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  index = true,
}: {
  locale: Locale;
  path: string;
  /** Accepts `{ absolute }` for pages that shouldn't take the title template. */
  title?: Metadata["title"];
  description?: string;
  index?: boolean;
}): Metadata {
  const canonical = localeUrl(locale, path);
  // og:title has no template to expand, so `{ absolute }` collapses to itself.
  const ogTitle =
    typeof title === "string"
      ? title
      : title && "absolute" in title
        ? title.absolute
        : undefined;
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: alternatesFor(locale, path),
    openGraph: {
      url: canonical,
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(description ? { description } : {}),
    },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}

/**
 * Trims a body paragraph down to meta-description length.
 *
 * The catalogue descriptions are written for the page, not the SERP, and run
 * to 250+ characters. Google truncates around 155–160, so cut at a word
 * boundary ourselves rather than letting it happen mid-word.
 */
export function metaDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[,;:.\s]+$/, "")}…`;
}

/* ------------------------------------------------------------------ */
/* JSON-LD                                                             */
/* ------------------------------------------------------------------ */

/** Anything we serialise into a <script type="application/ld+json">. */
export type JsonLd = Record<string, unknown>;

const ORG_ID = `${siteUrl}/#organization`;
const SITE_ID = `${siteUrl}/#website`;

/**
 * The company itself. Emitted once per page from the locale layout and
 * referenced by `@id` everywhere else, so the graph has a single node for
 * the brand rather than a copy per page.
 */
export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    // IČO / DIČ — the identifiers a Slovak searcher or aggregator matches on.
    identifier: [
      { "@type": "PropertyValue", name: "IČO", value: siteConfig.ico },
      { "@type": "PropertyValue", name: "DIČ", value: siteConfig.dic },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      postalCode: siteConfig.address.zip,
      addressLocality: siteConfig.address.city,
      addressCountry: "SK",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: siteConfig.phone,
      email: siteConfig.email,
      areaServed: ["SK", "CZ"],
      availableLanguage: ["sk", "cs", "en"],
    },
  };
}

export function webSiteJsonLd(locale: Locale): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: localeUrl(locale),
    name: siteConfig.name,
    inLanguage: locale,
    publisher: { "@id": ORG_ID },
  };
}

/** Trail of `{ name, path }` crumbs, root first. */
export function breadcrumbJsonLd(
  locale: Locale,
  trail: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: localeUrl(locale, crumb.path),
    })),
  };
}

/**
 * A catalogue product.
 *
 * Deliberately **no `offers`**: `basePrice` in the catalogue data is a
 * placeholder, and a price in structured data is a price Google will show and
 * the client will be held to. Add an `Offer` here (price, priceCurrency,
 * availability, priceValidUntil) the moment real prices are confirmed — that
 * is what unlocks price/availability rich results.
 */
export function productJsonLd(
  locale: Locale,
  product: Product,
  category: Category | undefined,
  finishes: Finish[],
): JsonLd {
  const specs = product.specs ?? {};
  const properties = Object.entries(specs)
    .filter(([, value]) => Boolean(value))
    .map(([name, value]) => ({
      "@type": "PropertyValue",
      name,
      value: String(value),
    }));

  // Covers and frames exist in several finishes; each is a real, separately
  // ordered article number, so they are the product's colour variants.
  const variantFinishes = product.kind === "mechanism" ? [] : finishes;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${localeUrl(locale, `/catalog/${product.slug}`)}#product`,
    name: product.name[locale],
    description: product.description[locale],
    url: localeUrl(locale, `/catalog/${product.slug}`),
    ...(product.sku ? { sku: product.sku, mpn: product.sku } : {}),
    ...(product.imageUrl ? { image: [product.imageUrl] } : {}),
    ...(category ? { category: category.name[locale] } : {}),
    ...(variantFinishes.length
      ? { color: variantFinishes.map((f) => f.name[locale]) }
      : specs.color
        ? { color: specs.color }
        : {}),
    brand: { "@type": "Brand", name: siteConfig.name },
    manufacturer: { "@id": ORG_ID },
    ...(properties.length ? { additionalProperty: properties } : {}),
  };
}

/** The catalogue listing, so Google sees it as a product index. */
export function itemListJsonLd(locale: Locale, products: Product[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.map((product, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: product.name[locale],
      url: localeUrl(locale, `/catalog/${product.slug}`),
    })),
  };
}
