import type { Metadata } from "next";
import { hireFleet, toCard } from "@/lib/cars";
import HireBuilder from "@/components/HireBuilder";


export const metadata: Metadata = {
  title: "Luxury car hire in Nairobi",
  description: "Chauffeur-driven luxury cars for weddings, airport transfers and corporate events in Nairobi.",
};

export default async function HirePage({ searchParams }: { searchParams: Promise<{ car?: string }> }) {
  const [fleet, sp] = await Promise.all([hireFleet(), searchParams]);
  const cars = fleet.map(toCard).sort((a, b) => Number(/bentley/i.test(b.make)) - Number(/bentley/i.test(a.make)));
  return (
    <div className="page">
      <div className="wrap">
        <header className="page__head">
          <p className="eyebrow">Car hire</p>
          <h1 className="h1">Chauffeured luxury hire</h1>
          <p>For weddings, airport transfers and corporate events. Pick a car and send your request.</p>
        </header>
        <HireBuilder fleet={cars} initialCar={sp.car} />
      </div>
    </div>
  );
}
