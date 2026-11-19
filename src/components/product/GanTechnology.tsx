import { useTranslations } from "next-intl";
import { Snowflake } from "lucide-react";

/**
 * The GaN (gallium nitride) note on the USB-charging mechanisms' pages, set
 * right under the product description. Cool-blue tint to match the
 * "GaN technology" badge on the home tile.
 */
export function GanTechnology() {
  const t = useTranslations("gan");

  return (
    <section className="mt-4 max-w-prose rounded-xl border border-sky-400/25 bg-sky-400/[0.06] p-4">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-sky-400">
        <Snowflake className="size-4" aria-hidden />
        {t("title")}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t("body")}</p>
    </section>
  );
}
