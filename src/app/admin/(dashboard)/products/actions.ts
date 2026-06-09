"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "../../auth";
import { CATALOG_TAG } from "@/lib/catalog";
import {
  localizedFromForm,
  gangsFromForm,
  specsFromForm,
  jsonRecordFromForm,
} from "../../_lib/form";

const IMAGE_BUCKET = "product-images";

export async function saveProduct(
  id: string | null,
  fd: FormData,
): Promise<void> {
  const { supabase } = await requireUser();

  const slug = String(fd.get("slug") ?? "").trim();
  const category_id = String(fd.get("category_id") ?? "").trim();
  if (!slug) throw new Error("Slug is required.");
  if (!category_id) throw new Error("Category is required.");

  const basePrice = Number(fd.get("base_price") ?? 0);
  const kind = String(fd.get("kind") ?? "mechanism").trim();
  const componentType = String(fd.get("component_type") ?? "").trim();
  const sku = String(fd.get("sku") ?? "").trim();
  const row = {
    slug,
    category_id,
    kind,
    component_type: componentType || null,
    name: localizedFromForm(fd, "name"),
    description: localizedFromForm(fd, "description"),
    base_price: Number.isFinite(basePrice) ? basePrice : 0,
    sku: sku || null,
    variant_skus: jsonRecordFromForm(fd.get("variant_skus")),
    specs: specsFromForm(fd),
    gangs: gangsFromForm(fd.get("gangs")),
    featured: fd.get("featured") === "on",
    sort_order: Number(fd.get("sort_order") ?? 0) || 0,
  };

  let productId = id;
  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    productId = data.id as string;
  }

  // Sync the explicit finish subset. "All" => no rows.
  const all = fd.get("all_finishes") === "1";
  await supabase.from("product_finishes").delete().eq("product_id", productId);
  if (!all) {
    const finishIds = fd.getAll("finishes").map(String).filter(Boolean);
    if (finishIds.length) {
      const { error } = await supabase
        .from("product_finishes")
        .insert(
          finishIds.map((finish_id) => ({ product_id: productId, finish_id })),
        );
      if (error) throw new Error(error.message);
    }
  }

  revalidateTag(CATALOG_TAG, { expire: 0 });
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<void> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag(CATALOG_TAG, { expire: 0 });
  redirect("/admin/products");
}

/* ------------------------------------------------------------------ */
/* Product images (Supabase Storage)                                   */
/* ------------------------------------------------------------------ */

export async function uploadProductImage(
  productId: string,
  fd: FormData,
): Promise<void> {
  const { supabase } = await requireUser();

  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file selected.");
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw new Error(upErr.message);

  // The first image for a product becomes its primary.
  const { count } = await supabase
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  const view = String(fd.get("view") ?? "").trim() || null;
  const finishId = String(fd.get("finish_id") ?? "").trim() || null;
  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: path,
    view,
    finish_id: finishId,
    is_primary: (count ?? 0) === 0,
  });
  if (error) throw new Error(error.message);

  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductImage(
  imageId: string,
  productId: string,
): Promise<void> {
  const { supabase } = await requireUser();

  const { data: img } = await supabase
    .from("product_images")
    .select("storage_path, is_primary")
    .eq("id", imageId)
    .maybeSingle();

  await supabase.from("product_images").delete().eq("id", imageId);
  if (img?.storage_path) {
    await supabase.storage.from(IMAGE_BUCKET).remove([img.storage_path]);
  }

  // Promote another image to primary if we removed the primary one.
  if (img?.is_primary) {
    const { data: next } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    if (next) {
      await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", next.id);
    }
  }

  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidatePath(`/admin/products/${productId}`);
}

export async function setPrimaryImage(
  imageId: string,
  productId: string,
): Promise<void> {
  const { supabase } = await requireUser();
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);
  await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidatePath(`/admin/products/${productId}`);
}
