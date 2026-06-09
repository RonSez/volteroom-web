"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "../../auth";
import { MARKETING_TAG } from "@/lib/marketing";
import { SLIDESHOW_TAG, SLIDE_BUCKET } from "@/lib/slideshow";

/**
 * Replace the image for one slide (slot 1..3). Uploads to the `site-images`
 * bucket under a fresh path (so CDN caches bust), upserts the `site_slides`
 * row, and removes the previous object.
 */
export async function uploadSlideImage(
  slot: number,
  fd: FormData,
): Promise<void> {
  const { supabase } = await requireUser();

  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file selected.");
  }

  const { data: existing } = await supabase
    .from("site_slides")
    .select("storage_path")
    .eq("slot", slot)
    .maybeSingle();

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `slide-${slot}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(SLIDE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw new Error(upErr.message);

  const { error } = await supabase
    .from("site_slides")
    .upsert(
      { slot, storage_path: path, updated_at: new Date().toISOString() },
      { onConflict: "slot" },
    );
  if (error) throw new Error(error.message);

  const oldPath = existing?.storage_path as string | undefined;
  if (oldPath && oldPath !== path) {
    await supabase.storage.from(SLIDE_BUCKET).remove([oldPath]);
  }

  revalidateTag(SLIDESHOW_TAG, { expire: 0 });
  revalidatePath("/admin/slideshow");
}

/**
 * Save the localized titles/captions for all three slides. Fields are named
 * `v:<locale>:<dotted.key>` (same convention as the Marketing-copy editor),
 * with keys `home.switchShowcase.items.<i>.{title,caption}`.
 */
export async function saveSlideText(fd: FormData): Promise<void> {
  const { supabase } = await requireUser();

  const rows: { key: string; locale: string; value: string }[] = [];
  for (const [field, raw] of fd.entries()) {
    if (!field.startsWith("v:")) continue;
    const rest = field.slice(2);
    const sep = rest.indexOf(":");
    if (sep < 0) continue;
    rows.push({
      locale: rest.slice(0, sep),
      key: rest.slice(sep + 1),
      value: String(raw),
    });
  }

  if (rows.length) {
    const { error } = await supabase
      .from("marketing_copy")
      .upsert(rows, { onConflict: "key,locale" });
    if (error) throw new Error(error.message);
    revalidateTag(MARKETING_TAG, { expire: 0 });
  }

  redirect("/admin/slideshow");
}
