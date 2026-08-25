import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  type Product,
  type FinishId,
  NEUTRAL_FINISH_HEX,
  DEFAULT_FINISH_ID,
  resolveSku,
} from "@/data/catalog";
import { getProductFinishes } from "@/lib/catalog";
import { formatPrice, formatPriceExclVat } from "@/lib/format";
import { ProductImage } from "./ProductImage";
import { FinishSwatch } from "./FinishSwatch";
import { TiltCard } from "@/components/ui/Motion";

export async function ProductCard({
  product,
  selectedFinish,
  gang,
}: {
  product: Product;
  /** When the catalog is filtered by finish, show that finish's photo/swatch. */
  selectedFinish?: FinishId;
  /** Pin the card to one gang size of a multi-gang product (the frames). */
  gang?: number;
}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("common");
  const tp = await getTranslations("product");
  const finishes = await getProductFinishes(product);
  // Show the selected finish when it applies to this product, else the default
  // finish (falling back to the first when a product doesn't offer it).
  const active =
    (selectedFinish && finishes.find((f) => f.id === selectedFinish)) ||
    finishes.find((f) => f.id === DEFAULT_FINISH_ID) ||
    finishes[0];
  const cardGang = gang ?? (product.gangs ? Math.min(...product.gangs) : 1);
  const sku = resolveSku(product, active?.id, cardGang);

  // With a finish selected, show that finish's front photo (its tinted
  // placeholder if none exists); otherwise the default catalogue thumbnail.
  // A per-gang card (the frames) additionally pins the photo to its size.
  const photo = (finishId?: FinishId) =>
    product.images?.find(
      (im) =>
        (im.view ?? "front") !== "diagram" &&
        (!finishId || im.finishId === finishId) &&
        (!gang || im.gang === gang),
    )?.url;
  const imageUrl = gang
    ? photo(active?.id) ?? photo()
    : selectedFinish && active
      ? photo(active.id)
      : product.imageUrl;

  // Carry the catalogue's selection (colour, gang size) into the product page.
  const params = new URLSearchParams();
  if (selectedFinish) params.set("finish", selectedFinish);
  if (gang) params.set("gang", String(gang));
  const query = params.size ? `?${params}` : "";

  return (
    <TiltCard className="h-full">
    <Link
      href={`/catalog/${product.slug}${query}`}
      className="floats group relative flex h-full flex-col overflow-hidden rounded-2xl transition-[box-shadow] duration-300 hover:shadow-[0_0_50px_-12px_rgba(43, 164, 214,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative overflow-hidden bg-gradient-to-b from-[#101a2e] to-[#070d1b]">
        <ProductImage
          imageUrl={imageUrl}
          alt={product.name[locale]}
          category={product.category}
          hex={active?.hex ?? NEUTRAL_FINISH_HEX}
          gang={cardGang}
          className="rounded-none transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="glass absolute right-3 top-3 grid size-8 place-items-center rounded-full text-brand opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <h3 className="font-heading text-base font-semibold leading-snug">
            {product.name[locale]}
            {gang ? ` · ${tp("gangUnit", { count: gang })}` : ""}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("priceFrom", { price: formatPrice(product.basePrice, locale) })}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatPriceExclVat(product.basePrice, locale)} {t("exclVat")}
          </p>
        </div>
        {finishes.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {finishes.slice(0, 7).map((f) => (
              <FinishSwatch
                key={f.id}
                finish={f}
                size="sm"
                selected={f.id === selectedFinish}
                title={f.name[locale]}
              />
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
    </TiltCard>
  );
}
