import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getFinishes } from "@/lib/catalog";
import { FinishSwatch } from "@/components/catalog/FinishSwatch";

export async function FinishesShowcase() {
  const locale = (await getLocale()) as Locale;
  const finishes = await getFinishes();

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-5">
      {finishes.map((f) => (
        <div key={f.id} className="group flex flex-col items-center gap-3 text-center">
          <span
            className="h-24 w-full rounded-xl shadow-[0_14px_30px_-18px_rgba(15,23,42,0.6)] ring-1 ring-foreground/10 transition-transform duration-300 group-hover:-translate-y-1"
            style={{ backgroundColor: f.hex }}
            aria-hidden
          />
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FinishSwatch finish={f} size="sm" title={f.name[locale]} />
            {f.name[locale]}
          </span>
        </div>
      ))}
    </div>
  );
}
