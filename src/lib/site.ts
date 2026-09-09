/**
 * Static brand / company configuration (placeholder-friendly).
 * Real values can later be served from the admin layer.
 */

/**
 * Absolute origin of this deployment — the base for canonicals, hreflang,
 * the sitemap and OG image URLs.
 *
 * Resolved at build time rather than hard-coded, because the production
 * domain is not pointed yet:
 *   1. `NEXT_PUBLIC_SITE_URL` — set this (no trailing slash) the moment the
 *      real domain goes live; it is the only change needed.
 *   2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel's *stable* production alias.
 *      Deliberately not `VERCEL_URL`, which is per-deployment and would make
 *      every preview advertise itself as the canonical.
 *   3. localhost, for `next dev`.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

/**
 * True only once we know the real public origin. Preview deployments and
 * localhost must never be indexed, so `robots.ts` gates on this.
 */
export const isPublicOrigin = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

export const siteConfig = {
  name: "Volteroom",
  legalName: "Volteroom s.r.o.",
  domain: "volteroom.com",
  url: siteUrl,
  address: {
    street: "Znievska 3060/8",
    zip: "851 06",
    city: "Bratislava",
    country: "Slovakia",
  },
  phone: "+421 947 116 106",
  phoneHref: "tel:+421947116106",
  email: "sales@volteroom.com",
  ico: "57558531",
  dic: "212846242",
  director: "Andrei Medvedev",
} as const;

export const mapsQuery = encodeURIComponent(
  `${siteConfig.address.street}, ${siteConfig.address.zip} ${siteConfig.address.city}, ${siteConfig.address.country}`,
);

export const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapsQuery}&output=embed`;
export const mapsLinkUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

/** Presentation slides rendered from the brand deck. */
export const presentationSlides = Array.from({ length: 11 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { id: i + 1, src: `/brand/presentation/slide-${n}.png` };
});
