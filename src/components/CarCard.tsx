"use client";

import Image from "next/image";
import Link from "next/link";
import type { CardCar } from "@/lib/cars";
import { carName, km, priceLabel } from "@/lib/format";
import { HeartIcon } from "./Nav";
import { finePointer, prefersReduced, useShell } from "./Shell";

export default function CarCard({ car, priority = false }: { car: CardCar; priority?: boolean }) {
  const { isShort, toggleShort } = useShell();
  const on = isShort(car.id);

  const tilt = (e: React.MouseEvent<HTMLElement>) => {
    if (!finePointer() || prefersReduced()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.transition = "transform .15s ease-out";
    el.style.transform = `perspective(1100px) rotateY(${(px - 0.5) * 9}deg) rotateX(${(0.5 - py) * 7}deg) translateY(-6px)`;
    el.style.setProperty("--mx", px * 100 + "%");
    el.style.setProperty("--my", py * 100 + "%");
  };
  const reset = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transition = "";
    e.currentTarget.style.transform = "";
  };

  const tag = car.status === "sold" ? "Sold" : car.status === "reserved" ? "Reserved" : car.year ? String(car.year) : "Signature";

  return (
    <article className={`card card--${car.status}`} onMouseMove={tilt} onMouseLeave={reset} data-cursor="view" data-cursor-label="Details">
      <div className="card__media">
        {car.photo ? (
          <Image
            src={car.photo.url}
            alt={`${car.colour} ${carName(car)}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
            style={{ objectFit: "cover", objectPosition: car.photo.focus }}
            priority={priority}
          />
        ) : (
          <div className="card__noimg">Photo coming soon</div>
        )}
      </div>
      <div className="card__glare" />
      <span className={`card__tag ${car.status !== "available" ? "card__tag--" + car.status : ""}`}>{tag}</span>
      {car.forHire && car.status !== "sold" && <span className="card__tag card__tag--hire">Also for hire</span>}
      <button
        className={`card__heart ${on ? "is-on" : ""}`}
        aria-label={on ? `Remove ${carName(car)} from shortlist` : `Add ${carName(car)} to shortlist`}
        aria-pressed={on}
        data-cursor-ignore
        onClick={() =>
          toggleShort({ id: car.id, slug: car.slug, name: carName(car), make: car.make, model: car.model, img: car.photo?.url ?? null })
        }
      >
        <HeartIcon />
      </button>
      <Link href={`/cars/${car.slug}`} className="card__open" aria-label={`View ${carName(car)}`} />
      <div className="card__body">
        <div className="card__make">{car.make}</div>
        <h3 className="card__model">{car.model}</h3>
        <div className="card__meta">
          <span>{car.body}</span>
          {car.mileageKm != null ? <span>{km(car.mileageKm)}</span> : <span>{car.colour}</span>}
          {car.power && <span>{car.power}</span>}
        </div>
        <div className="card__price">{car.status === "sold" ? "Sold" : priceLabel(car.priceKes)}</div>
      </div>
    </article>
  );
}
