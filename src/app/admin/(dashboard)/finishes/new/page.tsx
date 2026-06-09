import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FinishForm } from "../FinishForm";

export default function NewFinishPage() {
  return (
    <div>
      <Link
        href="/admin/finishes"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Finishes
      </Link>
      <h1 className="mb-6 font-heading text-2xl font-bold">New finish</h1>
      <FinishForm />
    </div>
  );
}
