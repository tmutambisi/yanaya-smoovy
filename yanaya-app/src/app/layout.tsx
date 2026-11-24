import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PwaSetup } from "@/components/PwaSetup";
import { MotionProvider } from "@/components/site/MotionProvider";
import { SITE } from "@/lib/smoovy";

// Fonts are self-hosted from the @fontsource packages (no Google Fonts fetch at build time).
const display = localFont({
  src: [
    { path: "../../node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-600-normal.woff2", weight: "600" },
    { path: "../../node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2", weight: "700" },
    { path: "../../node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-800-normal.woff2", weight: "800" },
  ],
  variable: "--font-barlow-condensed",
  display: "swap",
});
const body = localFont({
  src: [
    { path: "../../node_modules/@fontsource/barlow/files/barlow-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/barlow/files/barlow-latin-500-normal.woff2", weight: "500" },
    { path: "../../node_modules/@fontsource/barlow/files/barlow-latin-600-normal.woff2", weight: "600" },
    { path: "../../node_modules/@fontsource/barlow/files/barlow-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-barlow",
  display: "swap",
});

/**
 * Absolute base for share images/links. Uses the live domain in production, but the
 * Vercel preview URL on demo links (so WhatsApp previews work before sipsmoovy.com is connected).
 */
const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? SITE.url
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : SITE.url);

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: `Smoovy by Yanaya: ${SITE.tagline} ${SITE.tagline2}`,
    template: "%s · Smoovy by Yanaya",
  },
  description: SITE.description,
  applicationName: "Smoovy",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Smoovy by Yanaya",
    url: SITE.url,
    title: `${SITE.tagline} ${SITE.tagline2}`,
    description: SITE.description,
    images: [{ url: "/og/home.jpg", width: 1200, height: 630, alt: "Smoovy fruit smoothies by Yanaya" }],
    locale: "en_ZW",
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
  appleWebApp: { capable: true, title: "Smoovy", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2a2a2c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only-focusable fixed top-2 left-2 z-[100] rounded-full bg-night px-4 py-2 text-white"
        >
          Skip to content
        </a>
        <PwaSetup />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
