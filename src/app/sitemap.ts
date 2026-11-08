import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cars = await db.car.findMany({ where: { status: { in: ["available", "reserved"] } }, select: { slug: true, updatedAt: true } });
  const pages = ["", "/cars", "/import", "/hire", "/visit"].map((p) => ({ url: SITE.url + p, changeFrequency: "weekly" as const, priority: p ? 0.8 : 1 }));
  return [...pages, ...cars.map((c) => ({ url: `${SITE.url}/cars/${c.slug}`, lastModified: c.updatedAt, priority: 0.7 }))];
}
