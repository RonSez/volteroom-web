import { useTranslations } from "next-intl";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroMedia } from "./HeroMedia";
import { HeroStarfield } from "./HeroStarfield";

export function Hero() {
  const t = useTranslations("home");
  const features = t.raw("features.items") as { title: string }[];
  // Three short, already-localized proof points for the floating chips.
  const chips = features.slice(1, 4).map((f) => f.title);

  return (
    <section className="relative overflow-hidden">
      {/* Space-like stars + meteors over the textured heaven background. */}
      <HeroStarfield />
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-28">
        {/* ── Copy ───────────────────────────────────────────── */}
        <div className="relative animate-rise">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand">
            <span className="rule-brand h-px w-9 rounded-full" aria-hidden />
            {t("hero.eyebrow")}
          </p>

          <h1 className="text-shimmer text-balance font-heading text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.75rem]">
            {t("hero.title")}
          </h1>

          <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-muted-foreground">
            {t("hero.subtitle")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
          <ul className="mt-10 flex flex-wrap gap-2.5">
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

        {/* ── Floating video card ────────────────────────────── */}
        <div className="relative animate-rise [animation-delay:120ms]">
          {/* soft blue glow puddle behind the card */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 -z-10"
            style={{
              background:
                "radial-gradient(60% 60% at 60% 40%, rgba(0,160,214,0.30) 0%, rgba(0,160,214,0) 70%)",
              filter: "blur(8px)",
            }}
          />
          <div className="animate-float">
            <div className="floats group relative overflow-hidden rounded-2xl p-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl sm:aspect-[5/4] lg:aspect-[4/5]">
                {/* Cross-fading reel: brand video → switch shots 1/2/3 */}
                <HeroMedia />
                {/* legibility scrim only at the very bottom for the badge */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(11,30,59,0) 0%, rgba(11,30,59,0.55) 100%)",
                  }}
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold tracking-wide text-foreground shadow-sm backdrop-blur">
                  <span className="size-2 rounded-full bg-brand" aria-hidden />
                  Volteroom
                </div>
              </div>
            </div>
          </div>

          {/* small floating accent tile, top-right */}
          <div
            aria-hidden
            className="floats absolute -right-3 -top-5 hidden animate-float rounded-xl px-4 py-3 [animation-delay:1.5s] sm:block"
          >
            <p className="font-heading text-2xl font-bold leading-none text-foreground">
              9.5<span className="text-base font-medium text-muted-foreground">mm</span>
            </p>
            <span className="rule-brand mt-1.5 block h-0.5 w-7 rounded-full" aria-hidden />
            <p className="mt-1.5 font-heading text-2xl font-bold leading-none text-foreground">
              5<span className="text-base font-medium text-muted-foreground">yr</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
