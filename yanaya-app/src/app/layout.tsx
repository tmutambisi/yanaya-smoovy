import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OrderProvider } from "@/lib/order-store";
import { PwaSetup } from "@/components/PwaSetup";

export const metadata: Metadata = {
  title: "Yanaya · Order Smoovy Baobab",
  description: "Order Smoovy Baobab for delivery or collection.",
  applicationName: "Yanaya",
  // manifest is generated from src/app/manifest.ts
  appleWebApp: {
    capable: true,
    title: "Yanaya",
    statusBarStyle: "black-translucent",
  },
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
    <html lang="en">
      <body className="antialiased min-h-dvh">
        <PwaSetup />
        <OrderProvider>{children}</OrderProvider>
      </body>
    </html>
  );
}
