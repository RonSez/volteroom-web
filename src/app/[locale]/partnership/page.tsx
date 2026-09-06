import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Store,
  Building2,
  PenTool,
  DraftingCompass,
  Package,
  Headset,
  BadgePercent,
  ArrowRight,
} from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PartnershipForm } from "@/components/partnership/PartnershipForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partnership" });
  return { title: t("title"), description: t("intro") };
}

export default async function PartnershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PartnershipContent />;
}

/** The four audiences named in the invitation, in the order the client wrote them. */
const AUDIENCES = [
  { key: "trade", icon: Store },
  { key: "construction", icon: Building2 },
  { key: "designers", icon: PenTool },
  { key: "architects", icon: DraftingCompass },
] as const;

const BENEFITS = [
  { key: "range", icon: Package },
  { key: "support", icon: Headset },
  { key: "discounts", icon: BadgePercent },
] as const;

function PartnershipContent() {
  const t = useTranslations("partnership");

  return (
    <>
      {/* Invitation + the image the pitch sits against */}
      <Section className="py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
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
            <Reveal delay={240}>
              <p className="mt-4 text-lg font-light leading-relaxed text-muted-foreground">
                {t("intro2")}
              </p>
            </Reveal>
            <Reveal delay={320}>
              <a
                href="#request"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-8 h-12 gap-2 rounded-xl bg-brand px-7 text-brand-foreground hover:bg-brand/90",
                )}
              >
                {t("cta")}
                <ArrowRight className="size-4" />
              </a>
            </Reveal>
          </div>

          <Reveal variant="scale">
            {/* The photo is a transparent cut-out, so the pool of brand light
                behind her is what stops her floating in the void of the dark
                page. Capped well below the 900px source width so it never
                scales up and goes soft, even at 2x. */}
            <div className="relative mx-auto w-full max-w-md">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(52% 50% at 50% 42%, rgba(43,164,214,0.22) 0%, rgba(12,14,18,0) 70%)",
                }}
              />
              {/* Photo: Kawê Rodrigues via Pexels (Pexels License — free for
                  commercial use, no attribution required), background removed.
                  The azure drop-shadow gives the silhouette a rim of light so
                  she reads as lit rather than pasted on, and the bottom mask
                  fades the hip-height crop into the page instead of ending it
                  on a hard horizontal line (the mask clips the glow with it).
                  The fade starts below her hands so it never eats them. */}
              <Image
                src="/brand/partnership/welcome-v2.webp"
                alt=""
                width={900}
                height={1424}
                sizes="(min-width: 1024px) 22rem, 15rem"
                className="relative mx-auto h-auto w-full max-w-[22rem] [filter:drop-shadow(0_0_30px_rgba(43,164,214,0.30))_drop-shadow(0_2px_8px_rgba(0,0,0,0.6))] [-webkit-mask-image:linear-gradient(to_bottom,#000_82%,transparent_100%)] [mask-image:linear-gradient(to_bottom,#000_82%,transparent_100%)]"
                priority
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Who we are inviting */}
      <Section className="bg-muted/40 py-14 sm:py-20">
        <Reveal>
          <h2 className="text-shimmer font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t("audienceTitle")}
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map(({ key, icon: Icon }, i) => (
            <Reveal key={key} delay={i * 70} variant="scale">
              <div className="floats h-full rounded-2xl p-6">
                <Icon className="size-7 text-brand" strokeWidth={1.5} />
                <h3 className="mt-4 font-heading text-base font-semibold">
                  {t(`audience.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`audience.${key}.body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* What partnership gets you */}
      <Section className="py-14 sm:py-20">
        <Reveal>
          <h2 className="text-shimmer font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t("benefitsTitle")}
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {BENEFITS.map(({ key, icon: Icon }, i) => (
            <Reveal key={key} delay={i * 70} variant="scale">
              <div className="glass relative h-full overflow-hidden rounded-2xl p-7">
                <div className="rule-brand absolute inset-x-0 top-0 h-px" />
                <Icon className="size-7 text-brand" strokeWidth={1.5} />
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {t(`benefits.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`benefits.${key}.body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* The application itself */}
      <Section id="request" className="scroll-mt-24 pb-20 pt-4 sm:pb-28">
        <Reveal variant="scale">
          <div className="glass relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-6 sm:p-10">
            <div className="rule-brand absolute inset-x-0 top-0 h-px" />
            <h2 className="text-shimmer font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              {t("formTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t("formSubtitle")}
            </p>
            <div className="mt-8">
              <PartnershipForm />
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
