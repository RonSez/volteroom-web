"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag, Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useBasketCount, useHydrated } from "@/lib/store/basket";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", key: "home" },
  { href: "/catalog", key: "catalog" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

function BasketButton({ label }: { label: string }) {
  const count = useBasketCount();
  const hydrated = useHydrated();
  return (
    <Link
      href="/basket"
      aria-label={label}
      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
    >
      <ShoppingBag className="size-5" />
      {hydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-brand-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-foreground/5 bg-white/65 backdrop-blur-xl supports-[backdrop-filter]:bg-white/55">
      <span
        aria-hidden
        className="rule-brand pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-40"
      />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Volteroom" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                isActive(item.href) ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {t(item.key)}
              {isActive(item.href) && (
                <span
                  aria-hidden
                  className="rule-brand absolute inset-x-3 -bottom-px h-0.5 rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <LanguageSwitcher />
          <BasketButton label={t("basket")} />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label={t("openMenu")}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "md:hidden",
              )}
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">{t("menu")}</SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-2">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-accent",
                      isActive(item.href) ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
