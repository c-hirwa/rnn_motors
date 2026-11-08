import { CARS, type Car } from "@/data/cars";

export type { Car };

/** Cars shown in the showroom (sold cars only when asked for). */
export const listPublicCars = (includeSold = false) =>
  [...CARS]
    .filter((c) => includeSold || c.status !== "sold")
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.added.localeCompare(a.added));

export const featuredCars = () => listPublicCars().filter((c) => c.featured).slice(0, 6);

export const hireFleet = () => CARS.filter((c) => c.forHire && c.status !== "sold");

export const getCarBySlug = (slug: string) => CARS.find((c) => c.slug === slug) ?? null;

export function similarCars(car: Car) {
  return listPublicCars()
    .filter((c) => c.slug !== car.slug && (c.category === car.category || c.make === car.make))
    .sort((a, b) => Number(b.make === car.make) - Number(a.make === car.make))
    .slice(0, 3);
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
  priceKes: number | null;
  status: string;
  forHire: boolean;
  featured: boolean;
  added: string;
  photo: { url: string; focus: string; width: number; height: number } | null;
};

export const toCard = (c: Car): CardCar => ({
  id: c.slug,
  slug: c.slug,
  make: c.make,
  model: c.model,
  year: c.year,
  category: c.category,
  body: c.body,
  colour: c.colour,
  power: c.power ?? null,
  fuel: c.fuel ?? null,
  mileageKm: c.mileageKm,
  priceKes: c.priceKes,
  status: c.status,
  forHire: !!c.forHire,
  featured: !!c.featured,
  added: c.added,
  photo: c.photos[0] ? { url: c.photos[0].src, focus: c.photos[0].focus, width: c.photos[0].width, height: c.photos[0].height } : null,
});
