import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CategoryForm } from "../CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <Link
        href="/admin/categories"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Categories
      </Link>
      <h1 className="mb-6 font-heading text-2xl font-bold">New category</h1>
      <CategoryForm />
    </div>
  );
}
