import type { MetadataRoute } from "next";

const SITE = "https://tossvisibilityos.com";

// Public pages only. Private result pages are never listed.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/pricing", "/privacy", "/terms"].map((path) => ({ url: `${SITE}${path}`, changeFrequency: "monthly" as const }));
}
