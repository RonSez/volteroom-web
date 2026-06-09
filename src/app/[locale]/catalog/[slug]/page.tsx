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
} from "@/lib/catalog";
import type { Product } from "@/data/catalog";

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
  return { title: product.name[locale as Locale] };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations("product");
  const [finishes, categoryProducts] = await Promise.all([
    getProductFinishes(product),
    getProducts({ category: product.category }),
  ]);
  const related = categoryProducts
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <>
      <Section className="py-8 sm:py-10">
        <Link
          href="/catalog"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {t("backToCatalog")}
        </Link>
        <ProductDetail product={product} finishes={finishes} />
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
