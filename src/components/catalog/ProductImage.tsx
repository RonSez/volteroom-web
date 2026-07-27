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
  light = false,
}: {
  imageUrl?: string;
  alt: string;
  category: CategoryId;
  hex: string;
  gang?: number;
  className?: string;
  sizes?: string;
  /**
   * Render on a white tile instead of the navy one. Used for line diagrams,
   * whose thin dark strokes disappear against the dark background.
   */
  light?: boolean;
}) {
  if (!imageUrl) {
    return (
      <ProductVisual category={category} hex={hex} gang={gang} className={className} />
    );
  }

  return (
    <div
      className={cn(
        // Navy tile (matches the site's card gradient) with a uniform 10% inset
        // so the photo sits slightly smaller inside an unchanged square box.
        // Cut-out (transparent) photos blend into the navy; photos with a baked
        // studio background show that background as a tile. `fill` is absolutely
        // positioned (padding wouldn't inset it), so the padded box wraps an
        // inner relative container that the image fills.
        "relative aspect-square w-full overflow-hidden rounded-xl p-[10%]",
        light ? "bg-white" : "bg-gradient-to-b from-[#101a2e] to-[#070d1b]",
        className,
      )}
    >
      <div className="relative h-full w-full">
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={sizes}
          quality={90}
          className="object-contain"
        />
      </div>
    </div>
  );
}
