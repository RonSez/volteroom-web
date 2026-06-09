"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus, Trash2, ShoppingBag, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { type Product, type Finish, NEUTRAL_FINISH_HEX, resolveSku } from "@/data/catalog";
import { formatPrice } from "@/lib/format";
import { useBasket, useHydrated, type BasketItem } from "@/lib/store/basket";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function BasketView({
  products,
  finishes,
}: {
  products: Product[];
  finishes: Finish[];
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("basket");
  const hydrated = useHydrated();
  const items = useBasket((s) => s.items);
  const clear = useBasket((s) => s.clear);

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.slug, p])),
    [products],
  );
  const finishMap = useMemo(
    () => new Map(finishes.map((f) => [f.id, f])),
    [finishes],
  );

  if (!hydrated) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-20 text-center">
        <ShoppingBag className="mx-auto size-10 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">{t("empty")}</p>
        <Link href="/catalog" className={cn(buttonVariants(), "mt-6 bg-brand text-brand-foreground hover:bg-brand/90")}>
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => {
    const p = productMap.get(item.slug);
    return sum + (p ? p.basePrice * item.qty : 0);
  }, 0);
  const totalCount = items.reduce((n, i) => n + i.qty, 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        {items.map((item) => (
          <BasketLine
            key={item.id}
            item={item}
            locale={locale}
            product={productMap.get(item.slug)}
            finish={item.finishId ? finishMap.get(item.finishId) : undefined}
          />
        ))}
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
          {t("clear")}
        </button>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold">{t("summaryTitle")}</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>{t("items", { count: totalCount })}</dt>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>{t("total")}</dt>
              <dd className="tabular-nums">{formatPrice(subtotal, locale)}</dd>
            </div>
          </dl>

          <p className="mt-4 rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
            {t("note")}
          </p>

          <Link href="/contact" className={cn(buttonVariants(), "mt-4 h-11 w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90")}>
            <MapPin className="size-4" />
            {t("enquireCta")}
          </Link>
          <Link href="/catalog" className={cn(buttonVariants({ variant: "ghost" }), "mt-2 w-full")}>
            {t("continueShopping")}
          </Link>
        </div>
      </aside>
    </div>
  );
}

function BasketLine({
  item,
  locale,
  product,
  finish,
}: {
  item: BasketItem;
  locale: Locale;
  product: Product | undefined;
  finish: Finish | undefined;
}) {
  const t = useTranslations("basket");
  const tp = useTranslations("product");
  const setQty = useBasket((s) => s.setQty);
  const removeItem = useBasket((s) => s.removeItem);

  if (!product) return null;

  const sku = resolveSku(product, item.finishId, item.gang);

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="w-24 shrink-0 sm:w-28">
        <ProductVisual
          category={product.category}
          hex={finish?.hex ?? NEUTRAL_FINISH_HEX}
          gang={item.gang ?? 1}
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/catalog/${product.slug}`}
              className="font-heading font-semibold leading-snug hover:text-brand"
            >
              {product.name[locale]}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              {finish ? finish.name[locale] : tp(`kindLabel.${product.kind}`)}
              {item.gang ? ` · ${tp("gangUnit", { count: item.gang })}` : ""}
            </p>
            {sku && (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{sku}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            aria-label={t("remove")}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="inline-flex items-center rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setQty(item.id, item.qty - 1)}
              aria-label="−"
              className="grid size-8 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
              disabled={item.qty <= 1}
            >
              <Minus className="size-4" />
            </button>
            <span className="w-9 text-center text-sm font-medium tabular-nums">{item.qty}</span>
            <button
              type="button"
              onClick={() => setQty(item.id, item.qty + 1)}
              aria-label="+"
              className="grid size-8 place-items-center text-muted-foreground hover:text-foreground"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <p className="font-semibold tabular-nums">
            {formatPrice(product.basePrice * item.qty, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}
