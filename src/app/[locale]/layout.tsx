import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import { alternatesFor, organizationJsonLd, webSiteJsonLd } from "@/lib/seo";
import { isPublicOrigin, siteConfig, siteUrl } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeavenBackground } from "@/components/layout/HeavenBackground";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Display: a geometric, monolithic grotesque — echoes the product's own
// "monolithic form / precise alignment" design language.
const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Technical voice: article numbers, currents, IP ratings, eyebrows — the
// catalogue is full of real engineering data, so it gets a spec-sheet mono.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// The site is dark-only (single near-black palette in globals.css, no light
// variant). Declare that intent to the browser/OS so their native auto
// light/dark features don't try to "helpfully" flip the transparent header
// and the dark-surface-only outlined logo to a light scheme — which mangles
// the see-through wordmark. (Third-party inverter extensions can still
// override this; nothing on the page can stop those.)
export const viewport: Viewport = {
  colorScheme: "dark",
};

/** og:locale wants a full territory code, not the bare language tag. */
const OG_LOCALES: Record<Locale, string> = {
  sk: "sk_SK",
  en: "en_GB",
  cs: "cs_CZ",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const typedLocale = locale as Locale;

  return {
    // Everything below (and every page's canonical/hreflang/OG image) is
    // resolved against this, so it must be the real public origin.
    metadataBase: new URL(siteUrl),
    title: {
      default: t("titleDefault"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    applicationName: siteConfig.name,
    // Pages set their own canonical + hreflang cluster; this is only the
    // fallback for the locale root.
    alternates: alternatesFor(typedLocale, "/"),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: t("titleDefault"),
      description: t("description"),
      url: alternatesFor(typedLocale, "/").canonical as string,
      locale: OG_LOCALES[typedLocale],
      alternateLocale: routing.locales
        .filter((l) => l !== typedLocale)
        .map((l) => OG_LOCALES[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: t("titleDefault"),
      description: t("description"),
    },
    // Preview deployments share their content with the production site; if
    // they get indexed they compete with it for the brand's own terms.
    ...(isPublicOrigin
      ? {}
      : { robots: { index: false, follow: false } }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`dark ${inter.variable} ${sora.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col overflow-x-clip">
        {/* Set the reveal flag before paint so <Reveal> elements start hidden
            without flashing, and stay visible if JS is disabled. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.setAttribute('data-reveal-ready','');",
          }}
        />
        {/* One graph node for the company and one for the site, referenced
            by @id from the per-page Product/Breadcrumb blocks. */}
        <JsonLd
          data={[organizationJsonLd(), webSiteJsonLd(locale as Locale)]}
        />
        <NextIntlClientProvider>
          <HeavenBackground />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster richColors position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
