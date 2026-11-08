import type { Metadata } from "next";
import { Suspense } from "react";
import { listPublicCars, toCard } from "@/lib/cars";
import InventoryBrowser from "@/components/InventoryBrowser";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Showroom: luxury cars for sale in Nairobi",
  description:
    "Browse RNN Motors' current stock: Bentley, Aston Martin, Porsche, Mercedes-AMG, Range Rover and more, on the floor at The Retro Hub, Lavington.",
};

export default async function CarsPage() {
  const cars = (await listPublicCars(true)).map(toCard);
  const live = cars.filter((c) => c.status !== "sold").length;
  return (
    <section className="page page--cars">
      <header className="page__head">
        <p className="eyebrow"><span className="line" /> Showroom</p>
        <h1 className="h1">The <em>collection</em></h1>
        <p className="page__lede">
          {live} cars on the floor at The Retro Hub right now. Filter, shortlist the ones you like, and send them to the team in one message.
        </p>
      </header>
      <Suspense fallback={<div className="grid" />}>
        <InventoryBrowser cars={cars} />
      </Suspense>
    </section>
  );
}
