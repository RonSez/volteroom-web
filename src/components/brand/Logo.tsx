import Image from "next/image";
import { cn } from "@/lib/utils";

import logo from "../../../public/brand/logo.png";

/**
 * Volteroom wordmark — the slate-blue brand logo (transparent background).
 * A single tone reads cleanly across the site's dark surfaces, so the same
 * mark is used in both the header and the footer.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt="Volteroom"
      priority
      className={cn("h-7 w-auto", className)}
      sizes="(max-width: 768px) 140px, 170px"
    />
  );
}
