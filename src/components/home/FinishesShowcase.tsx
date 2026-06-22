import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getFinishes } from "@/lib/catalog";
import { FinishSwatch } from "@/components/catalog/FinishSwatch";
import { Reveal } from "@/components/ui/Reveal";

export async function FinishesShowcase() {
  const locale = (await getLocale()) as Locale;
  const finishes = await getFinishes();

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-6">
      {finishes.map((f, i) => (
        <Reveal
          key={f.id}
          delay={i * 50}
          className="group flex w-[calc(50%-0.5rem)] flex-col items-center gap-3 text-center sm:w-40 md:w-44"
        >
          <span
            className="h-24 w-full rounded-xl shadow-[0_14px_30px_-18px_rgba(15,23,42,0.6)] ring-1 ring-foreground/10 transition-transform duration-300 group-hover:-translate-y-1"
            style={{ backgroundColor: f.hex }}
            aria-hidden
          />
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FinishSwatch finish={f} size="sm" title={f.name[locale]} />
            {f.name[locale]}
          </span>
        </Reveal>
      ))}
    </div>
  );
}
