/**
 * Transactional email.
 *
 * Sent through Resend's REST API over plain `fetch` — no SDK dependency, and
 * the free tier (3 000 mails/month, 100/day) covers a contact form many times
 * over. Configuration is entirely env-driven:
 *
 *   RESEND_API_KEY   required; without it `sendMail` reports "unconfigured"
 *                    and the caller surfaces the plain mailto fallback.
 *   MAIL_FROM        optional; defaults to Resend's shared sandbox sender,
 *                    which works with zero DNS setup but can only deliver to
 *                    the address that owns the Resend account. Once
 *                    volteroom.com is verified in Resend, set this to
 *                    something like "Volteroom <web@volteroom.com>".
 *   MAIL_TO          optional; defaults to the public sales address.
 *
 * Deliberately never throws: a failed send must not take the page down, so
 * every outcome comes back as a tagged result the caller can branch on.
 */
import { siteConfig } from "@/lib/site";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Resend's shared sender — usable before any domain is verified. */
const DEFAULT_FROM = "Volteroom <onboarding@resend.dev>";

export type SendMailResult =
  | { ok: true }
  | { ok: false; reason: "unconfigured" | "failed"; detail?: string };

export async function sendMail({
  subject,
  text,
  html,
  replyTo,
}: {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<SendMailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "unconfigured" };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || DEFAULT_FROM,
        to: [process.env.MAIL_TO || siteConfig.email],
        subject,
        text,
        ...(html ? { html } : {}),
        // Lets sales hit Reply and land in the enquirer's inbox directly.
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] Resend responded ${res.status}: ${detail}`);
      return { ok: false, reason: "failed", detail };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false, reason: "failed", detail: String(err) };
  }
}

/** Minimal HTML escaping for user-supplied values interpolated into a mail body. */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
