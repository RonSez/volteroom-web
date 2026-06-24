import { saveFinish } from "./actions";
import { LocalizedField } from "../../_components/LocalizedField";
import { SubmitButton } from "../../_components/SubmitButton";
import { HexField } from "../../_components/HexField";
import type { Localized, FinishId } from "@/data/catalog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface FinishRow {
  id: FinishId;
  name: Localized;
  code: string | null;
  hex: string;
  light: boolean;
  sort_order: number;
}

export function FinishForm({ finish }: { finish?: FinishRow }) {
  const isEdit = Boolean(finish);

  return (
    <form action={saveFinish.bind(null, finish?.id ?? null)} className="max-w-xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="id">ID (slug)</Label>
        <Input
          id="id"
          name="id"
          defaultValue={finish?.id}
          placeholder="matte-black"
          readOnly={isEdit}
          required={!isEdit}
          className={isEdit ? "bg-muted text-muted-foreground" : undefined}
        />
        {isEdit && (
          <p className="text-xs text-muted-foreground">
            ID is the primary key and cannot be changed.
          </p>
        )}
      </div>

      <LocalizedField name="name" label="Name" defaultValue={finish?.name} />

      <div className="space-y-2">
        <Label htmlFor="code">SKU suffix (code)</Label>
        <Input
          id="code"
          name="code"
          defaultValue={finish?.code ?? ""}
          placeholder="MW"
          className="w-28"
        />
        <p className="text-xs text-muted-foreground">
          Used to build article numbers, e.g. <code>E08KB111-MW</code>.
        </p>
      </div>

      <HexField defaultValue={finish?.hex} />

      <div className="flex items-center gap-3">
        <Switch id="light" name="light" defaultChecked={finish?.light} />
        <Label htmlFor="light">Light swatch (needs a border on light backgrounds)</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort order</Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={finish?.sort_order ?? 0}
          className="w-28"
        />
      </div>

      <SubmitButton>{isEdit ? "Save changes" : "Create finish"}</SubmitButton>
    </form>
  );
}
