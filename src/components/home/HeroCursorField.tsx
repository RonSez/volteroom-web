"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive constellation field for the hero.
 *
 * A single <canvas> layered over the starfield. Brand-blue particles drift
 * gently and link to their neighbours; the whole field reacts to the pointer:
 *   • cursor MOVEMENT — particles within range are pushed away from the
 *     pointer, a soft glow trails it, and links near it brighten;
 *   • cursor CLICKS — a shockwave ring expands from the click point and shoves
 *     every particle it passes outward, then fades.
 *
 * The canvas is `pointer-events-none`, so it never intercepts clicks on the
 * hero CTAs — pointer state is read from window listeners and mapped into
 * canvas space. Under `prefers-reduced-motion` we paint one static frame and
 * skip the animation loop and all pointer reactivity.
 */

// Brand palette (matches .vr-star in globals.css) — bright on the black void.
const CORE = "220, 238, 250"; // light cyan
const HALO = "43, 164, 214"; // #38BDF8

const LINK_DIST = 132; // px: max distance a link is drawn
const CURSOR_RADIUS = 150; // px: pointer repulsion / glow reach
const MAX_SPEED = 2.4; // px/frame velocity clamp

type Particle = {
  hx: number; // home x — the rest position the spring pulls back to
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number; // dot radius
  phase: number; // for the autonomous idle wobble
  drift: number; // wobble amplitude
};

type Ripple = { x: number; y: number; r: number; life: number };

export function HeroCursorField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    const ripples: Ripple[] = [];

    // Smoothed pointer. `strength` eases 0→1 as the pointer enters/leaves the
    // hero so repulsion and glow fade in and out instead of snapping.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, inside: false };

    // Seed particles for the current size; density scales with area.
    // Capped fairly low: the link pass is O(n²), so each extra particle costs
    // quadratically. 64 keeps the constellation lush while halving the work of
    // the previous 96 cap.
    const seed = () => {
      const count = Math.min(64, Math.round((width * height) / 20000));
      particles = Array.from({ length: count }, () => {
        const hx = Math.random() * width;
        const hy = Math.random() * height;
        return {
          hx,
          hy,
          x: hx,
          y: hy,
          vx: 0,
          vy: 0,
          r: 1.1 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
          drift: 6 + Math.random() * 10,
        };
      });
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    resize();

    // ── Pointer wiring (window-level so the canvas stays click-through) ──
    const toLocal = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      return { x, y, inside };
    };

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      pointer.inside = p.inside;
      if (p.inside) {
        pointer.tx = p.x;
        pointer.ty = p.y;
      }
    };

    const onDown = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      if (!p.inside) return;
      // Snap the glow to the click and spawn an expanding shockwave.
      pointer.tx = p.x;
      pointer.ty = p.y;
      pointer.x = p.x;
      pointer.y = p.y;
      ripples.push({ x: p.x, y: p.y, r: 0, life: 1 });
    };

    let t = 0;
    let raf = 0;

    const frame = () => {
      t += 1;

      // Ease pointer position + influence.
      pointer.x += (pointer.tx - pointer.x) * 0.18;
      pointer.y += (pointer.ty - pointer.y) * 0.18;
      pointer.strength += ((pointer.inside ? 1 : 0) - pointer.strength) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Advance ripples; drop spent ones.
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 7;
        rp.life -= 0.018;
        if (rp.life <= 0) ripples.splice(i, 1);
      }

      // ── Integrate particles ──
      for (const p of particles) {
        // Home position breathes a little so the field is alive when idle.
        const hx = p.hx + Math.sin(t * 0.006 + p.phase) * p.drift;
        const hy = p.hy + Math.cos(t * 0.005 + p.phase) * p.drift;

        // Weak spring back toward home keeps the field evenly spread.
        p.vx += (hx - p.x) * 0.012;
        p.vy += (hy - p.y) * 0.012;

        // Cursor repulsion.
        if (pointer.strength > 0.01) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < CURSOR_RADIUS) {
            const f = (1 - dist / CURSOR_RADIUS) * 2.2 * pointer.strength;
            p.vx += (dx / dist) * f;
            p.vy += (dy / dist) * f;
          }
        }

        // Ripple shove — only particles near the expanding ring get kicked.
        for (const rp of ripples) {
          const dx = p.x - rp.x;
          const dy = p.y - rp.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (Math.abs(dist - rp.r) < 26) {
            const f = rp.life * 3.4;
            p.vx += (dx / dist) * f;
            p.vy += (dy / dist) * f;
          }
        }

        // Damp + clamp + integrate.
        p.vx *= 0.9;
        p.vy *= 0.9;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > MAX_SPEED) {
          p.vx = (p.vx / sp) * MAX_SPEED;
          p.vy = (p.vy / sp) * MAX_SPEED;
        }
        p.x += p.vx;
        p.y += p.vy;
      }

      // ── Links ──
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DIST) continue;
          let alpha = (1 - dist / LINK_DIST) * 0.22;
          // Brighten links near the pointer.
          if (pointer.strength > 0.01) {
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const pd = Math.hypot(mx - pointer.x, my - pointer.y);
            if (pd < CURSOR_RADIUS) {
              alpha += (1 - pd / CURSOR_RADIUS) * 0.4 * pointer.strength;
            }
          }
          ctx.strokeStyle = `rgba(${HALO}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // ── Particles (halo + core) ──
      for (const p of particles) {
        ctx.fillStyle = `rgba(${HALO}, 0.18)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${CORE}, 0.9)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Cursor glow ──
      if (pointer.strength > 0.01) {
        const g = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          CURSOR_RADIUS,
        );
        g.addColorStop(0, `rgba(${HALO}, ${0.16 * pointer.strength})`);
        g.addColorStop(1, `rgba(${HALO}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, CURSOR_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Ripple rings ──
      for (const rp of ripples) {
        ctx.strokeStyle = `rgba(${HALO}, ${rp.life * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = window.requestAnimationFrame(frame);
    };

    // Draw a single static frame (no motion, no reactivity).
    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > LINK_DIST) continue;
          ctx.strokeStyle = `rgba(${HALO}, ${(1 - dist / LINK_DIST) * 0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      for (const p of particles) {
        ctx.fillStyle = `rgba(${CORE}, 0.85)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) drawStatic();
    });
    ro.observe(parent);

    // Run the loop only when it can actually be seen: the tab is visible AND
    // the hero is in (or near) the viewport. Scrolling the hero away — or
    // hiding the tab — stops the per-frame O(n²) work entirely.
    let onScreen = true;
    const running = () => !reduced && !document.hidden && onScreen;
    const start = () => {
      if (running() && !raf) raf = window.requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const sync = () => (running() ? start() : stop());

    const onVisibility = () => sync();

    // Pause once the hero is comfortably out of view (200px margin so it's
    // already running again just before it scrolls back in).
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "200px" },
    );

    if (reduced) {
      drawStatic();
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      io.observe(parent);
      raf = window.requestAnimationFrame(frame);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
