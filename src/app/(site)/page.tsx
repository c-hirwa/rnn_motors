import Link from "next/link";
import { featuredCars, listPublicCars, toCard } from "@/lib/cars";
import { carName } from "@/lib/format";
import Hero, { type Slide } from "@/components/home/Hero";
import CarCard from "@/components/CarCard";
import Visit from "@/components/Visit";

export const revalidate = 300;

const SERVICES = [
  {
    href: "/cars",
    title: "Buy a car",
    text: "New and low-mileage luxury cars, ready to view at our Lavington showroom. Trade-ins welcome.",
    cta: "See the showroom",
    icon: "M5 17h14M6.5 17a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm14 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM3 17v-4l2-5h14l2 5v4",
  },
  {
    href: "/import",
    title: "Import to order",
    text: "Tell us the car you want. We find it abroad and deliver it to you, registered and ready to drive.",
    cta: "Request a car",
    icon: "M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20",
  },
  {
    href: "/hire",
    title: "Chauffeured hire",
    text: "Weddings, airport transfers and corporate events, with our own cars and drivers.",
    cta: "Book a car",
    icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  },
];

export default async function Home() {
  const [all, featured] = await Promise.all([listPublicCars(), featuredCars()]);
  const cards = all.map(toCard);
  const slides: Slide[] = (featured.length ? featured : all)
    .map(toCard)
    .filter((c) => c.photo)
    .slice(0, 4)
    .map((c) => ({
      slug: c.slug,
      title: carName(c),
      sub: [c.year, c.body].filter(Boolean).join(" · "),
      url: c.photo!.url,
      focus: c.photo!.focus,
      alt: `${c.colour} ${carName(c)}`,
    }));

  return (
    <>
      <Hero slides={slides} count={all.length} />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Showroom</p>
              <h2 className="h2">Available now</h2>
            </div>
            <Link href="/cars" className="link">View all {all.length} cars →</Link>
          </div>
          <div className="grid">
            {cards.slice(0, 6).map((c) => <CarCard key={c.id} car={c} />)}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">What we do</p>
              <h2 className="h2">Buy, import or hire</h2>
            </div>
          </div>
          <div className="services">
            {SERVICES.map((s) => (
              <Link key={s.href} href={s.href} className="service">
                <span className="service__icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={s.icon} /></svg>
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className="link">{s.cta} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Visit />
    </>
  );
}
