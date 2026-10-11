import type { MetadataRoute } from "next";

const SITE = "https://tossvisibilityos.com";

// Result pages are private to whoever has the link, so crawlers stay out of them (PV-03).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/scan", "/api", "/dashboard", "/onboarding", "/settings", "/businesses"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
