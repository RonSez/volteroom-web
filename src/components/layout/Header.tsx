"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag, Menu, Phone, Mail } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { siteConfig } from "@/lib/site";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[background-color,backdrop-filter] duration-500",
        scrolled
          ? "bg-[color-mix(in_oklch,var(--background)_72%,transparent)] backdrop-blur-xl"
          : "bg-[color-mix(in_oklch,var(--background)_30%,transparent)] backdrop-blur-md",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-500 sm:px-6 lg:px-8",
          scrolled ? "h-16" : "h-20",
        )}
      >
        <Link href="/" aria-label="Volteroom" className="shrink-0">
          {/* The logo is the dark (black & blue) wordmark; a soft white aura
              lifts it off the dark bar for contrast. */}
          <Logo
            tone="dark"
            className="h-8 [filter:drop-shadow(0_0_2px_rgba(255,255,255,0.95))_drop-shadow(0_0_6px_rgba(255,255,255,0.65))_drop-shadow(0_0_12px_rgba(255,255,255,0.45))]"
          />
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

        <div className="flex items-center gap-1">
          <div className="mr-2 hidden items-center gap-4 lg:flex">
            <a
              href={siteConfig.phoneHref}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Phone className="size-4" />
              {siteConfig.phone}
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="size-4" />
              {siteConfig.email}
            </a>
          </div>
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
              <div className="mt-4 flex flex-col gap-1 border-t border-border px-2 pt-4">
                <a
                  href={siteConfig.phoneHref}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="size-4" />
                  {siteConfig.phone}
                </a>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="size-4" />
                  {siteConfig.email}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
