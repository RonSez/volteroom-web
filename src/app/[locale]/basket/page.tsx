import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { Section } from "@/components/layout/Section";
import { BasketView } from "@/components/basket/BasketView";
import { getProducts, getFinishes } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.basket" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/basket",
    title: t("title"),
    description: t("description"),
    // A per-visitor scratch list — nothing here is worth a search result,
    // but its outbound links to products are worth following.
    index: false,
  });
}

export default async function BasketPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("basket");
  const [products, finishes] = await Promise.all([getProducts(), getFinishes()]);

  return (
    <Section className="py-10 sm:py-12">
      <h1 className="mb-8 font-heading text-3xl font-bold sm:text-4xl">
        {t("title")}
      </h1>
      <BasketView products={products} finishes={finishes} />
    </Section>
  );
}
