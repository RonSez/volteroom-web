import type { CategoryId } from "./catalog";

/**
 * The glow-wire (850 °C) fire-safety test the client shoots as a poster.
 *
 * Every mechanism's `fireSafety` spec already states that the plastics passed a
 * hot-wire test at +850 °C; this is the photograph behind that line. It is the
 * client's own artwork, self-contained (logo, headline, temperature and the
 * "socket mechanism" call-out are all baked in), so it is never composited with
 * our own copy on top — surfaces put localized text *beside* it instead.
 *
 * Same arrangement as `datasheets.ts`: the file lives under `public/` and the
 * SKU list, not the catalogue, decides which product pages carry it. The client
 * nominated these four articles; adding more is just a line here.
 *
 * NOTE: the supplied artwork is 360x640 — enough for the sizes we render it at,
 * but not for anything full-bleed. Ask for a larger export before scaling it up.
 */
export const GLOW_WIRE_POSTER = {
  src: "/brand/glow-wire-test-850c.png",
  width: 360,
  height: 640,
} as const;

/** Article numbers whose product page carries the poster. */
const GLOW_WIRE_SKUS = ["E08ZA103", "E08ZA203", "E08DA104", "F08ZA103"];

const withGlowWire = new Set(GLOW_WIRE_SKUS.map((s) => s.toUpperCase()));

/** Whether this article's page shows the glow-wire safety block. */
export function hasGlowWireTest(sku: string | undefined): boolean {
  return sku ? withGlowWire.has(sku.toUpperCase()) : false;
}

/**
 * The home-page category tile that teases the poster on hover. Sockets: three
 * of the four articles above are socket mechanisms, and it is the tile the
 * client pointed at.
 */
export const GLOW_WIRE_CATEGORY: CategoryId = "sockets";
