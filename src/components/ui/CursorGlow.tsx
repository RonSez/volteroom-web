"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Site-wide custom cursor for the dark "liquid glass" theme.
 *
 * Two layers follow the pointer:
 *   • a small solid warm dot that tracks instantly;
 *   • a larger glow ring that lags behind with spring physics, grows + brightens
 *     when hovering an interactive element (link / button), and contracts on press.
 *
 * Fully guarded:
 *   • renders nothing on coarse/touch pointers (no native-cursor hijack on mobile);
 *   • renders nothing under `prefers-reduced-motion`;
 *   • `pointer-events-none`, so it never intercepts clicks.
 *
 * The native cursor is only hidden (globally, via a class on <html>) when this
 * component is actually mounted and active — so keyboard/touch users keep theirs.
 */
export function CursorGlow() {
  const [enabled, setEnabled] = useState(false);

  // Raw pointer position (instant) — drives the dot.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Springy follower — drives the lagging glow ring.
  const ringX = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 });
  const scale = useSpring(1, { stiffness: 320, damping: 24 });

  // Capability detection, kept reactive: enable only on a fine (mouse) pointer
  // with motion allowed, and re-evaluate if either changes. setState lives in
  // the subscription callback (not the effect body) so it never triggers a
  // synchronous cascading render.
  useEffect(() => {
    const fineMq = window.matchMedia("(pointer: fine)");
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(fineMq.matches && !reducedMq.matches);
    sync();
    fineMq.addEventListener("change", sync);
    reducedMq.addEventListener("change", sync);
    return () => {
      fineMq.removeEventListener("change", sync);
      reducedMq.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      // Grow the ring over interactive targets.
      const interactive = (e.target as Element | null)?.closest(
        "a, button, [role='button'], input, textarea, select, label, summary",
      );
      scale.set(interactive ? 2.4 : 1);
    };
    const down = () => scale.set(scale.get() * 0.7);
    const up = (e: PointerEvent) => {
      const interactive = (e.target as Element | null)?.closest(
        "a, button, [role='button']",
      );
      scale.set(interactive ? 2.4 : 1);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled, x, y, scale]);

  if (!enabled) return null;

  return (
    <>
      {/* Lagging glow ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
        style={{
          x: ringX,
          y: ringY,
          scale,
          translateX: "-50%",
          translateY: "-50%",
          border: "1px solid rgba(43, 164, 214, 0.7)",
          boxShadow:
            "0 0 18px 2px rgba(43, 164, 214,0.45), inset 0 0 12px rgba(92, 200, 234,0.35)",
          backgroundColor: "rgba(43, 164, 214, 0.06)",
          // No backdrop-filter: this element is re-positioned by a spring on
          // every pointer move, and a backdrop blur would force the browser to
          // re-sample what's behind it each frame for a barely-visible 1px blur.
        }}
      />
      {/* Instant core dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#eaf6ff] md:block"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          boxShadow: "0 0 10px 2px rgba(43, 164, 214,0.9)",
        }}
      />
    </>
  );
}
