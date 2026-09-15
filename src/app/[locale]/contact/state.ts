/**
 * Shared shape of the contact form, imported by both the server action and
 * the client form. Kept outside `actions.ts` for the same reason as the
 * partnership form: a `"use server"` module may only export async functions.
 */

/** Fields shown in the form, in the order they are rendered and mailed. */
export const FIELDS = ["name", "email", "message"] as const;

export type Field = (typeof FIELDS)[number];

export const REQUIRED: Field[] = ["name", "email", "message"];

/** Field the browser never shows; only a bot fills it in. */
export const HONEYPOT = "vr_website2";

export const MAX_LEN: Partial<Record<Field, number>> = { message: 4000 };
export const DEFAULT_MAX_LEN = 200;

export type ContactState = {
  status: "idle" | "success" | "error";
  /** Which failure the client should explain. */
  code?: "invalid" | "unconfigured" | "failed";
  /** Names of the fields that failed validation, for inline highlighting. */
  invalid?: Field[];
};

export const INITIAL_STATE: ContactState = { status: "idle" };
