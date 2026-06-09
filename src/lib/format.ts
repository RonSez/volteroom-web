import type { Locale } from "@/i18n/routing";

const localeTag: Record<Locale, string> = {
  sk: "sk-SK",
  cs: "cs-CZ",
  en: "en-IE", // English with EUR
};

/** Format an amount as EUR using locale-aware formatting (e.g. "12,90 €"). */
export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTag[locale] ?? "sk-SK", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
