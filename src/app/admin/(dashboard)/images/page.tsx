import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Localized } from "@/data/catalog";

const IMAGE_BUCKET = "product-images";

export default async function ImagesPage() {
  const supabase = await createClient();
  const [{ data: products }, { data: imgRows }] = await Promise.all([
    supabase.from("products").select("id, slug, name").order("sort_order"),
    supabase
      .from("product_images")
      .select("product_id, storage_path, is_primary, sort_order")
      .order("is_primary", { ascending: false })
      .order("sort_order"),
  ]);

  // First image (primary first) per product → public URL.
  const primaryByProduct = new Map<string, string>();
  for (const r of imgRows ?? []) {
    const pid = r.product_id as string;
    if (primaryByProduct.has(pid)) continue;
    primaryByProduct.set(
      pid,
      supabase.storage.from(IMAGE_BUCKET).getPublicUrl(r.storage_path as string)
        .data.publicUrl,
    );
  }

  const rows = (products ?? []) as {
    id: string;
    slug: string;
    name: Localized;
  }[];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Images</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Each product&apos;s primary image. Click a product to manage its photos.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((p) => {
          const url = primaryByProduct.get(p.id);
          return (
            <Link
              key={p.id}
              href={`/admin/products/${p.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand/50"
            >
              <div className="relative aspect-square bg-muted">
                {url ? (
                  <Image src={url} alt="" fill sizes="200px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground/50">
                    <ImageOff className="size-8" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{p.name?.en}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {p.slug}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
