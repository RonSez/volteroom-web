import type { Metadata } from "next";
import { useTranslations, useFormatter } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, Download, FileText } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { certificates, certificatesIssued } from "./content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "certificates" });
  return { title: t("title"), description: t("intro") };
}

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CertificatesContent />;
}

function CertificatesContent() {
  const t = useTranslations("certificates");
  const format = useFormatter();
  const issued = format.dateTime(new Date(certificatesIssued), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Section className="py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
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
          <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground">
            {t("intro")}
          </p>
        </Reveal>

        <Reveal delay={220}>
          <dl className="floats mt-10 grid gap-6 rounded-2xl px-6 py-5 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-tech text-xs uppercase tracking-[0.18em] text-foreground/50">
                {t("standardLabel")}
              </dt>
              <dd className="mt-1.5 text-foreground/90">{t("standard")}</dd>
            </div>
            <div>
              <dt className="font-tech text-xs uppercase tracking-[0.18em] text-foreground/50">
                {t("issuerLabel")}
              </dt>
              <dd className="mt-1.5 text-foreground/90">{t("issuer")}</dd>
            </div>
            <div>
              <dt className="font-tech text-xs uppercase tracking-[0.18em] text-foreground/50">
                {t("issuedLabel")}
              </dt>
              <dd className="mt-1.5 text-foreground/90">{issued}</dd>
            </div>
          </dl>
        </Reveal>

        <ul className="mt-8 space-y-4">
          {certificates.map((cert, i) => (
            <li key={cert.id}>
              <Reveal delay={Math.min(i, 5) * 40}>
                <a
                  href={cert.file}
                  download
                  className="floats group flex items-center gap-5 rounded-2xl px-6 py-5 transition-colors hover:border-brand/40"
                >
                  <FileText
                    aria-hidden
                    className="size-6 shrink-0 text-brand/80"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-base font-semibold tracking-tight">
                      {t(`samples.${cert.id}`)}
                    </p>
                    <p className="font-tech mt-1 text-xs text-muted-foreground">
                      {t("reportNo")} {cert.id} ·{" "}
                      {t("pages", { count: cert.pages })} ·{" "}
                      {format.number(cert.bytes / 1_000_000, {
                        maximumFractionDigits: 1,
                      })}
                      &nbsp;MB
                    </p>
                  </div>

                  <span className="hidden items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand sm:inline-flex">
                    <BadgeCheck aria-hidden className="size-3.5" />
                    {t("pass")}
                  </span>

                  <Download
                    aria-hidden
                    className="size-5 shrink-0 text-foreground/40 transition-colors group-hover:text-foreground"
                  />
                  <span className="sr-only">{t("openPdf")}</span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={240}>
          <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
            {t("note")}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
