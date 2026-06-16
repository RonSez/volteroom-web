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
  contain = false,
}: {
  imageUrl?: string;
  alt: string;
  category: CategoryId;
  hex: string;
  gang?: number;
  className?: string;
  sizes?: string;
  /** Fit the whole image without cropping (e.g. line diagrams). Default: cover. */
  contain?: boolean;
}) {
  if (!imageUrl) {
    return (
      <ProductVisual category={category} hex={hex} gang={gang} className={className} />
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-xl",
        contain ? "bg-white" : "bg-muted",
        className,
      )}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes={sizes}
        className={contain ? "object-contain" : "object-cover"}
      />
    </div>
  );
}
