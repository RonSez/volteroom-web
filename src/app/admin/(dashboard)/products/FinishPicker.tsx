"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Finish } from "@/data/catalog";

/**
 * Finish availability picker. "All finishes" (the default) submits no subset,
 * which the data model reads as "every finish". Turning it off reveals
 * checkboxes; the selected ids are submitted as hidden `finishes` inputs.
 */
export function FinishPicker({
  finishes,
  initialSelected,
  allByDefault,
}: {
  finishes: Finish[];
  initialSelected: string[];
  allByDefault: boolean;
}) {
  const [all, setAll] = useState(allByDefault);
  const [selected, setSelected] = useState<string[]>(initialSelected);

  function toggle(id: string, checked: boolean) {
    setSelected((cur) =>
      checked ? [...new Set([...cur, id])] : cur.filter((x) => x !== id),
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Switch id="all_finishes" checked={all} onCheckedChange={setAll} />
        <Label htmlFor="all_finishes">All finishes available</Label>
      </div>
      <input type="hidden" name="all_finishes" value={all ? "1" : "0"} />

      {!all && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {finishes.map((f) => (
              <label
                key={f.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2 text-sm"
              >
                <Checkbox
                  checked={selected.includes(f.id)}
                  onCheckedChange={(c) => toggle(f.id, c === true)}
                />
                <span
                  className="size-4 shrink-0 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: f.hex }}
                />
                <span className="truncate">{f.name.en}</span>
              </label>
            ))}
          </div>
          {selected.map((id) => (
            <input key={id} type="hidden" name="finishes" value={id} />
          ))}
        </>
      )}
    </div>
  );
}
