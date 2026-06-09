import Link from "next/link";
import { Plus, Pencil, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DeleteButton } from "../../_components/DeleteButton";
import { deleteProduct } from "./actions";
import type { Localized, CategoryId } from "@/data/catalog";

interface ProductListRow {
  id: string;
  slug: string;
  category_id: CategoryId;
  name: Localized;
  base_price: number | string;
  featured: boolean;
}

export default async function ProductsPage() {
  const supabase = await createClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("id, slug, category_id, name, base_price, featured").order("sort_order"),
    supabase.from("categories").select("id, name"),
  ]);

  const catName = new Map(
    (categories ?? []).map((c) => [c.id, (c.name as Localized)?.en]),
  );
  const rows = (products ?? []) as ProductListRow[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="size-4" />
          New product
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name (EN)</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium">{p.name?.en}</div>
                  <div className="font-mono text-xs text-muted-foreground">{p.slug}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {catName.get(p.category_id) ?? p.category_id}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  €{Number(p.base_price).toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {p.featured && (
                    <Star className="mx-auto size-4 fill-brand text-brand" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "gap-1.5",
                      )}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                    <DeleteButton action={deleteProduct.bind(null, p.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No products yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
