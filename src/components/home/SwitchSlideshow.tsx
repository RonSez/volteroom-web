"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideText {
  title: string;
  caption: string;
}

const AUTOPLAY_MS = 3000;

export function SwitchSlideshow({ images }: { images: string[] }) {
  const t = useTranslations("home.switchShowcase");
  const items = t.raw("items") as SlideText[];

  // Pair each text with its image; ignore any count mismatch defensively.
  const slides = items.map((text, i) => ({ ...text, src: images[i] }));
  const count = slides.length;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  const go = (dir: number) => setActive((cur) => (cur + dir + count) % count);

  // Respect the user's reduced-motion preference.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Autoplay — paused on hover/focus and for reduced-motion users.
  useEffect(() => {
    if (paused || reduced || count < 2) return;
    const id = window.setInterval(
      () => setActive((cur) => (cur + 1) % count),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(id);
  }, [paused, reduced, count]);

  if (count === 0) return null;

  const slide = slides[active];
  // Odd slides (slide 2) sit on the right and enter from the right; the rest
  // sit on the left and enter from the left. Text always rises up from below.
  const imageRight = active % 2 === 1;

  return (
    <div
      className="relative"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Clip the entrance offset so it never spills into the page. */}
      <div className="overflow-hidden">
        {/* Re-key on `active` so the enter animations replay every change. */}
        <div
          key={active}
          className="grid items-center gap-8 sm:gap-10 md:grid-cols-2 lg:gap-16"
          aria-roledescription="slide"
        >
          {/* Image — slides in from the matching side. */}
          <div
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm",
              imageRight ? "md:order-2" : "md:order-1",
              !reduced &&
                "animate-in fade-in duration-700 fill-mode-both " +
                  (imageRight
                    ? "slide-in-from-right-16"
                    : "slide-in-from-left-16"),
            )}
          >
            {slide.src && (
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority={active === 0}
              />
            )}
          </div>

          {/* Text — rises up from below. */}
          <div
            className={cn(
              "max-w-xl",
              imageRight ? "md:order-1" : "md:order-2",
              !reduced &&
                "animate-in fade-in slide-in-from-bottom-12 duration-700 delay-150 fill-mode-both",
            )}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </p>
            <h3 className="font-heading text-2xl font-bold sm:text-3xl">
              {slide.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {slide.caption}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {count > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active
                    ? "w-6 bg-brand"
                    : "w-1.5 bg-border hover:bg-muted-foreground/40",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}

      {/* Announce the active slide for assistive tech. */}
      <div className="sr-only" aria-live="polite">
        {slide.title}
      </div>
    </div>
  );
}
