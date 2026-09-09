import { getTranslations } from "next-intl/server";
import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Section, SectionHeading } from "@/components/layout/Section";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductCard } from "@/components/catalog/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProducts, getProductFinishes, getCategory } from "@/lib/catalog";
import type { Product } from "@/data/catalog";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";

/**
 * A single product page. Split out of `page.tsx` because that route now serves
 * two kinds of page — a category index or a product — depending on the slug.
 */
export async function ProductView({
  locale,
  product,
  searchParams,
}: {
  locale: Locale;
  product: Product;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [t, tCatalog, finishes, categoryProducts, category] = await Promise.all(
    [
      getTranslations("product"),
      getTranslations("catalog"),
      getProductFinishes(product),
      getProducts({ category: product.category }),
      getCategory(product.category),
    ],
  );

  const related = categoryProducts
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  // Preselect the finish / gang carried over from the catalogue card, if valid.
  const finishRaw = Array.isArray(searchParams.finish)
    ? searchParams.finish[0]
    : searchParams.finish;
  const initialFinishId = finishes.find((f) => f.id === finishRaw)?.id;
  const gangRaw = Array.isArray(searchParams.gang)
    ? searchParams.gang[0]
    : searchParams.gang;
  const initialGang = product.gangs?.find((g) => g === Number(gangRaw));

  const categoryPath = `/catalog/${product.category}`;

  return (
    <>
      {/* Product + breadcrumb graph. The Product node carries sku, specs and
          finishes but deliberately no Offer — see productJsonLd. */}
      <JsonLd
        data={[
          productJsonLd(locale, product, category, finishes),
          breadcrumbJsonLd(locale, [
            { name: "Volteroom", path: "/" },
            { name: tCatalog("title"), path: "/catalog" },
            ...(category
              ? [{ name: category.name[locale], path: categoryPath }]
              : []),
            { name: product.name[locale], path: `/catalog/${product.slug}` },
          ]),
        ]}
      />
      <Section className="py-8 sm:py-10">
        {/* Back to the product's own category rather than the whole catalogue:
            it is the more useful destination, and it passes link equity to the
            category landing page. */}
        <Link
          href={category ? categoryPath : "/catalog"}
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {category ? category.name[locale] : t("backToCatalog")}
        </Link>
        <ProductDetail
          product={product}
          finishes={finishes}
          initialFinishId={initialFinishId}
          initialGang={initialGang}
        />
      </Section>

      {related.length > 0 && (
        <Section className="border-t border-border bg-muted/30">
          <SectionHeading title={t("relatedTitle")} />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
