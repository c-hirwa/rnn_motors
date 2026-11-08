import type { Metadata } from "next";
import { Suspense } from "react";
import { listPublicCars, toCard } from "@/lib/cars";
import InventoryBrowser from "@/components/InventoryBrowser";


export const metadata: Metadata = {
  title: "Showroom: luxury cars for sale in Nairobi",
  description: "Browse RNN Motors' current stock: Bentley, Aston Martin, Porsche, Mercedes-AMG, Range Rover and more, at The Retro Hub, Lavington.",
};

export default async function CarsPage() {
  const cars = (await listPublicCars(true)).map(toCard);
  const live = cars.filter((c) => c.status !== "sold").length;
  return (
    <div className="page">
      <div className="wrap">
        <header className="page__head">
          <p className="eyebrow">Showroom</p>
          <h1 className="h1">Cars for sale</h1>
          <p>{live} cars available to view at our Lavington showroom.</p>
        </header>
        <Suspense fallback={<div className="grid" />}>
          <InventoryBrowser cars={cars} />
        </Suspense>
      </div>
    </div>
  );
}
