import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm, type CategoryRow } from "../CategoryForm";
import { DeleteButton } from "../../../_components/DeleteButton";
import { deleteCategory } from "../actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const category = data as CategoryRow;

  return (
    <div>
      <Link
        href="/admin/categories"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Categories
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Edit category</h1>
        <DeleteButton action={deleteCategory.bind(null, category.id)} />
      </div>
      <CategoryForm category={category} />
    </div>
  );
}
