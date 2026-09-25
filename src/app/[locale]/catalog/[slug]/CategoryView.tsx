import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Section } from "@/components/layout/Section";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { GlowWireTest } from "@/components/product/GlowWireTest";
import {
  getAllGangs,
  getCategories,
  getFinishes,
  getProducts,
  toCatalogCards,
} from "@/lib/catalog";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo";
import { GLOW_WIRE_CATEGORY } from "@/data/glow-wire";
import type {
  Category,
  CategoryId,
  FinishId,
  ProductKind,
} from "@/data/catalog";

const KINDS: ProductKind[] = ["mechanism", "cover", "frame"];

/**
 * A category landing page — `/catalog/switches`, `/catalog/sockets`, …
 *
 * These exist because the catalogue's own facets are query parameters, and a
 * `?category=` URL can't realistically rank. The searchable demand for this
 * business is in the category words ("vypínače", "zásuvky", "stmievače"), not
 * in article numbers like E08KA111, so each category gets a real URL with its
 * own copy, metadata and CollectionPage markup.
 *
 * The remaining facets (kind, finish, gang, IP) stay in the query string and
 * are canonicalised away by the parent route's `generateMetadata`.
 */
export async function CategoryView({
  locale,
  category,
  searchParams,
}: {
  locale: Locale;
  category: Category;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [t, tCatalog, categories, finishes, allGangs, categoryProducts] =
    await Promise.all([
      getTranslations(`categories.${category.id}`),
      getTranslations("catalog"),
      getCategories(),
      getFinishes(),
      getAllGangs(),
      getProducts({ category: category.id }),
    ]);
  const tCategories = await getTranslations("categories");

  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const finishIds = new Set(finishes.map((f) => f.id));
  const gangs = new Set(allGangs.map(String));

  const kindRaw = first(searchParams.kind);
  const finishRaw = first(searchParams.finish);
  const gangRaw = first(searchParams.gang);

  const kind =
    kindRaw && KINDS.includes(kindRaw as ProductKind)
      ? (kindRaw as ProductKind)
      : undefined;
  const finish =
    finishRaw && finishIds.has(finishRaw as FinishId)
      ? (finishRaw as FinishId)
      : undefined;
  const gang = gangRaw && gangs.has(gangRaw) ? Number(gangRaw) : undefined;
  const ip44 = first(searchParams.ip) === "44";

  const filtered = await getProducts({
    category: category.id,
    kind,
    finish,
    gang,
    ip44,
  });
  const cards = toCatalogCards(filtered, gang);

  const body = t.raw("body") as string[];
  const others = categories.filter((c) => c.id !== category.id);
  const path = `/catalog/${category.id}`;

  return (
    <>
      <JsonLd
        data={[
          // The unfiltered set is what the page is *about*, so the graph
          // describes that rather than whatever facet is currently applied.
          collectionPageJsonLd(locale, {
            name: category.name[locale],
            description: t("intro"),
            path,
            products: categoryProducts,
          }),
          breadcrumbJsonLd(locale, [
            { name: "Volteroom", path: "/" },
            { name: tCatalog("title"), path: "/catalog" },
            { name: category.name[locale], path },
          ]),
        ]}
      />

      <Section className="py-10 sm:py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-sm text-muted-foreground"
        >
          <Link href="/catalog" className="hover:text-foreground">
            {tCatalog("title")}
          </Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-foreground">{category.name[locale]}</span>
        </nav>

        <header className="max-w-3xl border-b border-border pb-8">
          <Reveal>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">
              {category.name[locale]}
            </h1>
          </Reveal>
          <Reveal delay={60}>
            <p className="mt-4 text-lg text-muted-foreground">{t("intro")}</p>
          </Reveal>
        </header>

        {/* Sockets: the poster the home-page tile teases. It sits above the
            grid because a phone visitor arrives here having seen the ember
            badge and no way to open it — there is no hover to reveal it with. */}
        {category.id === GLOW_WIRE_CATEGORY && (
          <Reveal delay={120} className="mt-8 max-w-xl">
            <GlowWireTest variant="compact" />
          </Reveal>
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-[16rem_1fr]">
          <CatalogFilters
            categories={categories}
            finishes={finishes}
            gangs={allGangs}
            activeCategory={category.id as CategoryId}
          />

          <div>
            <p className="mb-5 text-sm text-muted-foreground">
              {tCatalog("results", { count: cards.length })}
            </p>

            {cards.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
                {tCatalog("empty")}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
                {cards.map(({ product, gang: cardGang }) => (
                  <ProductCard
                    key={cardGang ? `${product.slug}-${cardGang}` : product.slug}
                    product={product}
                    gang={cardGang}
                    selectedFinish={finish}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* The category copy sits below the grid: buyers came for the products,
          but this is the text that gives the page something to rank for. */}
      <Section className="border-t border-border py-12 sm:py-16">
        <div className="max-w-3xl space-y-5">
          {body.map((paragraph, i) => (
            <Reveal key={i} delay={i * 60}>
              <p className="leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Every category links to every other one, so the whole set is reachable
          in one hop from any of them. */}
      <Section className="border-t border-border py-12">
        <h2 className="font-heading text-lg font-bold">
          {tCategories("otherCategories")}
        </h2>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {others.map((c) => (
            <Link
              key={c.id}
              href={`/catalog/${c.id}`}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-brand/50 hover:text-foreground"
            >
              {c.name[locale]}
            </Link>
          ))}
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
          >
            {tCategories("allProducts")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Section>
    </>
  );
}
