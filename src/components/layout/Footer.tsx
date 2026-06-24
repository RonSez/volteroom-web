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
      <div className="floats relative mx-auto max-w-7xl overflow-hidden rounded-3xl text-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 110% at 100% 0%, rgba(43, 164, 214,0.20) 0%, rgba(12, 14, 18,0) 55%), radial-gradient(50% 90% at 0% 100%, rgba(46, 120, 180,0.16) 0%, rgba(12, 14, 18,0) 55%)",
          }}
        />
        <div className="relative grid gap-10 px-8 py-14 sm:px-10 md:grid-cols-2 lg:grid-cols-4 lg:px-12">
        <div className="space-y-4">
          <Link href="/" aria-label="Volteroom" className="mb-2 inline-block text-foreground">
            <Logo tone="light" />
          </Link>
          <p className="max-w-xs text-sm text-foreground/70">
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/60">
            {t("footer.exploreTitle")}
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/catalog" className="text-foreground/80 hover:text-foreground">{t("nav.catalog")}</Link></li>
            <li><Link href="/about" className="text-foreground/80 hover:text-foreground">{t("nav.about")}</Link></li>
            <li><Link href="/contact" className="text-foreground/80 hover:text-foreground">{t("nav.contact")}</Link></li>
            <li><Link href="/basket" className="text-foreground/80 hover:text-foreground">{t("nav.basket")}</Link></li>
            <li><Link href="/privacy" className="text-foreground/80 hover:text-foreground">{t("nav.privacy")}</Link></li>
            <li><Link href="/cooperation" className="text-foreground/80 hover:text-foreground">{t("nav.cooperation")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/60">
            {t("footer.contactTitle")}
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={mapsLinkUrl} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-foreground/80 hover:text-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{siteConfig.address.street}, {siteConfig.address.zip} {siteConfig.address.city}</span>
              </a>
            </li>
            <li>
              <a href={siteConfig.phoneHref} className="flex items-center gap-2 text-foreground/80 hover:text-foreground">
                <Phone className="size-4 shrink-0" />{siteConfig.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 text-foreground/80 hover:text-foreground">
                <Mail className="size-4 shrink-0" />{siteConfig.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/60">
            {t("footer.companyTitle")}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-foreground/70">
            <li>{siteConfig.legalName}</li>
            <li>{t("contact.ico")}: {siteConfig.ico}</li>
            <li>{t("contact.dic")}: {siteConfig.dic}</li>
            <li>{t("footer.nonVat")}</li>
          </ul>
        </div>
      </div>

        <div className="relative border-t border-foreground/10">
          <div className="flex flex-col items-center justify-between gap-2 px-8 py-6 text-xs text-foreground/60 sm:flex-row sm:px-10 lg:px-12">
            <p>© {year} {siteConfig.legalName}. {t("footer.rights")}</p>
            <p>{siteConfig.domain}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
