import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CARS } from "@/data/cars";
import { getCarBySlug, similarCars, toCard } from "@/lib/cars";
import { CONDITIONS, carName, carTitle, km, priceLabel } from "@/lib/format";
import { SITE, waLink } from "@/lib/site";
import Gallery from "@/components/Gallery";
import CarCard from "@/components/CarCard";
import EnquiryForm from "@/components/EnquiryForm";
import { CarActions, StickyBar } from "@/components/CarActions";
import { WaIcon } from "@/components/WaFloat";

type Props = { params: Promise<{ slug: string }> };

// Every car page is built ahead of time.
export const dynamicParams = false;
export const generateStaticParams = () => CARS.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = getCarBySlug((await params).slug);
  if (!car) return { title: "Car not found" };
  const description = `${car.colour} ${carTitle(car)}${car.mileageKm != null ? `, ${km(car.mileageKm)}` : ""}. ${priceLabel(car.priceKes)}. ${car.description}`.slice(0, 300);
  const img = car.photos[0];
  return {
    title: `${carTitle(car)} for sale in Nairobi`,
    description,
    alternates: { canonical: `/cars/${car.slug}` },
    openGraph: { title: `${carTitle(car)} | RNN Motors`, description, images: img ? [{ url: img.src, width: img.width, height: img.height }] : [] },
  };
}

export default async function CarPage({ params }: Props) {
  const car = getCarBySlug((await params).slug);
  if (!car) notFound();
  const similar = similarCars(car).map(toCard);
  const name = carName(car);
  const title = carTitle(car);
  const sold = car.status === "sold";
  const price = sold ? "Sold" : priceLabel(car.priceKes);
  const url = `${SITE.url}/cars/${car.slug}`;
  const waText = sold
    ? `Hi RNN Motors, I saw the ${title} on your website. Can you find me one like it?\n${url}`
    : `Hi RNN Motors, I'm interested in the ${title} (${car.colour}). Is it still available?\n${url}`;
  const photos = car.photos.map((p) => ({ url: p.src, focus: p.focus, width: p.width, height: p.height }));
  const features = car.features ?? [];

  // Only show specs we actually have.
  const specs = (
    [
      ["Year", car.year?.toString()],
      ["Mileage", km(car.mileageKm)],
      ["Condition", car.condition ? CONDITIONS[car.condition] : null],
      ["Engine", car.engine],
      ["Power", car.power],
      ["Transmission", car.transmission],
      ["Drivetrain", car.drive],
      ["Fuel", car.fuel],
      ["Body", car.body],
      ["Colour", car.colour],
      ["Interior", car.interior],
    ] as [string, string | null | undefined][]
  ).filter(([, v]) => v);

  const facts = (
    [["Mileage", km(car.mileageKm)], ["Power", car.power], ["Drive", car.drive], ["Fuel", car.fuel], ["Year", car.year?.toString()]] as [string, string | null | undefined][]
  )
    .filter(([, v]) => v)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    brand: { "@type": "Brand", name: car.make },
    model: car.model,
    vehicleModelDate: car.year ?? undefined,
    color: car.colour,
    bodyType: car.body,
    fuelType: car.fuel,
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
    <div className="page car-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap">
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
            <p className="car__make">{car.make}</p>
            <h1 className="car__title">{car.model}</h1>
            <p className="car__sub">{[car.year, car.body, car.colour].filter(Boolean).join(" · ")}</p>

            <div className="car__price">
              <strong>{price}</strong>
              {!sold && <small>{car.priceKes ? "Trade-ins welcome" : "Call or WhatsApp for today's price"}</small>}
            </div>

            {facts.length > 0 && (
              <ul className="car__facts">
                {facts.map(([k, v]) => <li key={k}><small>{k}</small>{v}</li>)}
              </ul>
            )}

            {sold ? (
              <div className="car__sold">
                <p>This car has been sold. We can find you another one.</p>
                <Link className="btn btn--primary btn--block" href="/import">Find me one like it</Link>
              </div>
            ) : (
              <div className="car__ctas">
                <a className="btn btn--wa btn--block" href={waLink(waText)} target="_blank" rel="noopener"><WaIcon size={18} /> Enquire on WhatsApp</a>
                <div className="car__ctas-row">
                  <a className="btn btn--ghost" href={`tel:${SITE.phones[0].tel}`}>Call</a>
                  <a className="btn btn--ghost" href="#enquire">Book a viewing</a>
                </div>
              </div>
            )}
            {car.forHire && !sold && <Link className="car__hire" href={`/hire?car=${car.slug}`}>Also available for chauffeured hire →</Link>}
            <CarActions item={{ id: car.slug, slug: car.slug, name, make: car.make, model: car.model, img: photos[0]?.url ?? null }} />
          </aside>
        </div>

        <div className="car__details">
          <div>
            <h2>Overview</h2>
            <p className="car__desc">{car.description}</p>
            {features.length > 0 && <ul className="car__features">{features.map((f) => <li key={f}>{f}</li>)}</ul>}
          </div>
          {specs.length > 0 && (
            <div>
              <h2>Specifications</h2>
              <dl className="specs">
                {specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
            </div>
          )}
        </div>

        {!sold && (
          <section className="panel split" id="enquire" style={{ marginTop: "clamp(40px,5vw,64px)", scrollMarginTop: "calc(var(--nav-h) + 20px)" }}>
            <div>
              <h2 className="h2">Book a viewing</h2>
              <p>Pick a day and we&apos;ll confirm a time at our Lavington showroom.</p>
            </div>
            <EnquiryForm intro={`I'd like to book a viewing of the ${title}.\n${url}`} showDate messageLabel="Anything else? (optional)" submitLabel="Request viewing on WhatsApp" />
          </section>
        )}

        {similar.length > 0 && (
          <section style={{ marginTop: "clamp(48px,6vw,80px)" }}>
            <div className="section-head">
              <h2 className="h2">Similar cars</h2>
              <Link href="/cars" className="link">View all →</Link>
            </div>
            <div className="grid">{similar.map((c) => <CarCard key={c.id} car={c} />)}</div>
          </section>
        )}
      </div>
      <StickyBar title={name} price={price} wa={waLink(waText)} />
    </div>
  );
}
