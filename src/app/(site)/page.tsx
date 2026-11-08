import Link from "next/link";
import { featuredCars, listPublicCars, toCard } from "@/lib/cars";
import { carName } from "@/lib/format";
import Loader from "@/components/home/Loader";
import Hero, { type Slide } from "@/components/home/Hero";
import Intro from "@/components/home/Intro";
import Signature from "@/components/home/Signature";
import Services from "@/components/home/Services";
import CarCard from "@/components/CarCard";
import ImportSteps from "@/components/ImportSteps";
import Visit from "@/components/Visit";

export const revalidate = 300;

const MARQUES = ["Bentley", "Aston Martin", "Porsche", "Mercedes-Maybach", "Mercedes-AMG", "Range Rover", "Audi", "Ford Raptor", "Toyota Land Cruiser"];

export default async function Home() {
  const [all, featured] = await Promise.all([listPublicCars(), featuredCars()]);
  const cards = all.map(toCard);
  const sig = (featured.length ? featured : all.slice(0, 4)).map(toCard);
  const slides: Slide[] = sig
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
  const latest = cards.slice(0, 6);
  const marques = new Set(all.map((c) => c.make)).size;
  const pick = (re: RegExp) => cards.find((c) => re.test(carName(c)))?.photo?.url ?? cards[0]?.photo?.url ?? null;

  return (
    <>
      <Loader />
      <Hero slides={slides} />

      <div className="marquee" aria-label="Brands we deal in">
        <div className="marquee__track">
          {[...MARQUES, ...MARQUES].map((m, i) => (
            <span key={i} className="marquee__item"><span>{m}</span><b>✦</b></span>
          ))}
        </div>
      </div>

      <Intro inStock={all.length} marques={marques} />

      <section className="showroom" id="showroom">
        <div className="section-head" data-reveal>
          <div>
            <p className="eyebrow"><span className="line" /> Showroom</p>
            <h2 className="h2">On the floor <em>today</em></h2>
          </div>
          <p className="section-head__aside">
            Every car is inspected, documented and ready for a viewing at The Retro Hub. Tap any car for photos, the full spec sheet and price.
          </p>
        </div>
        <div className="grid" data-reveal-group>
          {latest.map((c, i) => <CarCard key={c.id} car={c} priority={i < 3} />)}
        </div>
        <div className="showroom__more" data-reveal>
          <Link href="/cars" className="btn btn--gold" data-magnetic>See all {all.length} cars <span className="arrow">→</span></Link>
        </div>
      </section>

      <Signature cars={sig} />

      <Services
        items={[
          { href: "/cars", title: "Sales & Trade-ins", text: "Brand-new zero-mileage cars and certified low-mileage imports, with flexible pricing. Bring your current car in part-exchange.", img: pick(/cayenne s/i) },
          { href: "/import", title: "Custom Importation", text: "Tell us the exact spec. We source it overseas, then ship, clear, register and hand it over in Nairobi.", img: pick(/sport p400/i) },
          { href: "/hire", title: "Luxury Car Hire", text: "Weddings, executive airport transfers and corporate events, with our own fleet and our own chauffeurs.", img: pick(/flying spur/i) },
        ]}
      />

      <section className="import import--teaser">
        <div className="section-head" data-reveal>
          <div>
            <p className="eyebrow"><span className="line" /> Importation</p>
            <h2 className="h2">Your exact spec, <em>delivered</em> to Nairobi.</h2>
          </div>
          <p className="section-head__aside">
            Japan, the UK, the UAE or Europe. We handle the whole chain, from finding the car to putting Kenyan plates on it.
          </p>
        </div>
        <ImportSteps />
        <div className="showroom__more" data-reveal>
          <Link href="/import#estimator" className="btn btn--gold" data-magnetic>Estimate your landed cost <span className="arrow">→</span></Link>
        </div>
      </section>

      <Visit />
    </>
  );
}
