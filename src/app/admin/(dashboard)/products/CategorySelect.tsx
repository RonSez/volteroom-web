"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/data/catalog";

/** Category dropdown that mirrors its value into a hidden `category_id` input. */
export function CategorySelect({
  categories,
  defaultValue,
}: {
  categories: Category[];
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? categories[0]?.id ?? "");

  return (
    <>
      <Select value={value} onValueChange={(v) => setValue(String(v))}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name.en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name="category_id" value={value} />
    </>
  );
}
