"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Placeholder: no backend yet. Wired up later via admin/API.
    setSent(true);
    toast.success(t("sent"));
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-10 text-center">
        <CheckCircle2 className="size-10 text-brand" />
        <p className="font-medium">{t("sent")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" autoComplete="name" placeholder={t("namePlaceholder")} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder={t("emailPlaceholder")} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{t("message")}</Label>
        <Textarea id="message" name="message" rows={5} placeholder={t("messagePlaceholder")} required />
      </div>
      <Button type="submit" className="h-11 w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
        <Send className="size-4" />
        {t("send")}
      </Button>
      <p className="text-xs text-muted-foreground">{t("note")}</p>
    </form>
  );
}
