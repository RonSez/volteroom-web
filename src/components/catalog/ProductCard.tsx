import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { type Product, NEUTRAL_FINISH_HEX, resolveSku } from "@/data/catalog";
import { getProductFinishes } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "./ProductImage";
import { FinishSwatch } from "./FinishSwatch";

export async function ProductCard({ product }: { product: Product }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("common");
  const finishes = await getProductFinishes(product);
  const primary = finishes[0];
  const minGang = product.gangs ? Math.min(...product.gangs) : 1;
  const sku = resolveSku(product, primary?.id, minGang);

  return (
    <Link
      href={`/catalog/${product.slug}`}
      className="floats group relative flex flex-col overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative overflow-hidden bg-gradient-to-b from-white to-secondary/50">
        <ProductImage
          imageUrl={product.imageUrl}
          alt={product.name[locale]}
          category={product.category}
          hex={primary?.hex ?? NEUTRAL_FINISH_HEX}
          gang={minGang}
          className="rounded-none transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/85 text-brand opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <h3 className="font-heading text-base font-semibold leading-snug">
            {product.name[locale]}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("priceFrom", { price: formatPrice(product.basePrice, locale) })}
          </p>
        </div>
        {finishes.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {finishes.slice(0, 7).map((f) => (
              <FinishSwatch key={f.id} finish={f} size="sm" title={f.name[locale]} />
            ))}
            {finishes.length > 7 && (
              <span className="text-xs text-muted-foreground">
                +{finishes.length - 7}
              </span>
            )}
          </div>
        ) : (
          sku && (
            <span className="font-mono text-xs text-muted-foreground">{sku}</span>
          )
        )}
      </div>
    </Link>
  );
}
