import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FinishForm, type FinishRow } from "../FinishForm";
import { DeleteButton } from "../../../_components/DeleteButton";
import { deleteFinish } from "../actions";

export default async function EditFinishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("finishes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const finish = data as FinishRow;

  return (
    <div>
      <Link
        href="/admin/finishes"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Finishes
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Edit finish</h1>
        <DeleteButton action={deleteFinish.bind(null, finish.id)} />
      </div>
      <FinishForm finish={finish} />
    </div>
  );
}
