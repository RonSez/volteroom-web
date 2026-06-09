import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const t = useTranslations("nav");
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-7xl font-bold text-brand-gradient">404</p>
      <p className="mt-4 text-muted-foreground">
        404 — page not found.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants(), "mt-6 bg-brand text-brand-foreground hover:bg-brand/90")}
      >
        {t("home")}
      </Link>
    </div>
  );
}
