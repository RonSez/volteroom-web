/**
 * Installation manuals ("datasheets") for the mechanisms, as required by the
 * EU low-voltage directive — every electrical accessory ships with connection
 * instructions, so the product page links the same PDF the box contains.
 *
 * The files live in `public/datasheets/` and are served straight from the base
 * URL (same arrangement as the SGS reports in `public/certificates/`). One
 * manual usually covers a whole family, so `skus` mirrors the "Product Models"
 * line printed on page 1 of each PDF — that list, not the catalogue, is what
 * decides which articles a manual is valid for.
 *
 * Only the mechanism carries a manual: covers and frames have no terminals.
 * Mechanisms with no manual yet (E08TA108, E08TA229, E08BA101, E08BA102)
 * simply render no button.
 */
export type Datasheet = {
  /** Message key under the `product.datasheets` namespace. */
  id: string;
  /** Path under `public/`. */
  file: string;
  pages: number;
  bytes: number;
  /** Article numbers listed on the manual's cover page. */
  skus: string[];
};

export const datasheets: Datasheet[] = [
  {
    id: "switch",
    file: "/datasheets/volteroom-switch-manual.pdf",
    pages: 5,
    bytes: 445644,
    skus: [
      "E08KA111",
      "E08KA112",
      "E08KA113",
      "E08KA211",
      "E08KA212",
      "E08KA213",
      "E08KA311",
      "E08KA215",
      "F08KA111",
      "F08KA112",
      "F08KA113",
      "F08KA211",
      "F08KA212",
      "F08KA311",
      "F08KA215",
    ],
  },
  {
    id: "socket",
    file: "/datasheets/volteroom-socket-manual.pdf",
    pages: 4,
    bytes: 440924,
    skus: ["E08ZA103", "E08ZA203", "E08TA236", "F08ZA103"],
  },
  {
    id: "informationSocket",
    file: "/datasheets/volteroom-information-socket-manual.pdf",
    pages: 5,
    bytes: 902129,
    skus: ["E08TA102", "E08TA222", "E08TA230", "E08TA103"],
  },
  {
    id: "dimmer",
    file: "/datasheets/volteroom-dimmer-manual.pdf",
    pages: 4,
    bytes: 518976,
    skus: ["E08DA102"],
  },
  {
    id: "thermostat",
    file: "/datasheets/volteroom-thermostat-manual.pdf",
    pages: 5,
    bytes: 513079,
    skus: ["E08DA104"],
  },
];

const bySku = new Map(
  datasheets.flatMap((d) => d.skus.map((sku) => [sku.toUpperCase(), d] as const)),
);

/** The manual covering an article number, if one has been published. */
export function datasheetForSku(sku: string | undefined): Datasheet | undefined {
  return sku ? bySku.get(sku.toUpperCase()) : undefined;
}
