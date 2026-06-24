import { setRequestLocale } from "next-intl/server";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { privacySections, privacyTitle, type Block } from "./content";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

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
            {privacyTitle}
          </h1>
        </Reveal>

        <div className="mt-12 space-y-12">
          {privacySections.map((section, i) => (
            <Reveal key={i} delay={Math.min(i, 4) * 40}>
              <section>
                {section.heading && (
                  <h2 className="text-shimmer font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                    {section.heading}
                  </h2>
                )}
                <div className={section.heading ? "mt-5 space-y-4" : "space-y-4"}>
                  {section.blocks.map((block, j) => (
                    <BlockView key={j} block={block} />
                  ))}
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-base leading-relaxed text-muted-foreground">
          {block.text}
        </p>
      );
    case "h3":
      return (
        <h3 className="pt-2 font-heading text-lg font-semibold text-foreground">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground marker:text-brand">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "lines":
      return (
        <div className="floats rounded-xl px-5 py-4 text-base leading-relaxed text-muted-foreground">
          {block.items.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      );
    case "dl":
      return (
        <dl className="space-y-3">
          {block.items.map((item, i) => (
            <div key={i} className="text-base leading-relaxed">
              <dt className="inline font-semibold text-foreground">
                {item.term}
              </dt>{" "}
              <dd className="inline text-muted-foreground">— {item.def}</dd>
            </div>
          ))}
        </dl>
      );
  }
}
