"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Space-like backdrop for the hero.
 *
 * Sits inside the hero <section> (which clips it via `overflow-hidden`) and
 * layers over the white-blue textured "heaven" background — it does NOT replace
 * it. We paint two things in the brand blues:
 *   • a field of faint, light-blue stars that slowly twinkle, and
 *   • a few meteors that streak diagonally down-right with a fading tail.
 *
 * As the hero scrolls away the whole field drifts up at ~0.3× scroll speed and
 * fades out — a gentle parallax exit that gives the section depth. The handler
 * is rAF-throttled and only attached when motion is allowed.
 *
 * Data is generated from a fixed seed so the server and first client render
 * produce identical markup (no hydration mismatch). Motion follows the same
 * pattern as <HeavenBackground />: default to the reduced (static) state for
 * SSR, then relax it on mount. Meteors only render once motion is allowed, so
 * they never freeze mid-fall under `prefers-reduced-motion`.
 */

/** Tiny deterministic PRNG (mulberry32) — same seed ⇒ same sequence. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = {
  top: string;
  left: string;
  size: number;
  dur: number;
  delay: number;
  min: number;
  max: number;
};

type Meteor = {
  top: string;
  left: string;
  angle: number;
  length: number;
  dur: number;
  delay: number;
};

const rand = mulberry32(0x5e7);

const STARS: Star[] = Array.from({ length: 60 }, () => ({
  top: `${(rand() * 100).toFixed(2)}%`,
  left: `${(rand() * 100).toFixed(2)}%`,
  size: +(2 + rand() * 3).toFixed(2),
  dur: +(3 + rand() * 4).toFixed(2),
  delay: +(-rand() * 6).toFixed(2),
  min: +(0.4 + rand() * 0.3).toFixed(2),
  max: +(0.85 + rand() * 0.15).toFixed(2),
}));

// A handful of meteors, mostly in the upper area so the streak is long.
// Kept sparse and slow so streaks arrive occasionally rather than constantly.
const METEORS: Meteor[] = Array.from({ length: 5 }, () => ({
  top: `${(-5 + rand() * 55).toFixed(2)}%`,
  left: `${(20 + rand() * 80).toFixed(2)}%`,
  angle: +(210 + rand() * 14).toFixed(2),
  length: Math.round(70 + rand() * 90),
  dur: +(4.5 + rand() * 3).toFixed(2),
  delay: +(rand() * 8).toFixed(2),
}));

export function HeroStarfield() {
  const ref = useRef<HTMLDivElement>(null);
  // Start reduced so SSR/first paint is static; the effect relaxes it.
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Scroll parallax + fade: lag the field behind the page and dissolve it as
  // the hero leaves the viewport. Off entirely under reduced motion.
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const hero = el.parentElement;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const h = hero?.offsetHeight || window.innerHeight;
      const y = window.scrollY;
      const p = Math.min(Math.max(y / h, 0), 1);
      el.style.transform = `translate3d(0, ${(y * 0.3).toFixed(1)}px, 0)`;
      el.style.opacity = (1 - p).toFixed(3);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = "";
      el.style.opacity = "";
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden will-change-transform"
    >
      {STARS.map((s, i) => (
        <span
          key={i}
          className="vr-star"
          style={
            {
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              "--dur": `${s.dur}s`,
              "--delay": `${s.delay}s`,
              "--star-min": s.min,
              "--star-max": s.max,
            } as React.CSSProperties
          }
        />
      ))}

      {!reduced &&
        METEORS.map((m, i) => (
          <span
            key={i}
            className="vr-meteor"
            style={
              {
                top: m.top,
                left: m.left,
                "--angle": `${m.angle}deg`,
                "--len": `${m.length}px`,
                "--dur": `${m.dur}s`,
                "--delay": `${m.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  );
}
