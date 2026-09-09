import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Section, SectionHeading } from "@/components/layout/Section";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductCard } from "@/components/catalog/ProductCard";
import {
  getProductBySlug,
  getAllProductSlugs,
  getProducts,
  getProductFinishes,
  getCategory,
} from "@/lib/catalog";
import type { Product } from "@/data/catalog";
import {
  breadcrumbJsonLd,
  metaDescription,
  pageMetadata,
  productJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const typedLocale = locale as Locale;

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

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations("product");
  const tCatalog = await getTranslations("catalog");
  const [finishes, categoryProducts, category] = await Promise.all([
    getProductFinishes(product),
    getProducts({ category: product.category }),
    getCategory(product.category),
  ]);
  const related = categoryProducts
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  // Preselect the finish / gang carried over from the catalogue card, if valid.
  const sp = await searchParams;
  const finishRaw = Array.isArray(sp.finish) ? sp.finish[0] : sp.finish;
  const initialFinishId = finishes.find((f) => f.id === finishRaw)?.id;
  const gangRaw = Array.isArray(sp.gang) ? sp.gang[0] : sp.gang;
  const initialGang = product.gangs?.find((g) => g === Number(gangRaw));

  const typedLocale = locale as Locale;

  return (
    <>
      {/* Product + breadcrumb graph. The Product node carries sku, specs and
          finishes but deliberately no Offer — see productJsonLd. */}
      <JsonLd
        data={[
          productJsonLd(typedLocale, product, category, finishes),
          breadcrumbJsonLd(typedLocale, [
            { name: "Volteroom", path: "/" },
            { name: tCatalog("title"), path: "/catalog" },
            { name: product.name[typedLocale], path: `/catalog/${product.slug}` },
          ]),
        ]}
      />
      <Section className="py-8 sm:py-10">
        <Link
          href="/catalog"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {t("backToCatalog")}
        </Link>
        <ProductDetail
          product={product}
          finishes={finishes}
          initialFinishId={initialFinishId}
          initialGang={initialGang}
        />
      </Section>

      {related.length > 0 && <Related products={related} />}
    </>
  );
}

function Related({ products }: { products: Product[] }) {
  const t = useTranslations("product");
  return (
    <Section className="border-t border-border bg-muted/30">
      <SectionHeading title={t("relatedTitle")} />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </Section>
  );
}
