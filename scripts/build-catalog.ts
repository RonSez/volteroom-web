/**
 * Generate `src/data/catalog.products.ts` from the client's product Excel.
 *
 *   npx tsx scripts/build-catalog.ts
 *
 * Reads the pre-extracted `scripts/excel-rows.json` (a dump of every sheet row
 * with resolved cell values) and emits the typed `products` array consumed by
 * the seed. Re-run whenever the sheet (and its re-extracted JSON) changes.
 *
 * Model: each mechanism row → one `kind:"mechanism"` product (single SKU, full
 * specs, no finish). Coloured rows (suffix -GLW/-MW/-FBK/-CH/-GRF) are grouped:
 * buttons/covers by their base code → one `kind:"cover"` product with a
 * finish→SKU map; the five frame sizes → one `kind:"frame"` product with a
 * `${gang}-${finishId}`→SKU map and gangs 1–5.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

type Row = Record<string, string>;
const rows: Row[] = JSON.parse(
  readFileSync(join(__dirname, "excel-rows.json"), "utf8"),
);

// SK/CZ translations, keyed by the exact English `name`/`description` string
// this script emits. Hand-maintained in catalog-translations.json. Any English
// string without an entry is collected in `missingTranslations` and the build
// fails at the end, so a sheet change can never silently ship untranslated copy.
type Tr = { sk: string; cs: string };
const translations: { names: Record<string, Tr>; descriptions: Record<string, Tr> } =
  JSON.parse(readFileSync(join(__dirname, "catalog-translations.json"), "utf8"));
const missingTranslations: string[] = [];

const SUFFIX_TO_FINISH: Record<string, string> = {
  MW: "soft-touch-white",
  FBK: "soft-touch-carbon",
  CH: "soft-touch-cashmere",
  GRF: "graphite",
};

// One known typo in the sheet: the graphite thermostat cover is coded
// E08BD104-GRF but is the same part as E08DB104 in the other colours.
const BASE_FIXUPS: Record<string, string> = { E08BD104: "E08DB104" };

const BLANKS = new Set(["", "/", "#ERR"]);
function clean(v: string | undefined): string | undefined {
  if (v == null) return undefined;
  const t = v.replace(/\r\n/g, " ").replace(/\s+/g, " ").trim();
  return BLANKS.has(t) ? undefined : t;
}

function firstSentence(b: string): string {
  const t = b.trim();
  const m = t.match(/^(.*?\.)\s/);
  return (m ? m[1] : t).replace(/\.+$/, "").trim();
}

function stripColor(b: string): string {
  return b
    .trim()
    .replace(
      /,\s*(soft touch white|soft touch carbon|soft touch cashmere|graphite)\s*$/i,
      "",
    )
    .trim();
}

type CategoryId =
  | "switches" | "sockets" | "usb-charging" | "data-media"
  | "dimmers" | "climate" | "frames" | "accessories";

function categoryOf(text: string, g: string): CategoryId {
  const s = text.toLowerCase();
  if (g === "frame") return "frames";
  if (/blank plate|cable output/.test(s)) return "accessories";
  if (/dimmer|triac/.test(s)) return "dimmers";
  if (/thermostat|termostat/.test(s)) return "climate";
  if (/roll-down shutter/.test(s)) return "switches";
  if (/socket outlet|french standart|french standard/.test(s)) return "sockets";
  if (/usb charger/.test(s)) return "usb-charging";
  if (/rj45|hdmi|tv male|tv socket/.test(s)) return "data-media";
  if (/switch/.test(s) || g === "button") return "switches";
  return "accessories";
}

const PRICE_BY_CATEGORY: Record<CategoryId, number> = {
  switches: 18.9,
  sockets: 24.9,
  "usb-charging": 29.9,
  "data-media": 21.9,
  dimmers: 39.9,
  climate: 54.9,
  frames: 9.9,
  accessories: 7.9,
};

const FEATURED = new Set(["E08KA111", "E08ZA103", "E08TA229", "E08DA102"]);

interface Spec {
  componentType?: string;
  color?: string;
  connectionMethod?: string;
  nominalCurrent?: string;
  protectionDegree?: string;
  temperatureRange?: string;
  marking?: string;
  dimensions?: string;
  advantages?: string;
  installationType?: string;
  fireSafety?: string;
}

function specsFromRow(r: Row, kind: string): Spec {
  const ct = clean(r.G);
  const spec: Spec = {
    componentType: ct === "termostat" ? "thermostat" : ct,
    color: kind === "mechanism" ? clean(r.D) : undefined,
    connectionMethod: clean(r.F),
    nominalCurrent: clean(r.H),
    protectionDegree: clean(r.I),
    temperatureRange: clean(r.K),
    marking: clean(r.M),
    dimensions: clean(r.L)?.replace(/х/g, "×").replace(/мм/g, "mm"),
    advantages: clean(r.O),
    installationType: clean(r.J),
    fireSafety: clean(r.N),
  };
  for (const k of Object.keys(spec) as (keyof Spec)[]) {
    if (spec[k] === undefined) delete spec[k];
  }
  return spec;
}

interface Product {
  slug: string;
  category: CategoryId;
  kind: "mechanism" | "cover" | "frame";
  name: { sk: string; en: string; cs: string };
  description: { sk: string; en: string; cs: string };
  basePrice: number;
  sku?: string;
  variantSkus?: Record<string, string>;
  gangs?: number[];
  specs?: Spec;
  featured?: boolean;
}
// Localize a name/description: English stays verbatim, SK/CZ come from the
// translation map. A missing key is recorded (build fails later) and falls back
// to English so the generated file is still well-formed for debugging.
function localize(
  s: string,
  table: Record<string, Tr>,
): { sk: string; en: string; cs: string } {
  const t = table[s];
  if (!t) missingTranslations.push(s);
  return { sk: t?.sk ?? s, en: s, cs: t?.cs ?? s };
}
const LN = (s: string) => localize(s, translations.names);
const LD = (s: string) => localize(s, translations.descriptions);

const products: Product[] = [];
const coverByBase = new Map<string, Product>();
let frame: Product | null = null;

for (const r of rows) {
  const code = clean(r.C);
  const desc = r.B?.trim();
  if (!code || !desc || desc === "TOTAL" || !/^[EF]08/.test(code)) continue;

  const colorMatch = code.match(/-(GLW|MW|FBK|CH|GRF)$/);

  if (!colorMatch) {
    // Mechanism — colour-agnostic, one SKU.
    const category = categoryOf(desc, r.G ?? "");
    products.push({
      slug: code.toLowerCase(),
      category,
      kind: "mechanism",
      name: LN(firstSentence(desc)),
      description: LD(desc.replace(/\s+/g, " ").trim()),
      basePrice: PRICE_BY_CATEGORY[category],
      sku: code,
      specs: specsFromRow(r, "mechanism"),
      featured: FEATURED.has(code) || undefined,
    });
    continue;
  }

  const finishId = SUFFIX_TO_FINISH[colorMatch[1]];
  // Skip rows for a finish we no longer carry (e.g. the discontinued GLW).
  if (!finishId) continue;
  let base = code.slice(0, colorMatch.index);
  base = BASE_FIXUPS[base] ?? base;
  const isFrame = (r.G ?? "").trim() === "frame";

  if (isFrame) {
    const gang = Number(base.match(/E08B(\d)86/)?.[1] ?? "1");
    if (!frame) {
      frame = {
        slug: "frame",
        category: "frames",
        kind: "frame",
        name: LN("Frame"),
        description: LD(
          "Universal frame for 1–5 mechanisms, just 9.5 mm slim. Click-fixed before the buttons and covers, in the finish of your choice.",
        ),
        basePrice: PRICE_BY_CATEGORY.frames,
        variantSkus: {},
        gangs: [],
        specs: {
          componentType: "frame",
          temperatureRange: clean(r.K),
          dimensions: "82 × 82–366 × 9.5 mm (by gang count)",
          installationType: clean(r.J),
          fireSafety: clean(r.N),
        },
        featured: true,
      };
      products.push(frame);
    }
    frame.variantSkus![`${gang}-${finishId}`] = code;
    if (!frame.gangs!.includes(gang)) frame.gangs!.push(gang);
    continue;
  }

  // Button / cover — one product per base code, finish→SKU map.
  let cover = coverByBase.get(base);
  if (!cover) {
    const name = stripColor(desc);
    const category = categoryOf(desc, r.G ?? "");
    cover = {
      slug: base.toLowerCase(),
      category,
      kind: "cover",
      name: LN(name),
      description: LD(
        `${name}. Supplied in the finish of your choice — order together with the matching mechanism and frame.`,
      ),
      basePrice: 8.9,
      variantSkus: {},
      specs: specsFromRow(r, "cover"),
    };
    coverByBase.set(base, cover);
    products.push(cover);
  }
  cover.variantSkus![finishId] = code;
}

if (missingTranslations.length) {
  const unique = [...new Set(missingTranslations)];
  console.error(
    `\n✗ ${unique.length} string(s) without a SK/CZ translation in ` +
      `catalog-translations.json — add them and re-run:\n` +
      unique.map((s) => `  • ${JSON.stringify(s)}`).join("\n") +
      "\n",
  );
  process.exit(1);
}

if (frame) frame.gangs!.sort((a, b) => a - b);

// Stable ordering: mechanisms, then covers, then the frame (matches sheet flow).
const order = { mechanism: 0, cover: 1, frame: 2 } as const;
products.sort((a, b) => order[a.kind] - order[b.kind]);

const body = products
  .map((p) => JSON.stringify(p, null, 2).replace(/^/gm, "  "))
  .join(",\n");

const out = `// AUTO-GENERATED by scripts/build-catalog.ts — do not edit by hand.
// Source: the client's product Excel (scripts/excel-rows.json). Re-run the
// generator to refresh. Finishes, categories and types live in ./catalog.ts.
import type { Product } from "./catalog";

export const products: Product[] = [
${body}
];
`;

writeFileSync(join(root, "src", "data", "catalog.products.ts"), out, "utf8");
console.log(
  `Wrote ${products.length} products ` +
    `(${products.filter((p) => p.kind === "mechanism").length} mechanisms, ` +
    `${products.filter((p) => p.kind === "cover").length} covers, ` +
    `${products.filter((p) => p.kind === "frame").length} frame).`,
);
