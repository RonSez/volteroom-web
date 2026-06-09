import Link from "next/link";
import { Package, FolderTree, Palette, Languages } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

async function count(table: string): Promise<number | null> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  return error ? null : (count ?? 0);
}

const TILES = [
  { href: "/admin/products", label: "Products", icon: Package, table: "products" },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, table: "categories" },
  { href: "/admin/finishes", label: "Finishes", icon: Palette, table: "finishes" },
  { href: "/admin/marketing", label: "Copy keys", icon: Languages, table: "marketing_copy" },
] as const;

export default async function AdminDashboard() {
  const counts = await Promise.all(TILES.map((t) => count(t.table)));

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage the catalogue and site content. Changes go live immediately.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map(({ href, label, icon: Icon }, i) => (
          <Link key={href} href={href}>
            <Card className="p-5 transition-colors hover:border-brand/50">
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-brand" />
                <span className="text-2xl font-bold tabular-nums">
                  {counts[i] ?? "—"}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
