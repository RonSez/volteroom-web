/**
 * Static brand / company configuration (placeholder-friendly).
 * Real values can later be served from the admin layer.
 */
export const siteConfig = {
  name: "Volteroom",
  legalName: "Volteroom s.r.o.",
  domain: "volteroom.com",
  url: "https://www.volteroom.com",
  address: {
    street: "Znievska 3060/8",
    zip: "851 06",
    city: "Bratislava",
    country: "Slovakia",
  },
  phone: "+421 947 116 106",
  phoneHref: "tel:+421947116106",
  email: "pomocslov@gmail.com",
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
