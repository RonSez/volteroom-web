"use client";

import { useActionState, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Send, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { submitPartnership } from "@/app/[locale]/partnership/actions";
import {
  INITIAL_STATE,
  type PartnershipState,
} from "@/app/[locale]/partnership/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

type TextField = {
  name: "name" | "activity" | "email" | "company" | "phone" | "website" | "city";
  type?: React.HTMLInputTypeAttribute;
  autoComplete: string;
  required?: boolean;
};

/** Short fields, in the order the client's mock-up lays them out. */
const TEXT_FIELDS: TextField[] = [
  { name: "name", autoComplete: "name", required: true },
  { name: "activity", autoComplete: "organization-title", required: true },
  { name: "email", type: "email", autoComplete: "email", required: true },
  { name: "company", autoComplete: "organization" },
  { name: "phone", type: "tel", autoComplete: "tel" },
  { name: "website", type: "url", autoComplete: "url" },
  { name: "city", autoComplete: "address-level2" },
];

const FIELD_CLASS =
  "h-11 rounded-xl border-white/10 bg-white/[0.04] px-4 focus-visible:border-brand/60";

export function PartnershipForm() {
  const t = useTranslations("partnership.form");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<PartnershipState, FormData>(
    submitPartnership,
    INITIAL_STATE,
  );
  const [consent, setConsent] = useState(false);
  // Only complain about a missing tick once the visitor has actually tried to
  // submit — an error badge on an untouched form is just noise.
  const [consentTouched, setConsentTouched] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand/25 bg-brand/5 p-10 text-center sm:p-14">
        <CheckCircle2 className="size-11 text-brand" strokeWidth={1.5} />
        <p className="font-heading text-xl font-semibold">{t("successTitle")}</p>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {t("successBody")}
        </p>
      </div>
    );
  }

  const invalidSet = new Set(state.invalid ?? []);
  const consentMissing = consentTouched && !consent;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        setConsentTouched(true);
        if (!consent) e.preventDefault();
      }}
      className="space-y-5"
      noValidate={false}
    >
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

      <div className="grid gap-4 sm:grid-cols-2">
        {TEXT_FIELDS.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-xs text-muted-foreground">
              {t(`${field.name}.label`)}
              {field.required && <span className="text-brand">*</span>}
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              autoComplete={field.autoComplete}
              required={field.required}
              aria-invalid={invalidSet.has(field.name) || undefined}
              placeholder={t(`${field.name}.placeholder`)}
              className={FIELD_CLASS}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment" className="text-xs text-muted-foreground">
          {t("comment.label")}
        </Label>
        <Textarea
          id="comment"
          name="comment"
          rows={4}
          placeholder={t("comment.placeholder")}
          aria-invalid={invalidSet.has("comment") || undefined}
          className="min-h-28 rounded-xl border-white/10 bg-white/[0.04] px-4 py-3 focus-visible:border-brand/60"
        />
      </div>

      <div className="flex flex-col gap-5 pt-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              name="consent"
              checked={consent}
              onCheckedChange={setConsent}
              aria-invalid={consentMissing || undefined}
              className="mt-0.5"
            />
            <Label
              htmlFor="consent"
              className="block max-w-md text-xs leading-relaxed text-muted-foreground"
            >
              {t.rich("consent", {
                privacy: (chunks) => (
                  <Link
                    href="/privacy"
                    className="text-foreground underline decoration-brand/60 underline-offset-2 hover:text-brand"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </Label>
          </div>
          {consentMissing && (
            <p className="pl-7 text-xs text-destructive" role="alert">
              {t("consentRequired")}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-12 shrink-0 gap-2 rounded-xl bg-brand px-8 text-brand-foreground hover:bg-brand/90"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {pending ? t("sending") : t("submit")}
        </Button>
      </div>

      {state.status === "error" && (
        <p
          role="alert"
          className={cn(
            "flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground",
          )}
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
    </form>
  );
}
