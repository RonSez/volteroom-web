import Image from "next/image";
import type { CategoryId } from "@/data/catalog";
import { ProductVisual } from "./ProductVisual";
import { cn } from "@/lib/utils";

/**
 * Product visual: shows the uploaded primary photo when present, otherwise the
 * finish-reactive SVG placeholder (`ProductVisual`). Presentational only — safe
 * in both server and client components.
 */
export function ProductImage({
  imageUrl,
  alt,
  category,
  hex,
  gang = 1,
  className,
  sizes = "(min-width: 1024px) 25vw, 50vw",
}: {
  imageUrl?: string;
  alt: string;
  category: CategoryId;
  hex: string;
  gang?: number;
  className?: string;
  sizes?: string;
}) {
  if (!imageUrl) {
    return (
      <ProductVisual category={category} hex={hex} gang={gang} className={className} />
    );
  }

  return (
    <div
      className={cn(
        // Uniform inner margin (`p-[10%]`) normalises the varying whitespace
        // baked into individual source photos, giving every product consistent
        // breathing room. The container paints the dark "lit niche" — the same
        // ground as the ProductVisual placeholder, plus a faint azure top-glow —
        // so cut-out photos float on the site's dark surface instead of a white
        // tile. `fill` is absolutely positioned (padding wouldn't inset it), so
        // the padded box wraps an inner relative container that the image fills.
        "relative aspect-square w-full overflow-hidden rounded-xl p-[10%]",
        className,
      )}
      style={{
        background:
          "radial-gradient(115% 80% at 50% -8%, rgba(43,164,214,0.10) 0%, transparent 55%), radial-gradient(120% 100% at 50% 0%, #16233d 0%, #0c1626 55%, #060b18 100%)",
      }}
    >
      <div className="relative h-full w-full">
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={sizes}
          quality={90}
          // Contact shadow hugs the cut-out silhouette so the product reads as
          // sitting in the niche rather than pasted onto it.
          className="object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.5)]"
        />
      </div>
    </div>
  );
}
