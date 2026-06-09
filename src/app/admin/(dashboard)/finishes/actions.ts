"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "../../auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { localizedFromForm } from "../../_lib/form";

export async function saveFinish(id: string | null, fd: FormData): Promise<void> {
  const { supabase } = await requireUser();

  const finalId = (id ?? String(fd.get("id") ?? "")).trim();
  if (!finalId) throw new Error("ID is required.");

  const row = {
    id: finalId,
    name: localizedFromForm(fd, "name"),
    code: String(fd.get("code") ?? "").trim() || null,
    hex: String(fd.get("hex") ?? "").trim(),
    light: fd.get("light") === "on",
    sort_order: Number(fd.get("sort_order") ?? 0) || 0,
  };

  const { error } = await supabase
    .from("finishes")
    .upsert(row, { onConflict: "id" });
  if (error) throw new Error(error.message);

  revalidateTag(CATALOG_TAG, { expire: 0 });
  redirect("/admin/finishes");
}

export async function deleteFinish(id: string): Promise<void> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("finishes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag(CATALOG_TAG, { expire: 0 });
  redirect("/admin/finishes");
}
