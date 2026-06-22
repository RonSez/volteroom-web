"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, MapPin } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The hero is a self-playing brand film that sits as the full-bleed background
 * of the first viewport, with the headline and CTAs laid directly over it. The
 * clip autoplays, loops and is muted (so it can play inline on mobile without
 * any interaction). A single soft gradient scrim — not a solid panel — keeps
 * the copy legible over whatever frame is on screen.
 *
 * The copy plays a one-shot entrance on mount; nothing here is scroll-driven, so
 * the rest of the page simply flows below in normal document order. Reduced
 * motion shows the copy immediately and holds the film as a calm backdrop.
 */

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};

export function Hero() {
  const t = useTranslations();
  const reduced = useReducedMotion();

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      {/* The film — autoplaying, looping background. Muted + inline so it plays
          on mobile without going fullscreen; decorative, so hidden from a11y. */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        tabIndex={-1}
        aria-hidden
        // Scale up slightly so the thin letterbox bars baked into the source
        // clip are pushed past the section's overflow-hidden edge (the bars
        // would otherwise show on 16:9-or-taller viewports, where object-cover
        // doesn't crop them away).
        className="absolute inset-0 -z-10 h-full w-full scale-[1.04] object-cover"
      >
        <source src="/brand/hero-scroll.mp4" type="video/mp4" />
      </video>

      {/* Legibility scrim — a soft top/bottom gradient over the film, never a
          solid block, so the video reads as the background. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background/35 via-background/5 to-background/50"
      />

      {/* Ambient blue bloom behind the headline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[52vh] w-[86vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(43,164,214,0.26) 0%, rgba(14,42,78,0.16) 36%, rgba(12,14,18,0) 70%)",
          filter: "blur(34px)",
        }}
      />

      {/* The copy — laid directly over the film. */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          variants={reduced ? undefined : container}
          initial={reduced ? undefined : "hidden"}
          animate={reduced ? undefined : "show"}
          className="relative flex flex-col items-center"
        >
          <motion.p
            variants={reduced ? undefined : item}
            className="font-tech mb-5 text-center text-xs uppercase tracking-[0.3em] text-brand"
          >
            {t("home.hero.eyebrow")}
          </motion.p>

          <motion.h1
            variants={reduced ? undefined : item}
            className="text-shimmer text-balance font-heading text-[2.7rem] font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4rem]"
            style={{ textShadow: "0 0 60px rgba(43,164,214,0.32)" }}
          >
            {t("home.hero.title")}
          </motion.h1>

          <motion.p
            variants={reduced ? undefined : item}
            className="mx-auto mt-6 max-w-md text-lg font-light leading-relaxed text-foreground/90"
          >
            {t("home.hero.subtitle")}
          </motion.p>

          <motion.div
            variants={reduced ? undefined : item}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/catalog"
              className={cn(
                buttonVariants({ size: "lg" }),
                "btn-liquid btn-liquid-blue group/button h-12 rounded-full px-8 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              )}
            >
              <span className="relative z-[2] inline-flex items-center gap-2">
                {t("home.hero.ctaPrimary")}
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
                {t("home.hero.ctaSecondary")}
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue — a gentle hint that the page continues below. */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center">
          <span className="flex h-9 w-5 items-start justify-center rounded-full border border-brand/40 p-1">
            <motion.span
              className="h-1.5 w-1 rounded-full bg-brand"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </div>
      )}
    </section>
  );
}
