import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Hero } from "@/components/home/Hero";
import { PresentationGallery } from "@/components/home/PresentationGallery";
import { CategoryCards } from "@/components/home/CategoryCards";
import { FinishesShowcase } from "@/components/home/FinishesShowcase";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { SwitchShowcase } from "@/components/home/SwitchShowcase";
import { AddressCta } from "@/components/home/AddressCta";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { getFeaturedProducts } from "@/lib/catalog";
import type { Product } from "@/data/catalog";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const featured = (await getFeaturedProducts()).slice(0, 4);
  return <HomeContent featured={featured} />;
}

function HomeContent({ featured }: { featured: Product[] }) {
  const t = useTranslations();

  return (
    <>
      <Hero />

      <Section className="py-16 sm:py-20">
        <SectionHeading
          align="center"
          eyebrow={t("home.collections.subtitle")}
          title={t("home.collections.title")}
        />
        <div className="mt-12">
          <CategoryCards />
        </div>
      </Section>

      <Section className="py-16 sm:py-20">
        <SectionHeading
          align="center"
          title={t("home.gallery.title")}
          subtitle={t("home.gallery.subtitle")}
        />
        <Reveal variant="scale" className="mt-12">
          <PresentationGallery />
        </Reveal>
      </Section>

      <Section className="py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={t("home.collections.title")} title={t("nav.catalog")} />
          <Link
            href="/catalog"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-brand hover:bg-brand/10",
            )}
          >
            {t("common.viewCatalog")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 70} className="h-full">
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-16 sm:py-20">
        <div className="floats relative overflow-hidden rounded-3xl px-6 py-12 sm:px-12 sm:py-16">
          <span aria-hidden className="rule-brand absolute inset-x-0 top-0 h-px opacity-50" />
          <SectionHeading
            align="center"
            title={t("home.finishes.title")}
            subtitle={t("home.finishes.subtitle")}
          />
          <div className="mt-12">
            <FinishesShowcase />
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            {t("home.finishes.note")}
          </p>
        </div>
      </Section>

      <Section className="py-16 sm:py-20">
        <SectionHeading
          align="center"
          eyebrow={t("home.hero.eyebrow")}
          title={t("home.features.title")}
          subtitle={t("home.features.subtitle")}
        />
        <div className="mt-12">
          <FeatureGrid />
        </div>
      </Section>

      <SwitchShowcase />

      <div className="pb-8">
        <AddressCta />
      </div>
    </>
  );
}
