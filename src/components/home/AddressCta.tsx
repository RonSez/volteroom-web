import { useTranslations } from "next-intl";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig, mapsLinkUrl } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export function AddressCta() {
  const t = useTranslations("home.addressCta");
  const tc = useTranslations("common");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground shadow-[0_50px_90px_-50px_rgba(15,23,42,0.6)] sm:px-12 sm:py-16">
        <span aria-hidden className="rule-brand absolute inset-x-0 top-0 h-px opacity-60" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(70% 120% at 100% 0%, rgba(0,160,214,0.4) 0%, rgba(15,23,42,0) 60%)",
          }}
        />
        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <Reveal>
              <h2 className="font-heading text-3xl font-bold sm:text-4xl">
                {t("title")}
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-3 text-primary-foreground/75">{t("subtitle")}</p>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 flex items-start gap-2 text-lg font-medium">
                <MapPin className="mt-1 size-5 shrink-0 text-[color:var(--brand-to)]" />
                <span>
                  {siteConfig.address.street}
                  <br />
                  {siteConfig.address.zip} {siteConfig.address.city},{" "}
                  {siteConfig.address.country}
                </span>
              </p>
            </Reveal>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 px-6 text-sm bg-brand text-brand-foreground hover:bg-brand/90",
              )}
            >
              {t("cta")}
              <ArrowRight className="size-4" />
            </Link>
            <a
              href={mapsLinkUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-6 text-sm border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
              )}
            >
              <MapPin className="size-4" />
              {tc("getDirections")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
