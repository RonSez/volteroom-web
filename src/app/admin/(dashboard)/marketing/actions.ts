"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "../../auth";
import { MARKETING_TAG } from "@/lib/marketing";

/**
 * Save every edited copy field for a namespace. Fields are named
 * `v:<locale>:<dotted.key>` (keys contain dots but never colons).
 */
export async function saveMarketing(
  namespace: string,
  fd: FormData,
): Promise<void> {
  const { supabase } = await requireUser();

  const rows: { key: string; locale: string; value: string }[] = [];
  for (const [field, raw] of fd.entries()) {
    if (!field.startsWith("v:")) continue;
    const rest = field.slice(2);
    const sep = rest.indexOf(":");
    if (sep < 0) continue;
    const locale = rest.slice(0, sep);
    const key = rest.slice(sep + 1);
    rows.push({ key, locale, value: String(raw) });
  }

  if (rows.length) {
    const { error } = await supabase
      .from("marketing_copy")
      .upsert(rows, { onConflict: "key,locale" });
    if (error) throw new Error(error.message);
    revalidateTag(MARKETING_TAG, { expire: 0 });
  }

  redirect(`/admin/marketing/${namespace}`);
}
