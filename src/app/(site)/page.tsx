import Link from "next/link";
import { featuredCars, listPublicCars, toCard } from "@/lib/cars";
import { carName } from "@/lib/format";
import Hero, { type Slide } from "@/components/home/Hero";
import Showroom from "@/components/home/Showroom";
import CarCard from "@/components/CarCard";
import Visit from "@/components/Visit";

export default async function Home() {
  const [all, featured] = await Promise.all([listPublicCars(), featuredCars()]);
  const cards = all.map(toCard);
  const makes = [...new Set(all.map((c) => c.make))];
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
      <Hero slides={slides} count={all.length} makes={makes.length} />

      <div className="marques" aria-label="Marques in our showroom">
        <div className="marques__track">
          {/* Two copies so the loop is seamless; the second is hidden from screen readers. */}
          {[0, 1].map((k) => (
            <ul key={k} aria-hidden={k === 1 || undefined}>
              {[...makes, ...makes].map((m, i) => (
                <li key={`${m}-${i}`}>{m}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>

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

      <Showroom />

      <Visit />
    </>
  );
}
