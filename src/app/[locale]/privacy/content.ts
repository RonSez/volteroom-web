// Locale lookup for the privacy policy. The document itself lives in
// content.<locale>.ts — see types.ts for the block shapes the page renders.

import { routing, type Locale } from "@/i18n/routing";
import type { PrivacyDoc } from "./types";
import { privacyEn } from "./content.en";
import { privacySk } from "./content.sk";
import { privacyCs } from "./content.cs";

const docs: Record<Locale, PrivacyDoc> = {
  sk: privacySk,
  en: privacyEn,
  cs: privacyCs,
};

export function getPrivacyDoc(locale: string): PrivacyDoc {
  return docs[locale as Locale] ?? docs[routing.defaultLocale];
}
