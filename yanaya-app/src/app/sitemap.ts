import type { MetadataRoute } from "next";
import { FLAVOURS, SITE } from "@/lib/smoovy";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...FLAVOURS.map((f) => ({
      url: `${SITE.url}/flavours/${f.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE.url}/partner`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
}
