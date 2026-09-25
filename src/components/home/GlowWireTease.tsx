import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Flame } from "lucide-react";
import { GLOW_WIRE_POSTER } from "@/data/glow-wire";

/**
 * The glow-wire teaser layered over one category tile on the home page.
 *
 * Two parts, deliberately:
 *  - an ember badge that is always on, because it is the only half that touch
 *    devices ever see (Tailwind's `hover:` is gated on `@media (hover: hover)`);
 *  - the poster itself, cross-fading in over the product photo on hover or
 *    keyboard focus of the surrounding card link.
 *
 * Drop-in for any `relative` box inside an element carrying `group` — here the
 * square image well of a category card.
 */
export async function GlowWireTease() {
  const t = await getTranslations("glowWire");

  return (
    <>
      <div className="pointer-events-none absolute inset-0 scale-[0.96] bg-[#04091a]/95 opacity-0 transition-[opacity,transform] duration-500 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:scale-100">
        {/* Decorative here: the badge below carries the same claim as text, and
            the poster is described in full on the product pages. */}
        <Image
          src={GLOW_WIRE_POSTER.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 50vw"
          quality={90}
          className="object-contain"
        />
      </div>

      <span className="animate-ember pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-[#160a03]/85 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-300 backdrop-blur-sm">
        <Flame className="size-3.5" aria-hidden />
        <span className="sr-only">{t("label")} · </span>
        {t("badge")}
      </span>
    </>
  );
}
