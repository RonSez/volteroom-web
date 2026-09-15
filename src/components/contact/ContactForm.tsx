"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Send, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { submitContact } from "@/app/[locale]/contact/actions";
import {
  INITIAL_STATE,
  type ContactState,
} from "@/app/[locale]/contact/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/site";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    submitContact,
    INITIAL_STATE,
  );

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-10 text-center">
        <CheckCircle2 className="size-10 text-brand" />
        <p className="font-medium">{t("sent")}</p>
      </div>
    );
  }

  const invalidSet = new Set(state.invalid ?? []);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot: off-screen and hidden from assistive tech, so only bots fill it. */}
      <input
        type="text"
        name="vr_website2"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] size-0 opacity-0"
      />
      <div className="space-y-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          aria-invalid={invalidSet.has("name") || undefined}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          aria-invalid={invalidSet.has("email") || undefined}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{t("message")}</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder={t("messagePlaceholder")}
          aria-invalid={invalidSet.has("message") || undefined}
          required
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        {pending ? t("sending") : t("send")}
      </Button>

      {state.status === "error" && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span>
            {state.code === "invalid" ? (
              t("errorInvalid")
            ) : (
              <>
                {t("errorSending")}{" "}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="underline underline-offset-2 hover:text-brand"
                >
                  {siteConfig.email}
                </a>
              </>
            )}
          </span>
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        {t.rich("note", {
          privacy: (chunks) => (
            <Link
              href="/privacy"
              className="text-foreground underline decoration-brand/60 underline-offset-2 hover:text-brand"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </form>
  );
}
