import { useTranslations } from "next-intl";
import { MapPin, Phone, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { siteConfig, mapsLinkUrl } from "@/lib/site";

export function Footer() {
  const t = useTranslations();
  const year = 2026;

  return (
    <footer className="relative mt-28 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-[0_50px_90px_-50px_rgba(15,23,42,0.6)]">
        <span aria-hidden className="rule-brand absolute inset-x-0 top-0 h-px opacity-60" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(60% 110% at 100% 0%, rgba(0,160,214,0.22) 0%, rgba(15,23,42,0) 55%)",
          }}
        />
        <div className="relative grid gap-10 px-8 py-14 sm:px-10 md:grid-cols-2 lg:grid-cols-4 lg:px-12">
        <div className="space-y-4">
          <Link href="/" aria-label="Volteroom" className="mb-2 inline-block text-primary-foreground">
            <Logo tone="light" />
          </Link>
          <p className="max-w-xs text-sm text-primary-foreground/70">
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
            {t("footer.exploreTitle")}
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/catalog" className="text-primary-foreground/80 hover:text-primary-foreground">{t("nav.catalog")}</Link></li>
            <li><Link href="/about" className="text-primary-foreground/80 hover:text-primary-foreground">{t("nav.about")}</Link></li>
            <li><Link href="/contact" className="text-primary-foreground/80 hover:text-primary-foreground">{t("nav.contact")}</Link></li>
            <li><Link href="/basket" className="text-primary-foreground/80 hover:text-primary-foreground">{t("nav.basket")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
            {t("footer.contactTitle")}
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={mapsLinkUrl} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-primary-foreground/80 hover:text-primary-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{siteConfig.address.street}, {siteConfig.address.zip} {siteConfig.address.city}</span>
              </a>
            </li>
            <li>
              <a href={siteConfig.phoneHref} className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground">
                <Phone className="size-4 shrink-0" />{siteConfig.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground">
                <Mail className="size-4 shrink-0" />{siteConfig.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
            {t("footer.companyTitle")}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
            <li>{siteConfig.legalName}</li>
            <li>{t("contact.ico")}: {siteConfig.ico}</li>
            <li>{t("contact.dic")}: {siteConfig.dic}</li>
            <li>{t("footer.nonVat")}</li>
          </ul>
        </div>
      </div>

        <div className="relative border-t border-primary-foreground/10">
          <div className="flex flex-col items-center justify-between gap-2 px-8 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:px-10 lg:px-12">
            <p>© {year} {siteConfig.legalName}. {t("footer.rights")}</p>
            <p>{siteConfig.domain}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
