import { getLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { CategoryId } from "@/data/catalog";
import { getCategories, getProducts } from "@/lib/catalog";
import { ProductImage } from "@/components/catalog/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/Motion";

const REPRESENTATIVE_HEX = "#3B3E43"; // matte titanium (placeholder tint fallback)

/**
 * A photographed product per category, used as the category card's hero image.
 * All are covers/frame carrying a glossy-white photo (mechanisms have none), so
 * the card shows a real image; anything without a photo falls back to the SVG
 * placeholder.
 */
const REPRESENTATIVE_SLUG: Record<CategoryId, string> = {
  switches: "e08kb111",
  sockets: "e08zb103",
  "usb-charging": "e08tb227",
  "data-media": "e08tb102",
  dimmers: "e08db102",
  climate: "e08db104",
  frames: "frame",
  accessories: "e08bb101",
};

export async function CategoryCards() {
  const locale = (await getLocale()) as Locale;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);
  const imageBySlug = new Map(products.map((p) => [p.slug, p.imageUrl]));

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat, i) => (
        <Reveal
          key={cat.id}
          delay={i * 70}
          variant="blur"
          className="h-full"
        >
        <TiltCard className="h-full">
        <Link
          href={`/catalog?category=${cat.id}`}
          className="floats group relative flex h-full flex-col overflow-hidden rounded-2xl transition-[box-shadow,transform] duration-300 hover:shadow-[0_0_50px_-12px_rgba(43, 164, 214,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="relative overflow-hidden bg-gradient-to-b from-[#101a2e] to-[#070d1b]">
            <ProductImage
              imageUrl={imageBySlug.get(REPRESENTATIVE_SLUG[cat.id])}
              alt={cat.name[locale]}
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
        </TiltCard>
        </Reveal>
      ))}
    </div>
  );
}
