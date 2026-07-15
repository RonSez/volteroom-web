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
        // Uniform inner white margin (`p-[10%]`) so the photo sits slightly
        // smaller inside an unchanged square box. This normalises the varying
        // amount of whitespace baked into individual source photos, giving
        // every product consistent breathing room. `fill` is absolutely
        // positioned (padding wouldn't inset it), so the padded box wraps an
        // inner relative container that the image fills.
        "relative aspect-square w-full overflow-hidden rounded-xl bg-white p-[10%]",
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
