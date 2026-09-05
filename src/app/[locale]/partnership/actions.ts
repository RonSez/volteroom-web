"use server";

import { sendMail, escapeHtml } from "@/lib/email";
import {
  FIELDS,
  REQUIRED,
  HONEYPOT,
  MAX_LEN,
  DEFAULT_MAX_LEN,
  type Field,
  type PartnershipState,
} from "./state";

/**
 * Partnership enquiry form handler.
 *
 * Returns tagged codes rather than prose: the page is localized in sk/en/cs
 * and the client component owns the copy, so the action never needs to know
 * which locale it is running under.
 *
 * A `"use server"` module may only export async functions, which is why the
 * shared constants and types live in `./state`.
 */

function read(fd: FormData, key: string) {
  const value = fd.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitPartnership(
  _prev: PartnershipState,
  fd: FormData,
): Promise<PartnershipState> {
  // A filled honeypot means a bot. Report success so it doesn't retry, but
  // send nothing.
  if (read(fd, HONEYPOT)) return { status: "success" };

  const values = Object.fromEntries(
    FIELDS.map((f) => [f, read(fd, f)]),
  ) as Record<Field, string>;

  const invalid = FIELDS.filter((f) => {
    const v = values[f];
    if (REQUIRED.includes(f) && !v) return true;
    if (v.length > (MAX_LEN[f] ?? DEFAULT_MAX_LEN)) return true;
    // Loose shape check only — the real validation is the reply bouncing.
    if (f === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return true;
    return false;
  });

  // The GDPR consent box is legally required before we may store or reply.
  if (!read(fd, "consent") || invalid.length) {
    return { status: "error", code: "invalid", invalid: [...invalid] };
  }

  const locale = read(fd, "locale") || "sk";
  const rows = (
    [
      ["Name", values.name],
      ["Field of activity", values.activity],
      ["E-mail", values.email],
      ["Company", values.company],
      ["Phone", values.phone],
      ["Website", values.website],
      ["City", values.city],
      ["Comment", values.comment],
      ["Site language", locale],
    ] as [string, string][]
  ).filter(([, v]) => v !== "");

  const result = await sendMail({
    subject: `Cooperation request — ${values.name}${
      values.company ? ` (${values.company})` : ""
    }`,
    replyTo: values.email,
    text: rows.map(([label, v]) => `${label}: ${v}`).join("\n"),
    html: `<h2 style="font:600 18px/1.3 system-ui,sans-serif;margin:0 0 16px">Cooperation request</h2>
<table style="font:14px/1.5 system-ui,sans-serif;border-collapse:collapse">
${rows
  .map(
    ([label, v]) =>
      `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${escapeHtml(
        label,
      )}</td><td style="padding:6px 0">${escapeHtml(v).replace(
        /\n/g,
        "<br>",
      )}</td></tr>`,
  )
  .join("\n")}
</table>`,
  });

  if (result.ok) return { status: "success" };
  return {
    status: "error",
    code: result.reason === "unconfigured" ? "unconfigured" : "failed",
  };
}
