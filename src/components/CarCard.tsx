"use client";

import Image from "next/image";
import Link from "next/link";
import type { CardCar } from "@/lib/cars";
import { carName, km, priceLabel } from "@/lib/format";
import { HeartIcon } from "./Nav";
import { useShell } from "./Shell";

export default function CarCard({ car, priority = false }: { car: CardCar; priority?: boolean }) {
  const { isShort, toggleShort } = useShell();
  const on = isShort(car.id);
  const sold = car.status === "sold";
  const meta = [car.year, car.body, car.mileageKm != null ? km(car.mileageKm) : car.power].filter(Boolean).join(" · ");

  return (
    <article className={`card card--${car.status}`}>
      <div className="card__media">
        {car.photo ? (
          <Image
            src={car.photo.url}
            alt={`${car.colour} ${carName(car)}`}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 400px"
            style={{ objectFit: "cover", objectPosition: car.photo.focus }}
            priority={priority}
          />
        ) : (
          <div className="card__noimg">Photo coming soon</div>
        )}
        {car.status !== "available" && <span className={`card__tag card__tag--${car.status}`}>{sold ? "Sold" : "Reserved"}</span>}
        <button
          className={`card__heart ${on ? "is-on" : ""}`}
          aria-label={on ? `Remove ${carName(car)} from shortlist` : `Save ${carName(car)} to shortlist`}
          aria-pressed={on}
          onClick={() => toggleShort({ id: car.id, slug: car.slug, name: carName(car), make: car.make, model: car.model, img: car.photo?.url ?? null })}
        >
          <HeartIcon size={17} />
        </button>
      </div>
      <Link href={`/cars/${car.slug}`} className="card__open" aria-label={`View ${carName(car)}`} />
      <div className="card__body">
        <span className="card__make">{car.make}</span>
        <h3 className="card__model">{car.model}</h3>
        <span className="card__meta">{meta}</span>
        <div className="card__foot">
          <span className={`card__price ${!car.priceKes && !sold ? "card__price--req" : ""}`}>{sold ? "Sold" : priceLabel(car.priceKes)}</span>
          {car.forHire && !sold && <span className="card__hire">Also for hire</span>}
        </div>
      </div>
    </article>
  );
}
