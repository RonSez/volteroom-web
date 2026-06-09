import { saveCategory } from "./actions";
import { LocalizedField } from "../../_components/LocalizedField";
import { SubmitButton } from "../../_components/SubmitButton";
import type { Localized, CategoryId } from "@/data/catalog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CategoryRow {
  id: CategoryId;
  name: Localized;
  tagline: Localized;
  sort_order: number;
}

export function CategoryForm({ category }: { category?: CategoryRow }) {
  const isEdit = Boolean(category);

  return (
    <form
      action={saveCategory.bind(null, category?.id ?? null)}
      className="max-w-xl space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="id">ID (slug)</Label>
        <Input
          id="id"
          name="id"
          defaultValue={category?.id}
          placeholder="switches"
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

      <LocalizedField name="name" label="Name" defaultValue={category?.name} />
      <LocalizedField
        name="tagline"
        label="Tagline"
        defaultValue={category?.tagline}
        multiline
      />

      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort order</Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={category?.sort_order ?? 0}
          className="w-28"
        />
      </div>

      <SubmitButton>{isEdit ? "Save changes" : "Create category"}</SubmitButton>
    </form>
  );
}
