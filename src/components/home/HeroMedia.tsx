"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Slide =
  | { kind: "video"; src: string }
  | { kind: "image"; src: string; origin: string };

// Hero media reel: the brand video, then the three switch shots. Each slide
// cross-fades into the next every few seconds and slowly zooms (Ken Burns)
// while it's on screen. The image transform-origins are varied so each one
// pans toward a slightly different point for a more lifelike feel.
const SLIDES: Slide[] = [
  { kind: "video", src: "/brand/volteroom-background-video.mp4" },
  { kind: "image", src: "/brand/switch-pic-1.jpg", origin: "32% 38%" },
  { kind: "image", src: "/brand/switch-pic-2.jpg", origin: "68% 46%" },
  { kind: "image", src: "/brand/switch-pic-3.jpg", origin: "46% 66%" },
];

const INTERVAL_MS = 3000;

// Index of the video slide; the rest are images.
const VIDEO_INDEX = SLIDES.findIndex((s) => s.kind === "video");

export function HeroMedia() {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Always restart the brand video from 0 when it becomes the active slide,
  // so it plays a fresh 0→3s each turn rather than resuming mid-clip.
  useEffect(() => {
    if (active !== VIDEO_INDEX) return;
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => {});
  }, [active]);

  // Respect the user's reduced-motion preference: hold on the first slide.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % SLIDES.length),
      INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div className="absolute inset-0">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          aria-hidden={i !== active}
          className={cn(
            "hero-slide absolute inset-0 transition-opacity duration-[1200ms] ease-in-out",
            i === active ? "is-active opacity-100" : "opacity-0",
          )}
        >
          {slide.kind === "video" ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="hero-slide-media h-full w-full object-cover"
            >
              <source src={slide.src} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={slide.src}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="hero-slide-media object-cover"
              style={{ transformOrigin: slide.origin }}
              priority={i === 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}
