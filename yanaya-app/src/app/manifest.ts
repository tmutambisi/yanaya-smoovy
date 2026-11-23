import type { MetadataRoute } from "next";

/** Web app manifest: lets customers "install" Yanaya to their home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yanaya: Order Smoovy Baobab",
    short_name: "Yanaya",
    description: "Order Smoovy Baobab for delivery or Click & Collect.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#00662a",
    theme_color: "#2a2a2c",
    categories: ["food", "shopping", "health"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
