"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Colour swatch picker synced to a text input named `hex`. */
export function HexField({ defaultValue = "#888888" }: { defaultValue?: string }) {
  const [hex, setHex] = useState(defaultValue);
  const safe = HEX.test(hex) ? hex : "#888888";

  return (
    <div className="grid grid-cols-[auto_1fr] items-end gap-3">
      <div className="space-y-2">
        <Label>Colour</Label>
        <input
          type="color"
          aria-label="Pick colour"
          value={safe}
          onChange={(e) => setHex(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-md border border-border bg-card p-1"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hex">Hex</Label>
        <Input
          id="hex"
          name="hex"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          placeholder="#1C1F22"
          required
        />
      </div>
    </div>
  );
}
