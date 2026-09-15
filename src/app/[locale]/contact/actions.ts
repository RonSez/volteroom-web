"use server";

import { sendMail, escapeHtml } from "@/lib/email";
import {
  FIELDS,
  REQUIRED,
  HONEYPOT,
  MAX_LEN,
  DEFAULT_MAX_LEN,
  type Field,
  type ContactState,
} from "./state";

/**
 * Contact form handler — the general "how can we help" message on /contact.
 *
 * Same transport and conventions as the partnership enquiry: mail goes out
 * through `sendMail` (Resend), the action returns tagged codes rather than
 * prose so the localized client component owns all copy, and nothing in
 * here may throw (an escaping exception would replace the page with React's
 * error boundary and lose the visitor's typed message).
 */

function read(fd: FormData, key: string) {
  const value = fd.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContact(
  _prev: ContactState,
  fd: FormData,
): Promise<ContactState> {
  try {
    return await run(fd);
  } catch (err) {
    console.error("[contact] submit failed", err);
    return { status: "error", code: "failed" };
  }
}

async function run(fd: FormData): Promise<ContactState> {
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

  if (invalid.length) {
    return { status: "error", code: "invalid", invalid: [...invalid] };
  }

  const locale = read(fd, "locale") || "sk";
  const rows: [string, string][] = [
    ["Name", values.name],
    ["E-mail", values.email],
    ["Message", values.message],
    ["Site language", locale],
  ];

  const result = await sendMail({
    subject: `Contact form — ${values.name}`,
    replyTo: values.email,
    text: rows.map(([label, v]) => `${label}: ${v}`).join("\n"),
    html: `<h2 style="font:600 18px/1.3 system-ui,sans-serif;margin:0 0 16px">Contact form message</h2>
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
