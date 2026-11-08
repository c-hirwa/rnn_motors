import type { Metadata } from "next";
import { hireFleet, toCard } from "@/lib/cars";
import HireBuilder from "@/components/HireBuilder";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Luxury car hire in Nairobi",
  description:
    "Chauffeur-driven Bentley, Mercedes S-Class, G 63, Range Rover and more for weddings, airport transfers and corporate events in Nairobi.",
};

export default async function HirePage({ searchParams }: { searchParams: Promise<{ car?: string }> }) {
  const [fleet, sp] = await Promise.all([hireFleet(), searchParams]);
  const cars = fleet.map(toCard);
  const bg = cars.find((c) => /flying spur/i.test(c.model))?.photo?.url ?? cars[0]?.photo?.url;
  return (
    <section className="hire page">
      {bg && <div className="hire__bg"><img src={bg} alt="" /></div>}
      <div className="hire__inner">
        <header className="page__head">
          <p className="eyebrow"><span className="line" /> Luxury Hire</p>
          <h1 className="h1">Arrive the way <em>you mean it.</em></h1>
          <p className="page__lede">
            Chauffeur-driven hire from our own fleet. Build your booking below and we'll confirm availability and the rate.
          </p>
        </header>
        <HireBuilder fleet={cars} initialCar={sp.car} />
      </div>
    </section>
  );
}
