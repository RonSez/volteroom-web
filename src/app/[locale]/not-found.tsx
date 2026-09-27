import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 404. Next serves this with a real 404 status, so nothing here needs a
 * `noindex` — the status code is the signal Google acts on.
 *
 * The copy is translated rather than hard-coded English: this page is reached
 * from `/sk/...` and `/cs/...` far more often than from `/en/...`, since the
 * dead links that land here are mostly stale catalogue URLs in the primary
 * markets. It also offers the catalogue, not just the home page — a visitor
 * who hit a missing product wants the range, not the front door.
 */
export default function NotFound() {
  const t = useTranslations("notFound");
  const nav = useTranslations("nav");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-7xl font-bold text-brand-gradient">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold">{t("title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("body")}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/catalog"
          className={cn(
            buttonVariants(),
            "bg-brand text-brand-foreground hover:bg-brand/90",
          )}
        >
          {t("catalog")}
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          {nav("home")}
        </Link>
      </div>
    </div>
  );
}
