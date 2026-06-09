import type { Locale } from "@/i18n/routing";

/**
 * Catalog data layer.
 *
 * This is the typed source the seed (`scripts/seed.ts`) pushes into Supabase,
 * which is the runtime single source of truth (read via `src/lib/catalog.ts`).
 *
 * The product list itself is GENERATED from the client's product Excel by
 * `scripts/build-catalog.ts` into `./catalog.products.ts` — re-run that script
 * when the sheet changes. Finishes, categories and the type definitions are
 * hand-maintained here.
 *
 * The catalog models a real three-part system:
 *   - `mechanism` — the colour-agnostic internal module (one SKU, full specs)
 *   - `cover`     — the coloured faceplate/button over a mechanism (finish variants)
 *   - `frame`     — the 1–5 gang frame (finish + gang variants)
 * Covers and frames are sold "in the colour of your choice"; the article number
 * shown depends on the selected finish (and gang for frames) — see `variantSkus`.
 */

export type Localized = Record<Locale, string>;

/* ------------------------------------------------------------------ */
/* Finishes — the real colours from the Excel `color` column           */
/* ------------------------------------------------------------------ */

export type FinishId =
  | "glossy-white"
  | "soft-touch-white"
  | "soft-touch-carbon"
  | "soft-touch-cashmere"
  | "graphite";

export interface Finish {
  id: FinishId;
  name: Localized;
  /** SKU suffix used to build article numbers (GLW, MW, FBK, CH, GRF). */
  code: string;
  /** Swatch colour (approximate; editable in admin). */
  hex: string;
  /** Whether the swatch needs a border on light backgrounds. */
  light?: boolean;
}

/* ------------------------------------------------------------------ */
/* Categories — functional browsing groups                             */
/* ------------------------------------------------------------------ */

export type CategoryId =
  | "switches"
  | "sockets"
  | "usb-charging"
  | "data-media"
  | "dimmers"
  | "climate"
  | "frames"
  | "accessories";

export interface Category {
  id: CategoryId;
  name: Localized;
  tagline: Localized;
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

/** Part type, orthogonal to category — drives the product-page UX. */
export type ProductKind = "mechanism" | "cover" | "frame";

/**
 * Structured technical characteristics, sourced from the Excel spec columns.
 * Values are plain strings (English for now, per the brief; translated later).
 * Rendered on the product page in the client's numbered order — see
 * `SPEC_ORDER` below.
 */
export interface ProductSpecs {
  componentType?: string;
  /** Mechanisms only: the moulded body colour (covers/frames use the finish). */
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

/** A photo in a product's gallery. */
export type ProductView = "front" | "back" | "diagram";

export interface ProductImageInfo {
  url: string;
  /** front | back | diagram (mechanisms have all three; covers/frames front+diagram). */
  view?: ProductView;
  /** For covers/frames: the finish this front photo depicts (so it swaps with selection). */
  finishId?: FinishId;
  isPrimary?: boolean;
}

/** Spec keys in the order the client numbered them for the product page. */
export const SPEC_ORDER: (keyof ProductSpecs)[] = [
  "componentType",
  "color",
  "connectionMethod",
  "nominalCurrent",
  "protectionDegree",
  "temperatureRange",
  "marking",
  "dimensions",
  "advantages",
  "installationType",
  "fireSafety",
];

export interface Product {
  slug: string;
  category: CategoryId;
  kind: ProductKind;
  name: Localized;
  description: Localized;
  /** Base price in EUR (placeholder, editable in admin). */
  basePrice: number;
  /** Article number for mechanisms (covers/frames use `variantSkus`). */
  sku?: string;
  /**
   * Article numbers for the coloured variants. Keyed by `finishId` for covers,
   * or `${gang}-${finishId}` for frames. Empty for mechanisms.
   */
  variantSkus?: Record<string, string>;
  /** Available gang counts (frames). */
  gangs?: number[];
  /**
   * Explicit finish subset; omitted = all finishes. Mechanisms have no finish
   * (gated by `kind === "mechanism"` in the UI), so this stays omitted there.
   */
  finishes?: FinishId[];
  /** Structured technical characteristics. */
  specs?: ProductSpecs;
  featured?: boolean;
  /** Public URL of the primary uploaded photo, if any (else SVG placeholder). */
  imageUrl?: string;
  /** Full gallery (front/back/diagram, optionally per-finish), ordered. */
  images?: ProductImageInfo[];
}

/* ------------------------------------------------------------------ */
/* Finishes (5 real colours; hexes approximate, editable in admin)     */
/* ------------------------------------------------------------------ */

/** Neutral swatch colour for mechanisms (the moulded "Space gray" body). */
export const NEUTRAL_FINISH_HEX = "#9AA0A6";

/** Build a localized string from its three translations (en = source). */
const L = (sk: string, en: string, cs: string): Localized => ({ sk, en, cs });

export const finishes: Finish[] = [
  { id: "glossy-white", code: "GLW", hex: "#F4F5F6", light: true, name: L("Lesklá biela", "Glossy White", "Lesklá bílá") },
  { id: "soft-touch-white", code: "MW", hex: "#ECEBE7", light: true, name: L("Soft touch biela", "Soft Touch White", "Soft touch bílá") },
  { id: "soft-touch-cashmere", code: "CH", hex: "#D7CCB8", light: true, name: L("Soft touch kašmír", "Soft Touch Cashmere", "Soft touch kašmír") },
  { id: "graphite", code: "GRF", hex: "#55585D", name: L("Grafit", "Graphite", "Grafit") },
  { id: "soft-touch-carbon", code: "FBK", hex: "#2C2C2E", name: L("Soft touch karbón", "Soft Touch Carbon", "Soft touch karbon") },
];

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export const categories: Category[] = [
  {
    id: "switches",
    name: L("Spínače", "Switches", "Spínače"),
    tagline: L(
      "Jedno- až trojnásobné spínače – jednopólové, striedavé a krížové.",
      "One- to three-gang switches — one-way, two-way and intermediate.",
      "Jedno- až trojnásobné spínače – jednopólové, střídavé a křížové.",
    ),
  },
  {
    id: "sockets",
    name: L("Zásuvky", "Sockets", "Zásuvky"),
    tagline: L(
      "Zásuvky vo francúzskom štandarde s kolíkovým uzemnením a clonkami.",
      "French-standard socket outlets with pin earthing and shutters.",
      "Zásuvky ve francouzském standardu s kolíkovým uzemněním a clonkami.",
    ),
  },
  {
    id: "usb-charging",
    name: L("USB a nabíjanie", "USB & Charging", "USB a nabíjení"),
    tagline: L(
      "Nabíjačky USB-A + USB-C 20 W pre telefóny, tablety a ďalšie zariadenia.",
      "USB-A + USB-C 20 W chargers for phones, tablets and more.",
      "Nabíječky USB-A + USB-C 20 W pro telefony, tablety a další zařízení.",
    ),
  },
  {
    id: "data-media",
    name: L("Dáta a médiá", "Data & Media", "Data a média"),
    tagline: L(
      "Zásuvky RJ45 CAT 6, HDMI 2.0a a TV/koaxiálne.",
      "RJ45 CAT 6, HDMI 2.0a and TV/coaxial outlets.",
      "Zásuvky RJ45 CAT 6, HDMI 2.0a a TV/koaxiální.",
    ),
  },
  {
    id: "dimmers",
    name: L("Stmievače", "Dimmers", "Stmívače"),
    tagline: L(
      "Triakové otočné LED stmievače pre obytné a komerčné osvetlenie.",
      "Triac rotary LED dimmers for residential and commercial lighting.",
      "Triakové otočné LED stmívače pro obytné a komerční osvětlení.",
    ),
  },
  {
    id: "climate",
    name: L("Klíma", "Climate", "Klima"),
    tagline: L(
      "Elektronické termostaty pre podlahové vykurovanie.",
      "Electronic thermostats for underfloor heating.",
      "Elektronické termostaty pro podlahové vytápění.",
    ),
  },
  {
    id: "frames",
    name: L("Rámiky", "Frames", "Rámečky"),
    tagline: L(
      "Univerzálne rámiky pre 1 – 5 prvkov, tenké iba 9,5 mm.",
      "Universal 1–5 gang frames, just 9.5 mm slim.",
      "Univerzální rámečky pro 1–5 prvků, tenké jen 9,5 mm.",
    ),
  },
  {
    id: "accessories",
    name: L("Príslušenstvo", "Accessories", "Příslušenství"),
    tagline: L(
      "Záslepky a káblové vývody na dokončenie zostavy.",
      "Blank plates and cable outlets to complete the set.",
      "Záslepky a kabelové vývody pro dokončení sestavy.",
    ),
  },
];

/**
 * The article number to display/order for a product given the selected finish
 * (and gang, for frames). Mechanisms have a single fixed SKU.
 */
export function resolveSku(
  p: Pick<Product, "kind" | "sku" | "variantSkus" | "gangs">,
  finishId?: FinishId,
  gang?: number,
): string | undefined {
  if (p.kind === "mechanism") return p.sku;
  if (!p.variantSkus) return p.sku;
  if (p.kind === "frame") {
    const g = gang ?? p.gangs?.[0];
    return p.variantSkus[`${g}-${finishId}`];
  }
  return finishId ? p.variantSkus[finishId] : undefined;
}

export { products } from "./catalog.products";
