import type { CategoryId } from "./catalog";

/**
 * GaN (gallium nitride) USB charging — the client's "keeps cool" selling point.
 *
 * Same arrangement as `glow-wire.ts`: the SKU list here, not the catalogue,
 * decides which product pages carry the GaN block. Both USB-charging mechanisms
 * (the plain USB-A + USB-C charger and the 3-in-1 socket + USB) use GaN.
 */
export const GAN_SKUS = ["E08TA229", "E08TA236"] as const;

const withGan = new Set<string>(GAN_SKUS.map((s) => s.toUpperCase()));

/** Whether this article's page shows the GaN technology block. */
export function hasGan(sku: string | undefined): boolean {
  return sku ? withGan.has(sku.toUpperCase()) : false;
}

/** The home-page category tile that carries the "GaN technology" badge. */
export const GAN_CATEGORY: CategoryId = "usb-charging";
