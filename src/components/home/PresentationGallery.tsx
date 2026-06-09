"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { presentationSlides } from "@/lib/site";
import { cn } from "@/lib/utils";

export function PresentationGallery() {
  const t = useTranslations("home.gallery");
  const [active, setActive] = useState<number | null>(null);
  const slides = presentationSlides;

  const open = active !== null;
  const go = (dir: number) =>
    setActive((cur) =>
      cur === null ? cur : (cur + dir + slides.length) % slides.length,
    );

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setActive(i)}
            className="floats group relative aspect-video overflow-hidden rounded-xl ring-offset-background transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            aria-label={`${t("title")} ${slide.id}`}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent
          showCloseButton
          className="max-w-5xl border-none bg-transparent p-0 shadow-none sm:max-w-5xl"
        >
          <DialogTitle className="sr-only">{t("title")}</DialogTitle>
          {active !== null && (
            <div className="relative">
              <div className="overflow-hidden rounded-xl bg-card shadow-2xl">
                <Image
                  src={slides[active].src}
                  alt=""
                  width={1440}
                  height={810}
                  className="h-auto w-full"
                />
              </div>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous"
                className="absolute left-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next"
                className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="mt-3 flex justify-center gap-1.5">
                {slides.map((s, i) => (
                  <span
                    key={s.id}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === active ? "w-6 bg-brand" : "w-1.5 bg-white/50",
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
