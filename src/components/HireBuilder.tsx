"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { CardCar } from "@/lib/cars";
import { carName } from "@/lib/format";
import { waLink } from "@/lib/site";
import EnquiryForm from "./EnquiryForm";

const OCCASIONS = ["Wedding", "Airport transfer", "Corporate event", "Upcountry trip", "Other"];
const DURATIONS = ["Half day (4 hrs)", "Full day (8 hrs)", "2+ days", "One-way transfer"];

export default function HireBuilder({ fleet, initialCar }: { fleet: CardCar[]; initialCar?: string }) {
  const [carId, setCarId] = useState(() => fleet.find((c) => c.slug === initialCar)?.id ?? fleet[0]?.id);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [date, setDate] = useState(tomorrow);
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [pickup, setPickup] = useState("");

  const car = fleet.find((c) => c.id === carId) ?? fleet[0];
  if (!car) return <p className="muted">Our hire fleet is being updated. Please call us for availability.</p>;

  const wa = waLink(
    `Hi RNN Motors, I'd like to hire the ${carName(car)}.\n• Occasion: ${occasion}\n• Date: ${date}\n• Duration: ${duration}\n• Pick-up: ${pickup || "To confirm"}`
  );

  return (
    <div className="hire__layout">
      <div>
        <p className="step-label">1. Choose a car</p>
        <div className="fleet">
          {fleet.map((c) => (
            <button type="button" key={c.id} className={`fleet__car ${c.id === car.id ? "is-active" : ""}`} aria-pressed={c.id === car.id} onClick={() => setCarId(c.id)}>
              <div className="fleet__img">
                {c.photo && <Image src={c.photo.url} alt="" fill sizes="(max-width: 820px) 50vw, 240px" style={{ objectFit: "cover", objectPosition: c.photo.focus }} />}
              </div>
              <span><small>{c.make}</small>{c.model}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel hire__form">
        <h2>2. Your booking</h2>
        <p>{carName(car)} with a chauffeur. We&apos;ll confirm availability and the rate.</p>
        <div className="eform" style={{ marginBottom: 14 }}>
          <label><span>Occasion</span>
            <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>{OCCASIONS.map((o) => <option key={o}>{o}</option>)}</select>
          </label>
          <label><span>Date</span>
            <input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label><span>Duration</span>
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>{DURATIONS.map((d) => <option key={d}>{d}</option>)}</select>
          </label>
          <label><span>Pick-up location</span>
            <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="e.g. JKIA, Karen" />
          </label>
        </div>
        <EnquiryForm
          type="hire"
          carId={car.id}
          compact
          details={{ occasion, date, duration, pickup }}
          messageLabel="Anything else? (optional)"
          submitLabel="Request booking"
          waHref={wa}
        />
      </div>
    </div>
  );
}
