import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
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
import { deleteFinish } from "./actions";
import type { FinishRow } from "./FinishForm";

export default async function FinishesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("finishes").select("*").order("sort_order");
  const finishes = (data ?? []) as FinishRow[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Finishes</h1>
        <Link href="/admin/finishes/new" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="size-4" />
          New finish
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>ID</TableHead>
              <TableHead>Name (EN)</TableHead>
              <TableHead>Hex</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {finishes.map((f) => (
              <TableRow key={f.id}>
                <TableCell>
                  <span
                    className="block size-6 rounded-full ring-1 ring-border"
                    style={{ backgroundColor: f.hex }}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{f.id}</TableCell>
                <TableCell>{f.name?.en}</TableCell>
                <TableCell className="font-mono text-xs">{f.hex}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/finishes/${f.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "gap-1.5",
                      )}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                    <DeleteButton action={deleteFinish.bind(null, f.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {finishes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No finishes yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
