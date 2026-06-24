import { saveProduct } from "./actions";
import { LocalizedField } from "../../_components/LocalizedField";
import { SubmitButton } from "../../_components/SubmitButton";
import { SPEC_FIELDS } from "../../_lib/form";
import { CategorySelect } from "./CategorySelect";
import { FinishPicker } from "./FinishPicker";
import type {
  Localized,
  CategoryId,
  Category,
  Finish,
  ProductKind,
  ProductSpecs,
} from "@/data/catalog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface ProductRow {
  id: string;
  slug: string;
  category_id: CategoryId;
  kind: ProductKind;
  component_type: string | null;
  name: Localized;
  description: Localized;
  base_price: number | string;
  sku: string | null;
  variant_skus: Record<string, string> | null;
  specs: ProductSpecs | null;
  gangs: number[] | null;
  featured: boolean;
  sort_order: number;
  /** Explicit finish subset; empty means "all finishes". */
  finishIds: string[];
}

const inputCls =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ProductForm({
  product,
  categories,
  finishes,
}: {
  product?: ProductRow;
  categories: Category[];
  finishes: Finish[];
}) {
  const isEdit = Boolean(product);
  const allByDefault = !product || product.finishIds.length === 0;

  return (
    <form
      action={saveProduct.bind(null, product?.id ?? null)}
      className="max-w-2xl space-y-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={product?.slug}
            placeholder="e08ka111"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <CategorySelect
            categories={categories}
            defaultValue={product?.category_id}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="kind">Kind</Label>
          <select
            id="kind"
            name="kind"
            defaultValue={product?.kind ?? "mechanism"}
            className={inputCls}
          >
            <option value="mechanism">Mechanism</option>
            <option value="cover">Cover / button</option>
            <option value="frame">Frame</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Mechanisms have no finish; covers/frames use variant SKUs.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="component_type">Component type</Label>
          <Input
            id="component_type"
            name="component_type"
            defaultValue={product?.component_type ?? ""}
            placeholder="switch, socket, button…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">Article no. (mechanism)</Label>
          <Input
            id="sku"
            name="sku"
            defaultValue={product?.sku ?? ""}
            placeholder="E08KA111"
          />
        </div>
      </div>

      <LocalizedField name="name" label="Name" defaultValue={product?.name} />
      <LocalizedField
        name="description"
        label="Description"
        defaultValue={product?.description}
        multiline
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="base_price">Base price (EUR)</Label>
          <Input
            id="base_price"
            name="base_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.base_price}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gangs">Gangs</Label>
          <Input
            id="gangs"
            name="gangs"
            defaultValue={product?.gangs?.join(", ")}
            placeholder="1, 2, 3"
          />
          <p className="text-xs text-muted-foreground">Comma separated; blank = none.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sort_order">Sort order</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={product?.sort_order ?? 0}
          />
        </div>
      </div>

      {/* Variant article numbers (covers/frames) */}
      <div className="space-y-2">
        <Label htmlFor="variant_skus">Variant article numbers (JSON)</Label>
        <textarea
          id="variant_skus"
          name="variant_skus"
          rows={4}
          defaultValue={
            product?.variant_skus
              ? JSON.stringify(product.variant_skus, null, 2)
              : ""
          }
          placeholder={'{ "soft-touch-white": "E08KB111-MW" }'}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          Covers: key by finish id. Frames: key by <code>gang-finishId</code>
          {" "}(e.g. <code>1-soft-touch-white</code>). Leave blank for mechanisms.
        </p>
      </div>

      {/* Specifications */}
      <fieldset className="space-y-4 rounded-xl border border-border p-4">
        <legend className="px-1 text-sm font-semibold">Technical characteristics</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {SPEC_FIELDS.filter((f) => !f.multiline).map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`spec.${f.key}`}>{f.label}</Label>
              <Input
                id={`spec.${f.key}`}
                name={`spec.${f.key}`}
                defaultValue={product?.specs?.[f.key] ?? ""}
              />
            </div>
          ))}
        </div>
        {SPEC_FIELDS.filter((f) => f.multiline).map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`spec.${f.key}`}>{f.label}</Label>
            <textarea
              id={`spec.${f.key}`}
              name={`spec.${f.key}`}
              rows={2}
              defaultValue={product?.specs?.[f.key] ?? ""}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        ))}
      </fieldset>

      <div className="flex items-center gap-3">
        <Switch id="featured" name="featured" defaultChecked={product?.featured} />
        <Label htmlFor="featured">Featured on the home page</Label>
      </div>

      <div className="space-y-2">
        <Label>Finishes</Label>
        <FinishPicker
          finishes={finishes}
          initialSelected={product?.finishIds ?? []}
          allByDefault={allByDefault}
        />
      </div>

      <SubmitButton>{isEdit ? "Save changes" : "Create product"}</SubmitButton>
    </form>
  );
}
