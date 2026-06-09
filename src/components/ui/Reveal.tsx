"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-into-view entrance wrapper.
 *
 * Renders its children in a block that starts faded + nudged down and settles
 * into place the first time it enters the viewport (one-shot — it never
 * re-hides on scroll-away). Pure transform/opacity, so there is zero layout
 * shift, and it only ever animates two properties.
 *
 * SSR-safe + flash-free: the hidden start state is gated in CSS on the
 * `data-reveal-ready` attribute, which a tiny inline script in the layout sets
 * before first paint. With JS disabled the attribute is never set, so content
 * renders fully visible. Under `prefers-reduced-motion` we skip straight to the
 * visible state.
 *
 * Entrance motion lives on this wrapper; any hover/press transform belongs on
 * the child element, so the two never fight over `transform`.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  style,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger offset in ms (e.g. index * 70 for a grid). */
  delay?: number;
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

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      // Fire a touch before the element is fully in view; reveal once.
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={{ "--reveal-delay": `${delay}ms`, ...style } as React.CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}
