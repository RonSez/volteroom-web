import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Check, Building2 } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/Section";

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
  const concept = t.raw("concept") as string[];
  const suitable = t.raw("suitable") as string[];

  return (
    <>
      <Section className="py-12 sm:py-16">
        <div className="max-w-3xl">
          <h1 className="font-heading text-4xl font-bold sm:text-5xl">{t("title")}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {t("intro")}
          </p>
        </div>
      </Section>

      <Section className="bg-muted/40">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading title={t("conceptTitle")} />
            <ul className="mt-6 space-y-4">
              {concept.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-gradient text-white">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-border">
            <Image
              src="/brand/presentation/slide-04.png"
              alt=""
              width={1440}
              height={810}
              className="h-auto w-full"
            />
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 overflow-hidden rounded-2xl shadow-xl ring-1 ring-border lg:order-1">
            <Image
              src="/brand/presentation/slide-03.png"
              alt=""
              width={1440}
              height={810}
              className="h-auto w-full"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              <Building2 className="size-4" />
              {t("suitableTitle")}
            </p>
            <ul className="mt-4 space-y-4">
              {suitable.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-gradient text-white">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
