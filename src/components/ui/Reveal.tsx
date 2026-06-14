"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-into-view entrance wrapper.
 *
 * Renders its children in a block that starts faded + nudged down and settles
 * into place when it enters the viewport. The animation repeats: once the
 * element scrolls *fully* out of view it resets to the hidden state, so
 * scrolling back replays it. Pure transform/opacity, so there is zero layout
 * shift, and it only ever animates two properties.
 *
 * Reveal fires at ~15% visible; the reset only fires at 0% (fully gone), so the
 * two never fight at the boundary and the reverse fade always happens
 * off-screen.
 *
 * SSR-safe + flash-free: the hidden start state is gated in CSS on the
 * `data-reveal-ready` attribute, which a tiny inline script in the layout sets
 * before first paint. With JS disabled the attribute is never set, so content
 * renders fully visible. Under `prefers-reduced-motion` we skip straight to the
 * visible state.
 *
 * Entrance motion lives on this wrapper; any hover/press transform belongs on
 * the child element, so the two never fight over `transform`.
 *
 * `variant` picks the hidden start state (all share the same opacity fade):
 *   • `fade-up`    — default; nudged 16px down
 *   • `fade-left`  — slides in from the left
 *   • `fade-right` — slides in from the right
 *   • `scale`      — settles up from 94%
 *   • `blur`       — fade-up plus a soft de-blur
 * The resolved states all live in CSS, gated on `data-variant`.
 */
export type RevealVariant = "fade-up" | "fade-left" | "fade-right" | "scale" | "blur";

export function Reveal({
  children,
  className,
  delay = 0,
  variant = "fade-up",
  style,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger offset in ms (e.g. index * 70 for a grid). */
  delay?: number;
  /** Hidden start state. Defaults to a subtle fade-up. */
  variant?: RevealVariant;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

    // Reveal at 15% visible; reset only once the element is fully gone. The gap
    // between the two thresholds is the hysteresis band where state is held.
    const REVEAL_RATIO = 0.15;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= REVEAL_RATIO) {
            entry.target.classList.add("is-visible");
          } else if (!entry.isIntersecting) {
            // Fully out of view — reset so it replays on re-entry (off-screen,
            // so the reverse fade is never seen).
            entry.target.classList.remove("is-visible");
          }
        }
      },
      { threshold: [0, REVEAL_RATIO] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      data-variant={variant === "fade-up" ? undefined : variant}
      style={{ "--reveal-delay": `${delay}ms`, ...style } as React.CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}
