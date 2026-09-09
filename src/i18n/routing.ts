import { defineRouting } from "next-intl/routing";

export const locales = ["sk", "en", "cs"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "sk",
  localePrefix: "always",
  // next-intl otherwise emits its own `Link: rel="alternate"` HTTP headers,
  // whose x-default points at the unprefixed root while ours points at /sk.
  // Two disagreeing annotations is worse than one, so the pages own hreflang
  // exclusively — see `alternatesFor` in src/lib/seo.ts.
  alternateLinks: false,
});

export const localeNames: Record<Locale, string> = {
  sk: "Slovenčina",
  en: "English",
  cs: "Čeština",
};
