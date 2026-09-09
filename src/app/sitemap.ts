import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { getCategories, getProducts } from "@/lib/catalog";
import { localeUrl, sitemapAlternates } from "@/lib/seo";

/**
 * The sitemap for every indexable URL, in every locale.
 *
 * Each localized URL is listed in its own right and carries the full hreflang
 * cluster, which is the second (and more reliable) channel for the same
 * annotation the pages emit in <head>.
 *
 * `/basket` is intentionally absent — it is a per-visitor utility page with no
 * search value, and `robots.ts` disallows it.
 */

/** Static routes, with the crawl priority we want relative to each other. */
const ROUTES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1.0, changeFrequency: "monthly" },
  { path: "/catalog", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/certificates", priority: 0.6, changeFrequency: "yearly" },
  { path: "/partnership", priority: 0.6, changeFrequency: "yearly" },
  { path: "/cooperation", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  const lastModified = new Date();

  const staticEntries = ROUTES.flatMap(({ path, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: localeUrl(locale, path),
      lastModified,
      changeFrequency,
      priority,
      alternates: sitemapAlternates(path),
    })),
  );

  // Category landing pages rank for the words people actually search, so they
  // sit just under the catalogue index and above individual article numbers.
  const categoryEntries = categories.flatMap((category) => {
    const path = `/catalog/${category.id}`;
    return locales.map((locale) => ({
      url: localeUrl(locale, path),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.85,
      alternates: sitemapAlternates(path),
    }));
  });

  const productEntries = products.flatMap((product) => {
    const path = `/catalog/${product.slug}`;
    return locales.map((locale) => ({
      url: localeUrl(locale, path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: sitemapAlternates(path),
      // Image sitemap entry: the product photo is the asset worth surfacing
      // in Google Images for a design-led range.
      ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
    }));
  });

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
