import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site";

/**
 * The default social preview card, inherited by every page that doesn't
 * define its own (product pages override it with the actual product photo).
 *
 * Drawn rather than shipped as a file so the tagline stays in the visitor's
 * language, and so it can never drift out of sync with the brand palette in
 * globals.css. Uses ImageResponse's built-in font — no network fetch at build.
 */
export const alt = `${siteConfig.name} — ${siteConfig.legalName}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const BACKGROUND = "#08090d";
const FOREGROUND = "#f4f7fb";
const MUTED = "#b3bccb";
const BRAND_FROM = "#0e2a4e";
const BRAND_TO = "#5cc8ea";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BACKGROUND,
          // The site's azure bloom, painted on the root rather than an
          // absolute child: satori has no blur filter, and it clips an
          // oversized positioned div at the first flex boundary, which shows
          // up as a hard horizontal seam across the card.
          backgroundImage: `radial-gradient(circle at 88% 8%, ${BRAND_TO}4D 0%, ${BRAND_FROM}2E 34%, ${BACKGROUND} 66%)`,
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 14, color: MUTED }}>
          VOLTEROOM
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              lineHeight: 1.1,
              color: FOREGROUND,
              maxWidth: 900,
            }}
          >
            {t("ogHeadline")}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: MUTED, maxWidth: 860 }}>
            {t("ogTagline")}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 24,
            color: MUTED,
          }}
        >
          <div style={{ display: "flex", width: 56, height: 4, background: BRAND_TO }} />
          {siteConfig.address.city}, {siteConfig.address.country}
        </div>
      </div>
    ),
    size,
  );
}
