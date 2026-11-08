import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";

export const withPhotos = { photos: { orderBy: { position: "asc" } } } satisfies Prisma.CarInclude;
export type CarWithPhotos = Prisma.CarGetPayload<{ include: typeof withPhotos }>;

/** Cars visible on the public site (never drafts). */
const publicWhere = (includeSold = false): Prisma.CarWhereInput => ({
  status: { in: includeSold ? ["available", "reserved", "sold"] : ["available", "reserved"] },
});

export const listPublicCars = (includeSold = false) =>
  db.car.findMany({
    where: publicWhere(includeSold),
    include: withPhotos,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

export const featuredCars = () =>
  db.car.findMany({
    where: { ...publicWhere(), featured: true },
    include: withPhotos,
    orderBy: { updatedAt: "desc" },
    take: 6,
  });

export const hireFleet = () =>
  db.car.findMany({
    where: { forHire: true, status: { not: "draft" } },
    include: withPhotos,
    orderBy: { createdAt: "asc" },
  });

export const getCarBySlug = (slug: string) =>
  db.car.findFirst({ where: { slug, status: { not: "draft" } }, include: withPhotos });

export async function similarCars(car: { id: string; category: string; make: string }) {
  const list = await db.car.findMany({
    where: { ...publicWhere(), id: { not: car.id }, OR: [{ category: car.category }, { make: car.make }] },
    include: withPhotos,
    take: 8,
  });
  return list.sort((a, b) => Number(b.make === car.make) - Number(a.make === car.make)).slice(0, 3);
}

/** Lightweight, serialisable shape passed to client components. */
export type CardCar = {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number | null;
  category: string;
  body: string;
  colour: string;
  power: string | null;
  fuel: string | null;
  mileageKm: number | null;
  condition: string | null;
  priceKes: number | null;
  status: string;
  forHire: boolean;
  featured: boolean;
  description: string;
  createdAt: string;
  photo: { url: string; focus: string; width: number; height: number } | null;
};

export const toCard = (c: CarWithPhotos): CardCar => ({
  id: c.id,
  slug: c.slug,
  make: c.make,
  model: c.model,
  year: c.year,
  category: c.category,
  body: c.body,
  colour: c.colour,
  power: c.power,
  fuel: c.fuel,
  mileageKm: c.mileageKm,
  condition: c.condition,
  priceKes: c.priceKes,
  status: c.status,
  forHire: c.forHire,
  featured: c.featured,
  description: c.description,
  createdAt: c.createdAt.toISOString(),
  photo: c.photos[0]
    ? { url: `/media/${c.photos[0].key}`, focus: c.photos[0].focus, width: c.photos[0].width, height: c.photos[0].height }
    : null,
});
