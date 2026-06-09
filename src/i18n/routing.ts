import { defineRouting } from "next-intl/routing";

export const locales = ["sk", "en", "cs"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "sk",
  localePrefix: "always",
});

export const localeNames: Record<Locale, string> = {
  sk: "Slovenčina",
  en: "English",
  cs: "Čeština",
};
