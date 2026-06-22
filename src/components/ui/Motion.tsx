"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Framer-Motion scroll-choreography primitives for the dark redesign.
 *
 * Everything here animates only `transform`/`opacity` (no layout props → no
 * CLS) and collapses to a static, visible frame under `prefers-reduced-motion`.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "blur";

const HIDDEN: Record<RevealVariant, Record<string, number | string>> = {
  up: { opacity: 0, y: 40 },
  down: { opacity: 0, y: -40 },
  left: { opacity: 0, x: -48 },
  right: { opacity: 0, x: 48 },
  scale: { opacity: 0, scale: 0.92 },
  blur: { opacity: 0, y: 28, filter: "blur(14px)" },
};

/**
 * Entrance reveal that fires once when scrolled into view. Set `stagger` on a
 * parent and give children `<MotionItem>` to cascade them.
 */
export function MotionReveal({
  children,
  className,
  variant = "up",
  delay = 0,
  duration = 0.7,
  stagger,
  once = true,
  amount = 0.25,
  as = "div",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  /** When set, children using <MotionItem> cascade by this many seconds. */
  stagger?: number;
  once?: boolean;
  amount?: number;
  as?: keyof typeof motion;
} & React.ComponentProps<typeof motion.div>) {
  const reduced = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;

  if (reduced) {
    return (
      <Comp className={className} {...rest}>
        {children}
      </Comp>
    );
  }

  const variants: Variants = {
    hidden: HIDDEN[variant],
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: stagger
        ? { staggerChildren: stagger, delayChildren: delay }
        : { duration, ease: EASE, delay },
    },
  };

  return (
    <Comp
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** A single staggered child for a `MotionReveal` parent that sets `stagger`. */
export function MotionItem({
  children,
  className,
  variant = "up",
  duration = 0.6,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  duration?: number;
} & React.ComponentProps<typeof motion.div>) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className={className} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }
  const variants: Variants = {
    hidden: HIDDEN[variant],
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration, ease: EASE },
    },
  };
  return (
    <motion.div className={className} variants={variants} {...rest}>
      {children}
    </motion.div>
  );
}

/**
 * Scroll-linked vertical parallax. `speed` is the fraction of the element's
 * scroll travel it drifts (positive = slower/up, negative = faster).
 */
export function Parallax({
  children,
  className,
  speed = 0.2,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
} & Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={reduced ? undefined : { y }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Pointer-driven 3D tilt card. Disabled (flat) under reduced motion. Children
 * keep their own styling; this just wraps with perspective + rotation.
 */
export function TiltCard({
  children,
  className,
  max = 8,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  /** Max rotation in degrees. */
  max?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // `will-change: transform` is promoted only while the pointer is actually
  // over the card and removed on leave. Keeping it permanent forced a separate
  // compositing layer per card — fine for a few, ruinous for a grid of ~140 on
  // the catalog page.
  const onEnter = () => {
    if (reduced) return;
    const el = ref.current;
    if (el) el.style.willChange = "transform";
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(0)`;
  };
  const reset = () => {
    const el = ref.current;
    if (el) {
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
      el.style.willChange = "auto";
    }
  };

  return (
    <div
      ref={ref}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn("transition-transform duration-300 ease-out [transform-style:preserve-3d]", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
