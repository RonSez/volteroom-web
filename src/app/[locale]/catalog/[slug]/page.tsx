import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import {
  getAllProductSlugs,
  getCategories,
  getProductBySlug,
} from "@/lib/catalog";
import type { Category } from "@/data/catalog";
import { metaDescription, pageMetadata } from "@/lib/seo";
import { CategoryView } from "./CategoryView";
import { ProductView } from "./ProductView";

/**
 * One dynamic segment serving two kinds of catalogue page: a category landing
 * page (`/catalog/switches`) or a product (`/catalog/e08ka111`).
 *
 * They share a segment deliberately, rather than nesting products under their
 * category (`/catalog/switches/e08ka111`). A product's category is editable in
 * the admin, and under a nested scheme reassigning one would silently change
 * that product's URL and break every link to it. Flat keeps product URLs
 * stable for the life of the article number.
 *
 * Category ids and product slugs cannot collide — slugs are article numbers
 * (`e08ka111`) plus `frame`, and `resolveCategory` checks categories first.
 */
async function resolveCategory(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.id === slug);
}

/** Filter keys that turn a category page into a narrowed view. */
const FILTER_PARAMS = ["kind", "finish", "gang", "ip"] as const;

export async function generateStaticParams() {
  const [slugs, categories] = await Promise.all([
    getAllProductSlugs(),
    getCategories(),
  ]);
  const paths = [...categories.map((c) => c.id as string), ...slugs];
  return routing.locales.flatMap((locale) =>
    paths.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale, slug }, sp] = await Promise.all([params, searchParams]);
  const typedLocale = locale as Locale;

  const category = await resolveCategory(slug);
  if (category) {
    const t = await getTranslations({
      locale,
      namespace: `categories.${category.id}`,
    });
    const isFiltered = FILTER_PARAMS.some((key) => sp[key] !== undefined);
    return pageMetadata({
      locale: typedLocale,
      path: `/catalog/${category.id}`,
      title: t("metaTitle"),
      description: t("metaDescription"),
      // Narrowed views are the same category with fewer tiles — one page.
      index: !isFiltered,
    });
  }

  const product = await getProductBySlug(slug);
  if (!product) return {};

  // `?finish=` and `?gang=` only preselect the configurator — they show the
  // same product, so they must not become separate URLs in the index.
  // `pageMetadata` canonicalises to the bare product path.
  const base = pageMetadata({
    locale: typedLocale,
    path: `/catalog/${product.slug}`,
    title: product.name[typedLocale],
    description: metaDescription(product.description[typedLocale]),
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      // The real product photo beats the generic brand card when a spec sheet
      // is shared into a WhatsApp or Teams thread, which is how these get
      // passed between installers and architects.
      ...(product.imageUrl
        ? { images: [{ url: product.imageUrl, alt: product.name[typedLocale] }] }
        : {}),
    },
  };
}

export default async function CatalogEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale, slug }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const category = await resolveCategory(slug);
  if (category) {
    return (
      <CategoryView
        locale={typedLocale}
        category={category}
        searchParams={sp}
      />
    );
  }

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <ProductView locale={typedLocale} product={product} searchParams={sp} />
  );
}
