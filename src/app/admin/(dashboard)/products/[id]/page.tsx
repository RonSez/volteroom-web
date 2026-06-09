import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductForm, type ProductRow } from "../ProductForm";
import { ImageManager, type ProductImageItem } from "../ImageManager";
import { DeleteButton } from "../../../_components/DeleteButton";
import { deleteProduct } from "../actions";
import type { Category, Finish } from "@/data/catalog";

const IMAGE_BUCKET = "product-images";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: product },
    { data: pf },
    { data: categories },
    { data: finishes },
    { data: imgRows },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("product_finishes").select("finish_id").eq("product_id", id),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("finishes").select("*").order("sort_order"),
    supabase
      .from("product_images")
      .select("id, storage_path, view, finish_id, is_primary, sort_order")
      .eq("product_id", id)
      .order("is_primary", { ascending: false })
      .order("sort_order"),
  ]);

  if (!product) notFound();

  const row: ProductRow = {
    ...product,
    finishIds: (pf ?? []).map((r) => r.finish_id as string),
  };

  const images: ProductImageItem[] = (imgRows ?? []).map((r) => ({
    id: r.id as string,
    url: supabase.storage.from(IMAGE_BUCKET).getPublicUrl(r.storage_path as string)
      .data.publicUrl,
    is_primary: Boolean(r.is_primary),
    view: (r.view as string | null) ?? null,
    finish_id: (r.finish_id as string | null) ?? null,
  }));

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Products
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Edit product</h1>
        <DeleteButton action={deleteProduct.bind(null, row.id)} />
      </div>
      <ProductForm
        product={row}
        categories={(categories ?? []) as Category[]}
        finishes={(finishes ?? []) as Finish[]}
      />

      <div className="mt-8">
        <ImageManager
          productId={row.id}
          images={images}
          finishes={(finishes ?? []) as Finish[]}
        />
      </div>
    </div>
  );
}
