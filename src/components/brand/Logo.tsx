import Image from "next/image";
import { cn } from "@/lib/utils";

import logoDark from "../../../public/brand/logo.png";
import logoLight from "../../../public/brand/logo-light.png";

/**
 * Volteroom wordmark — the real brand logo (transparent background).
 * Use `tone="light"` on dark surfaces (e.g. the navy footer) to render the
 * white variant; the default dark wordmark suits light surfaces.
 */
export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const src = tone === "light" ? logoLight : logoDark;
  return (
    <Image
      src={src}
      alt="Volteroom"
      priority
      className={cn("h-7 w-auto", className)}
      sizes="(max-width: 768px) 140px, 170px"
    />
  );
}
