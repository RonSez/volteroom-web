import { locales } from "@/i18n/routing";
import type { Localized, ProductSpecs } from "@/data/catalog";

/** Spec keys editable in the admin (and rendered on the product page). */
export const SPEC_FIELDS: { key: keyof ProductSpecs; label: string; multiline?: boolean }[] = [
  { key: "componentType", label: "Component type" },
  { key: "color", label: "Colour (mechanism body)" },
  { key: "connectionMethod", label: "Connection method" },
  { key: "conductorDiameter", label: "Conductor diameter" },
  { key: "nominalCurrent", label: "Nominal current" },
  { key: "protectionDegree", label: "Protection degree" },
  { key: "temperatureRange", label: "Temperature range" },
  { key: "marking", label: "Marking" },
  { key: "dimensions", label: "Dimensions (H×W×D)" },
  { key: "mountingDepth", label: "Mounting depth" },
  { key: "installationType", label: "Installation", multiline: true },
  { key: "advantages", label: "Key advantages", multiline: true },
  { key: "fireSafety", label: "Fire safety & durability", multiline: true },
];

/** Read a localized field group (`key.sk`, `key.en`, `key.cs`) from FormData. */
export function localizedFromForm(fd: FormData, key: string): Localized {
  const out = {} as Localized;
  for (const locale of locales) {
    out[locale] = String(fd.get(`${key}.${locale}`) ?? "").trim();
  }
  return out;
}

/** Parse a comma/space separated list of gang numbers, or null if empty. */
export function gangsFromForm(value: FormDataEntryValue | null): number[] | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const nums = raw
    .split(/[\s,]+/)
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n > 0);
  return nums.length ? Array.from(new Set(nums)).sort((a, b) => a - b) : null;
}

/** Build the structured specs object from `spec.<key>` fields (blanks dropped). */
export function specsFromForm(fd: FormData): ProductSpecs {
  const out: ProductSpecs = {};
  for (const { key } of SPEC_FIELDS) {
    const v = String(fd.get(`spec.${key}`) ?? "").trim();
    if (v) out[key] = v;
  }
  return out;
}

/** Collect the `variant_price.<key>` inputs; blank rows fall back to the base price. */
export function variantPricesFromForm(fd: FormData): Record<string, number> | null {
  const out: Record<string, number> = {};
  for (const [name, value] of fd.entries()) {
    if (!name.startsWith("variant_price.")) continue;
    const raw = String(value).trim().replace(",", ".");
    if (!raw) continue;
    const price = Number(raw);
    if (Number.isFinite(price) && price >= 0) out[name.slice("variant_price.".length)] = price;
  }
  return Object.keys(out).length ? out : null;
}

/** Parse a JSON object of string→string (variant SKUs); {} on empty/invalid. */
export function jsonRecordFromForm(value: FormDataEntryValue | null): Record<string, string> {
  const raw = String(value ?? "").trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) out[k] = String(v);
      return out;
    }
  } catch {
    throw new Error("Variant SKUs must be valid JSON, e.g. {\"soft-touch-white\":\"E08…-MW\"}.");
  }
  return {};
}
