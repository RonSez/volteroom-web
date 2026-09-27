import type { SVGProps } from "react";

/**
 * Instagram and Facebook marks.
 *
 * lucide-react dropped its brand icons (the package ships 5 879 glyphs and not
 * one of them is a logo), so these are drawn here rather than pulled in. They
 * deliberately follow lucide's own geometry — 24×24 box, `currentColor`
 * stroke, no fill, 2px round caps — so they sit on the same optical weight as
 * the MapPin / Phone / Mail icons they appear beside in the footer, instead of
 * reading as heavier filled logos dropped into a stroked set.
 */

const base: SVGProps<SVGSVGElement> = {
  // Intrinsic size as well as the viewBox, exactly as lucide does it: the
  // `size-*` class overrides these, but without them an icon falls back to the
  // SVG default of 300×150 if the stylesheet hasn't applied yet.
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
