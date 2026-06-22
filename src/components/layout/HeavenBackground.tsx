"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The glowing-mesh backdrop.
 *
 * A fixed, full-viewport layer that sits behind all content on the flat
 * near-black canvas. It is the SOLE source of the page's futuristic SAAS depth:
 * soft brand-blue aurora glows that bleed in from the edges and corners,
 * anchored by one larger glow spilling down from the top (the "hero light"
 * behind the fold), plus film grain so the blue never reads flat. The base
 * colour itself is a single solid token on <body> (globals.css) with no
 * vertical gradient — so there is nothing to band and the canvas stays perfectly
 * continuous; all variation lives here in these radial, low-alpha pools. The
 * glows drift on their own (idle) and parallax with the pointer and scroll
 * position, so the mesh breathes as you move through it.
 *
 * Motion is fully gated on `prefers-reduced-motion`: when reduced, every layer
 * is rendered statically with no listeners and no animation.
 */

type Glow = {
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

// The gradient mesh: soft pools of brand blue bleeding in from the edges of the
// near-black canvas. Light-only and low-alpha on purpose — no dark pools (those
// punched shadow patches read as bands) and no hard edges, so they add the
// glowing SAAS depth without ever dividing the page. The first, larger glow is
// the "hero light" spilling down from the top.
const GLOWS: Glow[] = [
  { top: "-30%", left: "50%", size: "94vw", color: "rgba(43,164,214,0.13)", opacity: 0.95, dx: 26, dy: 14, ds: 0.05, dur: 34, delay: 0 },
  { top: "6%", left: "90%", size: "60vw", color: "rgba(92,200,234,0.08)", opacity: 0.8, dx: 24, dy: 16, ds: 0.045, dur: 38, delay: -8 },
  { top: "48%", left: "-16%", size: "66vw", color: "rgba(43,130,190,0.075)", opacity: 0.8, dx: 20, dy: 13, ds: 0.035, dur: 42, delay: -4 },
  { top: "82%", left: "72%", size: "72vw", color: "rgba(43,164,214,0.06)", opacity: 0.75, dx: 18, dy: 12, ds: 0.03, dur: 46, delay: -12 },
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
      {/* No vertical depth gradient anywhere on purpose — not here and not on
          <body>. A near-black top→bottom ramp quantises into visible 8-bit
          horizontal bands over a tall page, and a viewport-fixed ramp also beats
          against the scrolling document into blocks. So the base stays a single
          flat solid (globals.css) and this layer carries only the glowing blue
          mesh + grain: radial pools that add depth without ever banding. */}

      {GLOWS.map((c, i) => (
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
              filter: "blur(70px)",
              opacity: c.opacity,
              animation: reduced ? undefined : `vr-drift ${c.dur}s ease-in-out ${c.delay}s infinite`,
            }}
          />
        </div>
      ))}

      {/* Film grain so the blue glows never read as flat. Rendered as a plain,
          slightly brighter overlay (no blend mode, which would force a full
          re-blend of the animating layers every frame) and left to composite as
          a static, cached layer. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${GRAIN}")`,
          backgroundSize: "180px 180px",
          opacity: 0.05,
        }}
      />

      {/* No edge vignette: a viewport-fixed darkening of the lower edge re-darkens
          the bottom of every screen as you scroll, which is exactly what reads as
          a repeating block seam. The page's depth comes entirely from the soft
          blue glows above, over the flat solid base. */}
    </div>
  );
}
