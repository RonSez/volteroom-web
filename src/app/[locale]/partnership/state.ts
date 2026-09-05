/**
 * Shared shape of the partnership form, imported by both the server action and
 * the client form.
 *
 * This lives outside `actions.ts` because a `"use server"` module may only
 * export async functions — exporting the constants from there is a runtime
 * error ("A 'use server' file can only export async functions, found object").
 */

/** Fields shown in the form, in the order they are rendered and mailed. */
export const FIELDS = [
  "name",
  "activity",
  "email",
  "company",
  "phone",
  "website",
  "city",
  "comment",
] as const;

export type Field = (typeof FIELDS)[number];

export const REQUIRED: Field[] = ["name", "activity", "email"];

/** Field the browser never shows; only a bot fills it in. */
export const HONEYPOT = "vr_website2";

export const MAX_LEN: Partial<Record<Field, number>> = { comment: 4000 };
export const DEFAULT_MAX_LEN = 200;

export type PartnershipState = {
  status: "idle" | "success" | "error";
  /** Which failure the client should explain. */
  code?: "invalid" | "unconfigured" | "failed";
  /** Names of the fields that failed validation, for inline highlighting. */
  invalid?: Field[];
};

export const INITIAL_STATE: PartnershipState = { status: "idle" };
