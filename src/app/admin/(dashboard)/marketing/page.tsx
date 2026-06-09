import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function MarketingPage() {
  const supabase = await createClient();
  // One row per key is enough to derive namespaces (use the default locale).
  const { data } = await supabase
    .from("marketing_copy")
    .select("key")
    .eq("locale", "sk");

  const counts = new Map<string, number>();
  for (const { key } of data ?? []) {
    const ns = String(key).split(".")[0];
    counts.set(ns, (counts.get(ns) ?? 0) + 1);
  }
  const namespaces = [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Marketing copy</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Site text, grouped by section. Edits override the bundled translations
        and go live immediately.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {namespaces.map(([ns, count]) => (
          <Link key={ns} href={`/admin/marketing/${ns}`}>
            <Card className="flex items-center justify-between p-4 transition-colors hover:border-brand/50">
              <div>
                <p className="font-medium capitalize">{ns}</p>
                <p className="text-xs text-muted-foreground">{count} keys</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
        {namespaces.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No copy found. Run the seed script to import the bundled messages.
          </p>
        )}
      </div>
    </div>
  );
}
