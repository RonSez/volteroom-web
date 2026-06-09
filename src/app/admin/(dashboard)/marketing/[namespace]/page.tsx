import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { locales } from "@/i18n/routing";
import { Textarea } from "@/components/ui/textarea";
import { saveMarketing } from "../actions";
import { SubmitButton } from "../../../_components/SubmitButton";

interface CopyRow {
  key: string;
  locale: string;
  value: string;
}

export default async function MarketingNamespacePage({
  params,
}: {
  params: Promise<{ namespace: string }>;
}) {
  const { namespace } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("marketing_copy")
    .select("key, locale, value")
    .like("key", `${namespace}.%`)
    .order("key");

  const rows = (data ?? []) as CopyRow[];
  if (rows.length === 0) notFound();

  // Pivot: key -> { sk, en, cs }
  const byKey = new Map<string, Record<string, string>>();
  for (const r of rows) {
    const entry = byKey.get(r.key) ?? {};
    entry[r.locale] = r.value;
    byKey.set(r.key, entry);
  }
  const keys = [...byKey.keys()].sort();

  return (
    <div>
      <Link
        href="/admin/marketing"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Marketing copy
      </Link>
      <h1 className="mb-6 font-heading text-2xl font-bold capitalize">{namespace}</h1>

      <form action={saveMarketing.bind(null, namespace)} className="space-y-6">
        {keys.map((key) => {
          const values = byKey.get(key)!;
          return (
            <div key={key} className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 font-mono text-xs text-muted-foreground">
                {key.slice(namespace.length + 1)}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {locales.map((locale) => (
                  <label key={locale} className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {locale.toUpperCase()}
                    </span>
                    <Textarea
                      name={`v:${locale}:${key}`}
                      defaultValue={values[locale] ?? ""}
                      rows={2}
                    />
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        <div className="sticky bottom-4 flex justify-end">
          <SubmitButton className="shadow-lg">Save changes</SubmitButton>
        </div>
      </form>
    </div>
  );
}
