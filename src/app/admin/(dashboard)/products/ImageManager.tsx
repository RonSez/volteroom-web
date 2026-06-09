import Image from "next/image";
import { Star, Trash2, Upload } from "lucide-react";
import {
  uploadProductImage,
  deleteProductImage,
  setPrimaryImage,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "../../_components/SubmitButton";
import type { Finish } from "@/data/catalog";

export interface ProductImageItem {
  id: string;
  url: string;
  is_primary: boolean;
  view: string | null;
  finish_id: string | null;
}

const selectCls =
  "h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ImageManager({
  productId,
  images,
  finishes,
}: {
  productId: string;
  images: ProductImageItem[];
  finishes: Finish[];
}) {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="font-heading text-base font-semibold">Images</h2>
        <p className="text-sm text-muted-foreground">
          The primary image is shown on the site; products without an image use
          the SVG placeholder.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="overflow-hidden rounded-lg border border-border"
          >
            <div className="relative aspect-square bg-muted">
              <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
              {img.is_primary && (
                <span className="absolute left-2 top-2 rounded bg-brand px-1.5 py-0.5 text-xs font-medium text-brand-foreground">
                  Primary
                </span>
              )}
              {(img.view || img.finish_id) && (
                <span className="absolute bottom-2 left-2 rounded bg-background/85 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur">
                  {[img.view, img.finish_id].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-1 p-1.5">
              {img.is_primary ? (
                <span className="px-1 text-xs text-muted-foreground">Primary</span>
              ) : (
                <form action={setPrimaryImage.bind(null, img.id, productId)}>
                  <Button type="submit" variant="ghost" size="sm" className="gap-1 text-xs">
                    <Star className="size-3.5" />
                    Set primary
                  </Button>
                </form>
              )}
              <form action={deleteProductImage.bind(null, img.id, productId)}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  aria-label="Delete image"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </form>
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">
            No images yet.
          </p>
        )}
      </div>

      <form
        action={uploadProductImage.bind(null, productId)}
        className="flex flex-wrap items-end gap-3 border-t border-border pt-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="file">Add image</Label>
          <Input
            id="file"
            type="file"
            name="file"
            accept="image/*"
            required
            className="w-auto"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="view">View</Label>
          <select id="view" name="view" defaultValue="" className={selectCls}>
            <option value="">—</option>
            <option value="front">Front</option>
            <option value="back">Back</option>
            <option value="diagram">Diagram</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="finish_id">Finish</Label>
          <select id="finish_id" name="finish_id" defaultValue="" className={selectCls}>
            <option value="">All / none</option>
            {finishes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name.en}
              </option>
            ))}
          </select>
        </div>
        <SubmitButton>
          <Upload className="size-4" />
          Upload
        </SubmitButton>
      </form>
    </div>
  );
}
