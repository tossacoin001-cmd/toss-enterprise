import type { MetadataRoute } from "next";

const BASE_URL = "https://toss-enterprise.vercel.app";

const routes = ["", "/services", "/work", "/products", "/process", "/pricing", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
}
