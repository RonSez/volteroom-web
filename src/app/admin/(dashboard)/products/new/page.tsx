import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../ProductForm";
import type { Category, Finish } from "@/data/catalog";

export default async function NewProductPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: finishes }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("finishes").select("*").order("sort_order"),
  ]);

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Products
      </Link>
      <h1 className="mb-6 font-heading text-2xl font-bold">New product</h1>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        finishes={(finishes ?? []) as Finish[]}
      />
    </div>
  );
}
