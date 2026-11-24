import type { MetadataRoute } from "next";

/** Web app manifest: lets visitors add Smoovy to their home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Smoovy by Yanaya",
    short_name: "Smoovy",
    description: "Energy in a bottle. Happiness you can taste. Fruit smoothies by Yanaya.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#2a2a2c",
    theme_color: "#2a2a2c",
    categories: ["food", "health", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
