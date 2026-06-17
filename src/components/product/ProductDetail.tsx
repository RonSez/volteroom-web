"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ShoppingBag, Layers, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  type Product,
  type Finish,
  type ProductView,
  type ProductImageInfo,
  SPEC_ORDER,
  resolveSku,
  NEUTRAL_FINISH_HEX,
} from "@/data/catalog";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/catalog/ProductImage";
import { FinishSwatch } from "@/components/catalog/FinishSwatch";
import { Button, buttonVariants } from "@/components/ui/button";
import { useBasket } from "@/lib/store/basket";
import { cn } from "@/lib/utils";

const VIEW_ORDER: Record<ProductView, number> = { front: 0, back: 1, diagram: 2 };

/** Pretty-print a spec value (e.g. ip41 → IP41). */
function formatSpec(key: string, value: string): string {
  if (key === "protectionDegree") return value.replace(/ip(\d+)/gi, "IP$1");
  return value;
}

export function ProductDetail({
  product,
  finishes,
}: {
  product: Product;
  finishes: Finish[];
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");
  const tc = useTranslations("common");

  const hasFinish = finishes.length > 0;
  const [finishId, setFinishId] = useState(hasFinish ? finishes[0].id : undefined);
  const [gang, setGang] = useState(product.gangs ? product.gangs[0] : undefined);
  const addItem = useBasket((s) => s.addItem);

  const finish = finishes.find((f) => f.id === finishId);
  const swatchHex = finish?.hex ?? NEUTRAL_FINISH_HEX;
  const sku = resolveSku(product, finishId, gang);

  // Gallery images for the current selection: front photos can be per-finish,
  // frame diagrams are per-gang. Images with neither set apply to all.
  const images = useMemo(() => {
    if (!product.images?.length) return [];
    return product.images
      .filter(
        (im) =>
          (!im.finishId || im.finishId === finishId) &&
          (!im.gang || im.gang === gang),
      )
      .sort(
        (a, b) =>
          (VIEW_ORDER[a.view ?? "front"] ?? 9) -
          (VIEW_ORDER[b.view ?? "front"] ?? 9),
      );
  }, [product.images, finishId, gang]);

  function add() {
    addItem({ slug: product.slug, finishId, gang });
    toast.success(tc("added"), { description: product.name[locale] });
  }

  // Characteristics in the client's numbered order; only populated rows.
  const specRows = SPEC_ORDER.flatMap((key) => {
    const value =
      key === "color"
        ? product.kind === "mechanism"
          ? product.specs?.color
          : finish?.name[locale]
        : product.specs?.[key];
    return value ? [[key, t(`specs.${key}`), formatSpec(key, value)] as const] : [];
  });

  const priceLabel =
    product.kind === "frame"
      ? tc("priceFrom", { price: formatPrice(product.basePrice, locale) })
      : formatPrice(product.basePrice, locale);

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Gallery
          key={`${finishId ?? "none"}-${gang ?? 0}`}
          images={images}
          alt={product.name[locale]}
          category={product.category}
          hex={swatchHex}
          gang={gang ?? (product.gangs ? product.gangs[0] : 1)}
        />
      </div>

      {/* Details */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">
            {product.name[locale]}
          </h1>
          {sku && (
            <span className="shrink-0 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-right">
              <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                {t("article")}
              </span>
              <span className="font-mono text-sm font-medium">{sku}</span>
            </span>
          )}
        </div>

        <p className="mt-3 text-2xl font-semibold tabular-nums">{priceLabel}</p>
        <p className="mt-4 max-w-prose leading-relaxed text-muted-foreground">
          {product.description[locale]}
        </p>

        {/* Covers/buttons ship without a frame — except the double socket cover
            E08ZB203, which is designed to mount without one. */}
        {product.kind === "cover" && product.slug !== "e08zb203" && (
          <p className="mt-3 max-w-prose text-sm font-medium text-foreground/90">
            {t("frameNotIncluded")}
          </p>
        )}

        {/* Finish */}
        {hasFinish && (
          <div className="mt-8">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              {t("finish")}
              {finish && (
                <span className="font-normal text-muted-foreground">
                  · {finish.name[locale]}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {finishes.map((f) => (
                <FinishSwatch
                  key={f.id}
                  finish={f}
                  selected={f.id === finishId}
                  onClick={() => setFinishId(f.id)}
                  title={f.name[locale]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Gang */}
        {product.gangs && (
          <div className="mt-7">
            <div className="mb-3 text-sm font-semibold">{t("gang")}</div>
            <div className="flex flex-wrap gap-2">
              {product.gangs.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGang(g)}
                  className={cn(
                    "min-w-10 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    g === gang
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-card hover:border-brand/50",
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to basket */}
        <div className="mt-8">
          <Button
            onClick={add}
            className="h-12 w-full gap-2 bg-brand text-base text-brand-foreground hover:bg-brand/90 sm:w-auto sm:px-8"
          >
            <ShoppingBag className="size-5" />
            {tc("addToBasket")}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">{t("priceNote")}</p>
        </div>

        {/* Three-part system callout */}
        <ThreePartCallout kind={product.kind} category={product.category} t={t} />

        {/* Technical characteristics */}
        {specRows.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-base font-semibold">{t("specsTitle")}</h2>
            <dl className="mt-3 divide-y divide-border rounded-xl border border-border">
              {specRows.map(([key, label, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-[10rem_1fr] gap-4 px-4 py-3 text-sm"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Gallery({
  images,
  alt,
  category,
  hex,
  gang,
}: {
  images: ProductImageInfo[];
  alt: string;
  category: Product["category"];
  hex: string;
  gang: number;
}) {
  // Slide 0 is the main photo. Until a real (non-diagram) photo is uploaded it
  // stays the placeholder, with the line diagrams following it. A `null` url
  // renders the SVG placeholder; diagrams are letterboxed (not cropped).
  const hasMain = images.some((im) => (im.view ?? "front") !== "diagram");
  const photoSlides = images.map((im) => ({
    url: im.url,
    diagram: (im.view ?? "front") === "diagram",
  }));
  const slides: { url: string | null; diagram: boolean }[] = hasMain
    ? photoSlides
    : [{ url: null, diagram: false }, ...photoSlides];

  const [active, setActive] = useState(0);
  const count = slides.length;
  const current = slides[Math.min(active, count - 1)];
  const go = (dir: number) => setActive((cur) => (cur + dir + count) % count);

  return (
    <div>
      <div className="relative">
        <ProductImage
          imageUrl={current?.url ?? undefined}
          alt={alt}
          category={category}
          hex={hex}
          gang={gang}
          sizes="(min-width: 1024px) 50vw, 100vw"
          contain={current?.diagram}
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="mt-3 flex gap-3">
          {slides.map((slide, i) => (
            <button
              key={slide.url ?? `placeholder-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative size-20 overflow-hidden rounded-lg border-2 transition-colors",
                i === active ? "border-brand" : "border-border hover:border-brand/50",
              )}
            >
              <ProductImage
                imageUrl={slide.url ?? undefined}
                alt={`${alt} ${i + 1}`}
                category={category}
                hex={hex}
                gang={gang}
                className="rounded-md"
                sizes="80px"
                contain={slide.diagram}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ThreePartCallout({
  kind,
  category,
  t,
}: {
  kind: Product["kind"];
  category: Product["category"];
  t: ReturnType<typeof useTranslations>;
}) {
  const links =
    kind === "mechanism"
      ? [
          { href: `/catalog?kind=cover&category=${category}`, label: t("viewCovers") },
          { href: "/catalog?category=frames", label: t("viewFrames") },
        ]
      : kind === "cover"
        ? [
            { href: `/catalog?kind=mechanism&category=${category}`, label: t("viewMechanisms") },
            { href: "/catalog?category=frames", label: t("viewFrames") },
          ]
        : [
            { href: "/catalog?kind=mechanism", label: t("viewMechanisms") },
            { href: "/catalog?kind=cover", label: t("viewCovers") },
          ];

  const body =
    kind === "mechanism"
      ? t("orderSeparatelyMechanism")
      : kind === "cover"
        ? t("orderSeparatelyCover")
        : t("orderSeparatelyFrame");

  return (
    <div className="mt-10 rounded-xl border border-border bg-muted/30 p-5">
      <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
        <Layers className="size-4 text-brand" />
        {t("orderSeparatelyTitle")}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5",
            )}
          >
            {l.label}
            <ArrowRight className="size-3.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
