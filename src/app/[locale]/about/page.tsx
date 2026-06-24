import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Target, LayoutGrid, ShieldCheck } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations("about");
  const productItems = t.raw("productItems") as string[];

  return (
    <>
      {/* Intro */}
      <Section className="py-14 sm:py-20">
        <div className="max-w-3xl">
          <Reveal>
            <p className="font-tech mb-4 text-xs uppercase tracking-[0.24em] text-brand">
              Volteroom
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-shimmer text-balance font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              {t("title")}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 text-lg font-light leading-relaxed text-muted-foreground">
              {t("intro")}
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Mission */}
      <Pillar
        index="01"
        icon={Target}
        title={t("missionTitle")}
        image="/brand/presentation/slide-04.png"
        imageSide="right"
        className="bg-muted/40"
      >
        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("mission")}
        </p>
      </Pillar>

      {/* Product */}
      <Pillar
        index="02"
        icon={LayoutGrid}
        title={t("productTitle")}
        image="/brand/presentation/slide-03.png"
        imageSide="left"
      >
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          {t("product")}
        </p>
        <p className="mt-5 text-base leading-relaxed">{t("productLeadIn")}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {productItems.map((item, i) => (
            <Reveal key={item} delay={i * 50} variant="scale" className="inline-flex">
              <li className="floats rounded-md px-3 py-1.5 text-sm font-medium">
                {item}
              </li>
            </Reveal>
          ))}
        </ul>
        <p className="mt-6 text-base leading-relaxed">{t("productBalance")}</p>
      </Pillar>

      {/* Quality */}
      <Section className="bg-muted/40">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <PillarHeading index="03" icon={ShieldCheck} title={t("qualityTitle")} />
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("quality")}
            </p>
          </div>
          <Reveal variant="scale">
            <div className="floats relative overflow-hidden rounded-2xl p-8 sm:p-10">
              <div className="rule-brand absolute inset-x-0 top-0 h-px" />
              <ShieldCheck className="size-8 text-brand" strokeWidth={1.5} />
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-brand-gradient font-heading text-6xl font-bold leading-none sm:text-7xl">
                  {t("warrantyValue")}
                </span>
                <span className="font-heading text-2xl font-semibold text-muted-foreground">
                  {t("warrantyUnit")}
                </span>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t("warrantyLabel")}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Closing statement */}
      <Section>
        <Reveal variant="scale">
          <div className="glass relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-10 sm:py-20">
            <div className="rule-brand absolute inset-x-0 top-0 h-px" />
            <p className="mx-auto max-w-3xl text-balance font-heading text-2xl font-semibold leading-snug sm:text-3xl">
              {t("closing")}
            </p>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

function PillarHeading({
  index,
  icon: Icon,
  title,
}: {
  index: string;
  icon: Icon;
  title: string;
}) {
  return (
    <Reveal>
      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand/20">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <span className="font-tech text-sm uppercase tracking-[0.24em] text-brand">
          {index}
        </span>
      </div>
      <h2 className="text-shimmer mt-5 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
    </Reveal>
  );
}

function Pillar({
  index,
  icon,
  title,
  image,
  imageSide,
  className,
  children,
}: {
  index: string;
  icon: Icon;
  title: string;
  image: string;
  imageSide: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Section className={className}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal
          variant={imageSide === "left" ? "fade-right" : "fade-left"}
          className={cn(imageSide === "left" ? "lg:order-1" : "lg:order-2")}
        >
          <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-border">
            <Image
              src={image}
              alt=""
              width={1440}
              height={810}
              className="h-auto w-full"
            />
          </div>
        </Reveal>
        <div className={cn(imageSide === "left" ? "lg:order-2" : "lg:order-1")}>
          <PillarHeading index={index} icon={icon} title={title} />
          {children}
        </div>
      </div>
    </Section>
  );
}
