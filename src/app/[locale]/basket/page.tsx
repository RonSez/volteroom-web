import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/layout/Section";
import { BasketView } from "@/components/basket/BasketView";
import { getProducts, getFinishes } from "@/lib/catalog";

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
