import type { MetadataRoute } from "next";
import { listPublicCars } from "@/lib/cars";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/cars", "/import", "/hire", "/visit"].map((p) => ({
    url: SITE.url + p,
    changeFrequency: "weekly" as const,
    priority: p ? 0.8 : 1,
  }));
  return [...pages, ...listPublicCars().map((c) => ({ url: `${SITE.url}/cars/${c.slug}`, priority: 0.7 }))];
}
