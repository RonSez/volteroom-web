"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The "floating in heaven" backdrop.
 *
 * A fixed, full-viewport layer that sits behind all content. It paints a few
 * large, blurred blue/cyan "clouds" over the static white sky from globals.css,
 * plus a faint film grain so the white never looks flat. The clouds drift on
 * their own (idle) and parallax with the pointer and scroll position.
 *
 * Motion is fully gated on `prefers-reduced-motion`: when reduced, the clouds
 * are rendered statically with no listeners and no animation.
 */

type Cloud = {
  top: string;
  left: string;
  size: string;
  color: string;
  opacity: number;
  /** pointer-parallax travel in px on each axis */
  dx: number;
  dy: number;
  /** scroll-parallax factor (multiplied by scrollY) */
  ds: number;
  /** idle drift duration / delay in seconds */
  dur: number;
  delay: number;
};

const CLOUDS: Cloud[] = [
  { top: "-12%", left: "58%", size: "52vw", color: "rgba(0,160,214,0.20)", opacity: 0.9, dx: 38, dy: 26, ds: 0.06, dur: 26, delay: 0 },
  { top: "18%", left: "-14%", size: "46vw", color: "rgba(3,105,161,0.16)", opacity: 0.85, dx: 30, dy: 20, ds: 0.04, dur: 32, delay: -6 },
  { top: "48%", left: "70%", size: "40vw", color: "rgba(0,160,214,0.14)", opacity: 0.8, dx: 26, dy: 18, ds: 0.05, dur: 29, delay: -12 },
  { top: "62%", left: "8%", size: "44vw", color: "rgba(255,255,255,0.85)", opacity: 0.7, dx: 18, dy: 14, ds: 0.03, dur: 36, delay: -3 },
  { top: "85%", left: "44%", size: "50vw", color: "rgba(3,105,161,0.10)", opacity: 0.75, dx: 22, dy: 16, ds: 0.045, dur: 30, delay: -18 },
];

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function HeavenBackground() {
  const ref = useRef<HTMLDivElement>(null);
  // Default to reduced so SSR/first paint is static; the effect relaxes it.
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let mx = 0;
    let my = 0;
    let sc = 0;

    const apply = () => {
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
      el.style.setProperty("--sc", `${sc}px`);
      raf = 0;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      schedule();
    };
    const onScroll = () => {
      sc = window.scrollY;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ "--mx": 0, "--my": 0, "--sc": "0px" } as React.CSSProperties}
    >
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="absolute will-change-transform"
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            transform: reduced
              ? undefined
              : `translate3d(calc(var(--mx) * ${c.dx}px), calc(var(--my) * ${c.dy}px + var(--sc) * ${c.ds}), 0)`,
            transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background: `radial-gradient(circle at 50% 45%, ${c.color} 0%, transparent 70%)`,
              filter: "blur(44px)",
              opacity: c.opacity,
              animation: reduced ? undefined : `vr-drift ${c.dur}s ease-in-out ${c.delay}s infinite`,
            }}
          />
        </div>
      ))}

      {/* Film grain so the white never reads as flat. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${GRAIN}")`,
          backgroundSize: "180px 180px",
          opacity: 0.04,
          mixBlendMode: "multiply",
        }}
      />

      {/* Faint floor shadow to keep the very top airy and ground the bottom. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -5%, transparent 55%, rgba(15,23,42,0.05) 100%)",
        }}
      />
    </div>
  );
}
