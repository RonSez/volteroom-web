import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { gtcLead, gtcSections } from "./content";

export default async function CooperationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CooperationContent />;
}

// Lines that read as nested list items (a), b., quoted definitions) are indented.
function isListLine(line: string) {
  return /^([a-z][).]|["“])/.test(line);
}

function CooperationContent() {
  const t = useTranslations("cooperation");

  return (
    <Section className="py-14 sm:py-20">
      <div className="mx-auto max-w-3xl">
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

        <div className="mt-12 space-y-10">
          <p className="text-sm leading-relaxed text-muted-foreground">{gtcLead}</p>

          {gtcSections.map((section) => (
            <section key={section.heading} className="space-y-4">
              {section.heading && (
                <h2 className="font-heading text-xl font-semibold tracking-tight">
                  {section.heading}
                </h2>
              )}
              {section.body.map((line, i) => (
                <p
                  key={i}
                  className={`text-sm leading-relaxed text-muted-foreground${
                    isListLine(line) ? " pl-5" : ""
                  }`}
                >
                  {line}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </Section>
  );
}
