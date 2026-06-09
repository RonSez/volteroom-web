import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Volteroom Admin",
  robots: { index: false, follow: false },
};

/**
 * Root layout for the admin area. Lives OUTSIDE the `[locale]` segment so
 * next-intl never prefixes admin URLs; it therefore renders its own
 * <html>/<body>. The auth guard + sidebar live in the nested `(dashboard)`
 * layout so the login page can opt out of both.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-muted/30 antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
