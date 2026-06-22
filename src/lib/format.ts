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

/** Slovak standard VAT rate. Displayed prices are treated as VAT-inclusive. */
export const SK_VAT_RATE = 0.23;

/** Format the net (VAT-excluded) part of a VAT-inclusive amount (e.g. "10,49 €"). */
export function formatPriceExclVat(amount: number, locale: Locale): string {
  return formatPrice(amount / (1 + SK_VAT_RATE), locale);
}
