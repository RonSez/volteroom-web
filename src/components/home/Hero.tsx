import { useTranslations } from "next-intl";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroStarfield } from "./HeroStarfield";
import { HeroCursorField } from "./HeroCursorField";

export function Hero() {
  const t = useTranslations("home");
  const features = t.raw("features.items") as { title: string }[];
  // Three short, already-localized proof points for the floating chips.
  const chips = features.slice(1, 4).map((f) => f.title);

  return (
    <section className="relative overflow-hidden">
      {/* Space-like stars + meteors over the textured heaven background. */}
      <HeroStarfield />
      {/* Interactive constellation that reacts to cursor movement and clicks. */}
      <HeroCursorField />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        {/* ── Copy ───────────────────────────────────────────── */}
        <div className="relative animate-rise">
          <p className="mb-5 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand">
            <span className="rule-brand h-px w-9 rounded-full" aria-hidden />
            {t("hero.eyebrow")}
          </p>

          <h1 className="text-shimmer text-balance font-heading text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.75rem]">
            {t("hero.title")}
          </h1>

          <p className="mx-auto mt-6 max-w-md text-lg font-light leading-relaxed text-muted-foreground">
            {t("hero.subtitle")}
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/catalog"
              className={cn(
                buttonVariants({ size: "lg" }),
                "btn-liquid btn-liquid-blue h-12 rounded-full px-8 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              )}
            >
              <span className="relative z-[2] inline-flex items-center gap-2">
                {t("hero.ctaPrimary")}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-0.5" />
              </span>
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "btn-liquid btn-liquid-white h-12 rounded-full px-8 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-transparent hover:text-foreground",
              )}
            >
              <span className="relative z-[2] inline-flex items-center gap-2">
                <MapPin className="size-4 text-brand" />
                {t("hero.ctaSecondary")}
              </span>
            </Link>
          </div>

          {/* Proof chips — reuse localized feature titles */}
          <ul className="mt-10 flex flex-wrap justify-center gap-2.5">
            {chips.map((label) => (
              <li
                key={label}
                className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground/80"
              >
                <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
