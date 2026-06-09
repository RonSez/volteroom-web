"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Category, Finish } from "@/data/catalog";
import { FinishSwatch } from "./FinishSwatch";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Params = Record<string, string | undefined>;

function hrefFor(current: Params, changes: Params): string {
  const next: Params = { ...current, ...changes };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v) sp.set(k, v);
  const qs = sp.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

type FilterData = {
  categories: Category[];
  finishes: Finish[];
  gangs: number[];
};

function FilterBody({
  categories,
  finishes,
  gangs,
  onNavigate,
}: FilterData & { onNavigate?: () => void }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("catalog.filters");
  const sp = useSearchParams();

  const current: Params = {
    category: sp.get("category") ?? undefined,
    kind: sp.get("kind") ?? undefined,
    finish: sp.get("finish") ?? undefined,
    gang: sp.get("gang") ?? undefined,
  };

  const kinds: { id: string; label: string }[] = [
    { id: "mechanism", label: t("kindMechanism") },
    { id: "cover", label: t("kindCover") },
    { id: "frame", label: t("kindFrame") },
  ];

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-sm transition-colors",
      active
        ? "border-brand bg-brand text-brand-foreground"
        : "border-border bg-card text-foreground hover:border-brand/50",
    );

  return (
    <div className="space-y-8">
      {/* Category */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">{t("category")}</h3>
        <div className="flex flex-wrap gap-2">
          <Link href={hrefFor(current, { category: undefined })} onClick={onNavigate} className={chip(!current.category)}>
            {t("all")}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={hrefFor(current, { category: current.category === c.id ? undefined : c.id })}
              onClick={onNavigate}
              className={chip(current.category === c.id)}
            >
              {c.name[locale]}
            </Link>
          ))}
        </div>
      </div>

      {/* Type (kind) */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">{t("kind")}</h3>
        <div className="flex flex-wrap gap-2">
          <Link href={hrefFor(current, { kind: undefined })} onClick={onNavigate} className={chip(!current.kind)}>
            {t("all")}
          </Link>
          {kinds.map((k) => (
            <Link
              key={k.id}
              href={hrefFor(current, { kind: current.kind === k.id ? undefined : k.id })}
              onClick={onNavigate}
              className={chip(current.kind === k.id)}
            >
              {k.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Finish */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">{t("finish")}</h3>
        <div className="flex flex-wrap gap-2.5">
          {finishes.map((f) => {
            const active = current.finish === f.id;
            return (
              <Link
                key={f.id}
                href={hrefFor(current, { finish: active ? undefined : f.id })}
                onClick={onNavigate}
                aria-label={f.name[locale]}
                title={f.name[locale]}
              >
                <FinishSwatch finish={f} selected={active} title={f.name[locale]} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Gang */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">{t("gang")}</h3>
        <div className="flex flex-wrap gap-2">
          {gangs.map((g) => {
            const active = current.gang === String(g);
            return (
              <Link
                key={g}
                href={hrefFor(current, { gang: active ? undefined : String(g) })}
                onClick={onNavigate}
                className={chip(active)}
              >
                {g}
              </Link>
            );
          })}
        </div>
      </div>

      {(current.category || current.kind || current.finish || current.gang) && (
        <Link
          href="/catalog"
          onClick={onNavigate}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 text-muted-foreground")}
        >
          <X className="size-4" />
          {t("clear")}
        </Link>
      )}
    </div>
  );
}

export function CatalogFilters({ categories, finishes, gangs }: FilterData) {
  const t = useTranslations("catalog.filters");
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <h2 className="mb-6 font-heading text-lg font-semibold">{t("title")}</h2>
        <FilterBody categories={categories} finishes={finishes} gangs={gangs} />
      </aside>

      {/* Mobile trigger + sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <SlidersHorizontal className="size-4" />
            {t("open")}
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left">{t("title")}</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-8">
              <FilterBody
                categories={categories}
                finishes={finishes}
                gangs={gangs}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
