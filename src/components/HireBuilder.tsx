"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import type { CardCar } from "@/lib/cars";
import { carName } from "@/lib/format";
import { waLink } from "@/lib/site";
import EnquiryForm from "./EnquiryForm";
import { prefersReduced, useShell } from "./Shell";

const OCCASIONS = [
  { v: "Wedding", icon: "💍", match: /bentley|rolls|maybach/i },
  { v: "Airport transfer", icon: "✈", match: /s ?500|s-class|s 580|maybach|a8/i },
  { v: "Corporate event", icon: "◆", match: /vito|v-class|sprinter/i },
  { v: "Upcountry trip", icon: "⛰", match: /prado|land cruiser|raptor|defender/i },
  { v: "Special occasion", icon: "✦", match: /g ?63|g-class|range rover|aston/i },
];
const DURATIONS = ["Half day (4 hrs)", "Full day (8 hrs)", "2 days", "3+ days", "One-way transfer"];

export default function HireBuilder({ fleet, initialCar }: { fleet: CardCar[]; initialCar?: string }) {
  const { toast } = useShell();
  const [occasion, setOccasion] = useState(OCCASIONS[0].v);
  const [carId, setCarId] = useState(
    () =>
      fleet.find((c) => c.slug === initialCar)?.id ??
      fleet.find((c) => OCCASIONS[0].match.test(carName(c)))?.id ??
      fleet[0]?.id
  );
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const [date, setDate] = useState(tomorrow);
  const [pickup, setPickup] = useState("");
  const [duration, setDuration] = useState(DURATIONS[1]);
  const imgRef = useRef<HTMLDivElement>(null);

  const car = fleet.find((c) => c.id === carId) ?? fleet[0];

  useEffect(() => {
    if (prefersReduced() || !imgRef.current) return;
    gsap.fromTo(imgRef.current, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.7, ease: "expo.out" });
  }, [carId]);

  if (!car) return <p className="muted">The hire fleet is being updated. Call us for availability.</p>;

  const pickOccasion = (v: string) => {
    setOccasion(v);
    const o = OCCASIONS.find((x) => x.v === v)!;
    const m = fleet.find((c) => o.match.test(carName(c)));
    if (m && m.id !== carId) {
      setCarId(m.id);
      toast(`Suggested: ${carName(m)}`);
    }
  };

  const niceDate = date
    ? new Date(date + "T12:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "Date to confirm";
  const line = `${occasion} · ${niceDate} · ${duration}${pickup ? " · from " + pickup : ""}`;
  const wa = waLink(
    `Hi RNN Motors, I'd like to hire the ${carName(car)} with a chauffeur.\n• Occasion: ${occasion}\n• Date: ${niceDate}\n• Duration: ${duration}\n• Pick-up: ${pickup || "To confirm"}\n\nIs it available, and what's the rate?`
  );

  return (
    <div className="booking">
      <div className="booking__step">
        <span className="booking__num">1</span>
        <h4>The occasion</h4>
        <div className="occasions">
          {OCCASIONS.map((o) => (
            <button type="button" key={o.v} className={`occ ${occasion === o.v ? "is-active" : ""}`} onClick={() => pickOccasion(o.v)}>
              <b>{o.icon}</b>{o.v}
            </button>
          ))}
        </div>
      </div>

      <div className="booking__step">
        <span className="booking__num">2</span>
        <h4>The car</h4>
        <div className="fleet">
          {fleet.map((c) => (
            <button type="button" key={c.id} className={`fleet__car ${c.id === car.id ? "is-active" : ""}`} aria-pressed={c.id === car.id} onClick={() => setCarId(c.id)}>
              {c.photo && <Image src={c.photo.url} alt="" fill sizes="(max-width: 900px) 45vw, 22vw" style={{ objectFit: "cover", objectPosition: c.photo.focus }} />}
              <span><small>{c.make}</small>{c.model}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="booking__step">
        <span className="booking__num">3</span>
        <h4>The details</h4>
        <div className="details">
          <label><span>Date</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label><span>Pick-up</span><input type="text" placeholder="e.g. JKIA, Karen, Westlands" value={pickup} onChange={(e) => setPickup(e.target.value)} /></label>
          <label className="details__wide"><span>Duration</span>
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
              {DURATIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="ticket">
        <div className="ticket__img" ref={imgRef}>
          {car.photo && <Image src={car.photo.url} alt={carName(car)} fill sizes="(max-width: 640px) 100vw, 300px" style={{ objectFit: "cover", objectPosition: car.photo.focus }} />}
        </div>
        <div className="ticket__body">
          <p className="eyebrow">Your request</p>
          <h4>{carName(car)}</h4>
          <p className="ticket__line">{line}</p>
          <EnquiryForm
            type="hire"
            carId={car.id}
            compact
            light
            details={{ occasion, date, duration, pickup }}
            messageLabel="Anything else? (optional)"
            submitLabel="Request booking"
            waHref={wa}
          />
        </div>
      </div>
    </div>
  );
}
