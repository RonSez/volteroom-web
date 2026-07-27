import Image from "next/image";
import { cn } from "@/lib/utils";

import logo from "../../../public/brand/logo.png";

/**
 * Volteroom wordmark — outlined letterforms with the azure bracket, on a
 * transparent background. The letters are hairline outlines rather than solid
 * fills, so the mark is drawn for dark surfaces only: the counters and the
 * bracket's deep-navy end read as whatever sits behind them. Header and footer
 * share it; the header adds a shadow because the hero film runs behind it.
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
