"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Flame, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { GLOW_WIRE_POSTER } from "@/data/glow-wire";
import { cn } from "@/lib/utils";

/**
 * The 850 °C glow-wire safety poster with its localized explanation.
 *
 * The client's artwork carries its own headline, temperature and call-out baked
 * in, so nothing is ever composited over it — the copy sits beside it instead.
 * Both variants render it below its 360px native width so it stays crisp, and
 * open the lightbox on tap, which is the only way the baked-in text is readable
 * on a phone.
 *
 * `full` — the block on a mechanism's product page: the whole argument.
 * `compact` — a banner for the sockets category page, which already makes the
 *   fire-safety point in its own copy further down; here the picture and the
 *   claim are what's wanted, not the explanation a second time. It stays a row
 *   at every width so it doesn't push the product grid off a phone screen.
 */
export function GlowWireTest({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const t = useTranslations("glowWire");
  const [open, setOpen] = useState(false);
  const compact = variant === "compact";

  return (
    <>
      {/* Ember-tinted shell: the one warm surface on an otherwise azure page,
          so it reads as a claim rather than another spec panel. */}
      <section
        className={cn(
          "overflow-hidden rounded-xl border border-amber-500/25 bg-muted/30 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(194,65,12,0.18),transparent_62%)]",
          !compact && "mt-8",
        )}
      >
        <div
          className={cn(
            "flex gap-5 p-5",
            compact ? "items-center" : "flex-col sm:flex-row sm:items-start",
          )}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("enlarge")}
            className={cn(
              "group relative shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10 transition-shadow duration-300 hover:shadow-[0_0_34px_-8px_rgba(251,146,60,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
              compact ? "w-[110px] sm:w-[124px]" : "w-[180px] self-center sm:self-start",
            )}
          >
            <Image
              src={GLOW_WIRE_POSTER.src}
              alt={t("alt")}
              width={GLOW_WIRE_POSTER.width}
              height={GLOW_WIRE_POSTER.height}
              sizes={compact ? "124px" : "180px"}
              quality={90}
              className="h-auto w-full"
            />
            <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
              <Maximize2 className={compact ? "size-5 text-white" : "size-6 text-white"} />
            </span>
          </button>

          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-400">
              <Flame className="size-3.5" />
              {t("eyebrow")}
            </p>
            <h2
              className={cn(
                "mt-1.5 font-heading font-semibold",
                compact ? "text-base sm:text-lg" : "text-base",
              )}
            >
              {t("title")}
            </h2>
            {!compact && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("body")}</p>
            )}
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("note")}</p>
          </div>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton
          className="w-auto max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-none"
        >
          <DialogTitle className="sr-only">{t("title")}</DialogTitle>
          {/* The poster is 9:16, so the height cap is expressed as a width too
              — otherwise it overflows a short window. */}
          <Image
            src={GLOW_WIRE_POSTER.src}
            alt={t("alt")}
            width={GLOW_WIRE_POSTER.width}
            height={GLOW_WIRE_POSTER.height}
            sizes="360px"
            quality={90}
            className="h-auto w-[min(360px,80vw,46svh)] rounded-xl shadow-2xl"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
