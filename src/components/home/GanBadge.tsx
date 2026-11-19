import { getTranslations } from "next-intl/server";
import { Snowflake } from "lucide-react";

/**
 * "GaN technology" badge over the USB-charging tile on the home page — top
 * right, in the brand blue, with a snowflake for "stays cool while charging".
 * Drop-in for any `relative` box (the category card's image well).
 */
export async function GanBadge() {
  const t = await getTranslations("gan");

  return (
    <span className="pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-sky-400/40 bg-[#03101f]/85 px-2.5 py-1 text-[11px] font-bold tracking-wide text-sky-400 backdrop-blur-sm">
      <Snowflake className="size-3.5" aria-hidden />
      {t("badge")}
    </span>
  );
}
