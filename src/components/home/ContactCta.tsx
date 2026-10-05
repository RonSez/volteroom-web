import { useTranslations } from "next-intl";
import { Phone, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Closing CTA on the home page.
 *
 * It used to invite people to a showroom and print the company address under
 * a map pin. There is no showroom — that address is the registered office —
 * so the block now offers the two ways a customer can actually reach us, and
 * the address itself stays in the footer and the contact page as company
 * information.
 */
export function ContactCta() {
  const t = useTranslations("home.contactCta");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="floats relative overflow-hidden rounded-3xl px-6 py-12 text-foreground sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 120% at 100% 0%, rgba(43, 164, 214,0.32) 0%, rgba(12, 14, 18,0) 60%), radial-gradient(60% 100% at 0% 100%, rgba(46, 120, 180,0.22) 0%, rgba(12, 14, 18,0) 60%)",
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
              <p className="mt-3 text-foreground/75">{t("subtitle")}</p>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 flex items-start gap-2 text-lg font-medium">
                <Phone className="mt-1 size-5 shrink-0 text-[color:var(--brand-to)]" />
                <span>
                  <a href={siteConfig.phoneHref} className="hover:text-brand">
                    {siteConfig.phone}
                  </a>
                  <br />
                  <a href={`mailto:${siteConfig.email}`} className="hover:text-brand">
                    {siteConfig.email}
                  </a>
                </span>
              </p>
            </Reveal>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ size: "lg" }),
                "btn-liquid btn-liquid-blue h-11 rounded-full px-6 text-sm font-semibold transition-all duration-500",
              )}
            >
              <span className="relative z-[2] inline-flex items-center gap-2">
                {t("cta")}
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
