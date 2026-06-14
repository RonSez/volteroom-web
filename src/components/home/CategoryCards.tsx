import { getLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCategories } from "@/lib/catalog";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Reveal } from "@/components/ui/Reveal";

const REPRESENTATIVE_HEX = "#3B3E43"; // matte titanium

export async function CategoryCards() {
  const locale = (await getLocale()) as Locale;
  const categories = await getCategories();

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat, i) => (
        <Reveal
          key={cat.id}
          delay={i * 70}
          variant={i % 2 === 0 ? "fade-left" : "fade-right"}
          className="h-full"
        >
        <Link
          href={`/catalog?category=${cat.id}`}
          className="floats group flex h-full flex-col overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="relative overflow-hidden bg-gradient-to-b from-white to-secondary/60">
            <ProductVisual
              category={cat.id}
              hex={REPRESENTATIVE_HEX}
              className="rounded-none transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              {cat.name[locale]}
            </h3>
            <p className="mt-1 flex-1 text-sm font-light leading-relaxed text-muted-foreground">
              {cat.tagline[locale]}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              {cat.name[locale]}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
        </Reveal>
      ))}
    </div>
  );
}
