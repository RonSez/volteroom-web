import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { MapPin, Phone, Mail, User, Navigation } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { ContactForm } from "@/components/contact/ContactForm";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig, mapsEmbedUrl, mapsLinkUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactContent />;
}

function ContactContent() {
  const t = useTranslations("contact");

  return (
    <Section className="py-10 sm:py-12">
      <header className="max-w-2xl">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">{t("title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Left: address (primary), details, map */}
        <div className="space-y-6">
          {/* Address as primary CTA */}
          <div className="overflow-hidden rounded-2xl bg-primary text-primary-foreground">
            <div className="relative p-6 sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  background:
                    "radial-gradient(70% 120% at 100% 0%, rgba(0,160,214,0.4) 0%, rgba(15,23,42,0) 60%)",
                }}
              />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-to)]">
                  {t("addressTitle")}
                </p>
                <p className="mt-4 flex items-start gap-3 text-xl font-medium leading-snug">
                  <MapPin className="mt-1 size-6 shrink-0 text-[color:var(--brand-to)]" />
                  <span>
                    {siteConfig.address.street}
                    <br />
                    {siteConfig.address.zip} {siteConfig.address.city}
                    <br />
                    {siteConfig.address.country}
                  </span>
                </p>
                <a
                  href={mapsLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-6 h-11 gap-2 bg-brand px-6 text-sm text-brand-foreground hover:bg-brand/90",
                  )}
                >
                  <Navigation className="size-4" />
                  {t("getDirections")}
                </a>
              </div>
            </div>
            <div className="aspect-[16/10] w-full border-t border-white/10">
              <iframe
                title="Volteroom"
                src={mapsEmbedUrl}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Contact details + company */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">{t("detailsTitle")}</h2>
              <ul className="mt-3 space-y-3 text-sm">
                <li>
                  <a href={siteConfig.phoneHref} className="flex items-center gap-2 hover:text-brand">
                    <Phone className="size-4 text-muted-foreground" />
                    {siteConfig.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 hover:text-brand">
                    <Mail className="size-4 text-muted-foreground" />
                    {siteConfig.email}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  {t("director")}: {siteConfig.director}
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">{t("companyTitle")}</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>{siteConfig.legalName}</li>
                <li>{t("ico")}: {siteConfig.ico}</li>
                <li>{t("dic")}: {siteConfig.dic}</li>
                <li>{t("vat")}: {t("nonVat")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-heading text-xl font-semibold">{t("formTitle")}</h2>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </Section>
  );
}
