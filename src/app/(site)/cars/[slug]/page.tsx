import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCarBySlug, similarCars, toCard } from "@/lib/cars";
import { CATEGORIES, CONDITIONS, carName, carTitle, km, mediaUrl, priceLabel } from "@/lib/format";
import { SITE, waLink } from "@/lib/site";
import Gallery from "@/components/Gallery";
import CarCard from "@/components/CarCard";
import EnquiryForm from "@/components/EnquiryForm";
import { CarActions, StickyBar } from "@/components/CarActions";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug((await params).slug);
  if (!car) return { title: "Car not found" };
  const title = `${carTitle(car)} for sale in Nairobi`;
  const description = `${car.colour} ${carTitle(car)}${car.mileageKm != null ? `, ${km(car.mileageKm)}` : ""}. ${priceLabel(car.priceKes)}. ${car.description}`.slice(0, 300);
  const img = car.photos[0];
  return {
    title,
    description,
    alternates: { canonical: `/cars/${car.slug}` },
    openGraph: { title: `${carTitle(car)} | RNN Motors`, description, images: img ? [{ url: mediaUrl(img.key), width: img.width, height: img.height }] : [] },
  };
}

export default async function CarPage({ params }: Props) {
  const car = await getCarBySlug((await params).slug);
  if (!car) notFound();
  const similar = (await similarCars(car)).map(toCard);
  const name = carName(car);
  const title = carTitle(car);
  const sold = car.status === "sold";
  const price = sold ? "Sold" : priceLabel(car.priceKes);
  const url = `${SITE.url}/cars/${car.slug}`;
  const waText = sold
    ? `Hi RNN Motors, I saw the ${title} (sold) on your website. Can you find me one like it?\n${url}`
    : `Hi RNN Motors, I'm interested in the ${title} (${car.colour}). Is it still available?\n${url}`;
  const photos = car.photos.map((p) => ({ url: mediaUrl(p.key), focus: p.focus, width: p.width, height: p.height }));
  const features = car.features.split("\n").map((f) => f.trim()).filter(Boolean);

  const specs: [string, string | null | undefined][] = [
    ["Year", car.year?.toString()],
    ["Mileage", km(car.mileageKm)],
    ["Condition", car.condition ? CONDITIONS[car.condition as keyof typeof CONDITIONS] : null],
    ["Engine", car.engine],
    ["Power", car.power],
    ["Transmission", car.transmission],
    ["Drivetrain", car.drive],
    ["Fuel", car.fuel],
    ["Body", car.body],
    ["Exterior", car.colour],
    ["Interior", car.interior],
    ["Category", CATEGORIES[car.category as keyof typeof CATEGORIES]],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    brand: { "@type": "Brand", name: car.make },
    model: car.model,
    vehicleModelDate: car.year ?? undefined,
    color: car.colour,
    bodyType: car.body,
    fuelType: car.fuel ?? undefined,
    vehicleTransmission: car.transmission ?? undefined,
    mileageFromOdometer: car.mileageKm != null ? { "@type": "QuantitativeValue", value: car.mileageKm, unitCode: "KMT" } : undefined,
    image: photos.map((p) => SITE.url + p.url),
    description: car.description,
    url,
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: car.priceKes ?? undefined,
      availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", name: "RNN Motors", telephone: SITE.phones[0].tel },
    },
  };

  return (
    <article className="car">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/cars">Showroom</Link>
        <span>/</span>
        <Link href={`/cars?make=${encodeURIComponent(car.make)}`}>{car.make}</Link>
        <span>/</span>
        <span aria-current="page">{car.model}</span>
      </nav>

      <div className="car__top">
        <Gallery photos={photos} alt={`${car.colour} ${name}`} status={car.status} />

        <aside className="car__panel">
          <p className="eyebrow">{car.make} · {CATEGORIES[car.category as keyof typeof CATEGORIES]}</p>
          <h1 className="car__title">{car.model}</h1>
          <p className="car__sub">{[car.year, car.body, car.colour].filter(Boolean).join("  ·  ")}</p>

          <div className="car__price">
            <span>{price}</span>
            {!sold && <small>{car.priceKes ? "Trade-ins welcome · Financing on request" : "Call or WhatsApp for today's price"}</small>}
          </div>

          <ul className="car__facts">
            {car.mileageKm != null && <li><small>Mileage</small>{km(car.mileageKm)}</li>}
            {car.power && <li><small>Power</small>{car.power}</li>}
            {car.drive && <li><small>Drive</small>{car.drive}</li>}
            {car.fuel && <li><small>Fuel</small>{car.fuel}</li>}
          </ul>

          {sold ? (
            <div className="car__sold">
              <strong>This one has found a new home.</strong>
              <p>We can source the same model for you, to your spec.</p>
              <Link className="btn btn--gold btn--block" href="/import">Find me one like it <span className="arrow">→</span></Link>
            </div>
          ) : (
            <div className="car__ctas">
              <a className="btn btn--gold btn--block" href={waLink(waText)} target="_blank" rel="noopener" data-magnetic>Enquire on WhatsApp <span className="arrow">→</span></a>
              <a className="btn btn--ghost btn--block" href="#enquire">Book a viewing</a>
              <a className="btn btn--ghost btn--block" href={`tel:${SITE.phones[0].tel}`}>Call {SITE.phones[0].label}</a>
            </div>
          )}
          {car.forHire && !sold && (
            <Link className="car__hire" href={`/hire?car=${car.slug}`}>✦ Also available for chauffeured hire →</Link>
          )}
          <CarActions item={{ id: car.id, slug: car.slug, name, make: car.make, model: car.model, img: photos[0]?.url ?? null }} />
        </aside>
      </div>

      <div className="car__details">
        <div className="car__about" data-reveal>
          <h2 className="h3">About this car</h2>
          <p className="car__desc">{car.description}</p>
          {features.length > 0 && (
            <>
              <h3 className="car__h">Highlights</h3>
              <ul className="car__features">{features.map((f) => <li key={f}>{f}</li>)}</ul>
            </>
          )}
        </div>
        <div className="car__specs" data-reveal>
          <h2 className="h3">Specifications</h2>
          <dl className="specs">
            {specs.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v || <span className="muted">On request</span>}</dd></div>
            ))}
          </dl>
          <p className="fineprint">Specs are indicative; please confirm the exact build, mileage and price with our sales team.</p>
        </div>
      </div>

      {!sold && (
        <section className="car__enquire" id="enquire" data-reveal>
          <div>
            <p className="eyebrow"><span className="line" /> Book a viewing</p>
            <h2 className="h2">Come and <em>see it</em> in person.</h2>
            <p className="muted">
              Leave your details and we'll confirm a time at The Retro Hub, Lavington. Open Monday to Friday 9:00 to 17:00 and Saturday 9:00 to 13:00.
            </p>
          </div>
          <EnquiryForm
            type="viewing"
            carId={car.id}
            showDate
            message={`I'd like to view the ${title}.`}
            submitLabel="Request a viewing"
            waHref={waLink(waText)}
          />
        </section>
      )}

      {similar.length > 0 && (
        <section className="car__similar">
          <div className="section-head" data-reveal>
            <div>
              <p className="eyebrow"><span className="line" /> You might also like</p>
              <h2 className="h2">More from the <em>floor</em></h2>
            </div>
            <Link href="/cars" className="link">View all cars →</Link>
          </div>
          <div className="grid" data-reveal-group>
            {similar.map((c) => <CarCard key={c.id} car={c} />)}
          </div>
        </section>
      )}

      <StickyBar title={name} price={price} wa={waLink(waText)} />
    </article>
  );
}
