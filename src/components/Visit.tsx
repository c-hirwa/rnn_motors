"use client";

import { SITE, waLink } from "@/lib/site";
import { useOpenState } from "./OpenDot";

const ROWS: [number, string][] = [
  [1, "Monday"], [2, "Tuesday"], [3, "Wednesday"], [4, "Thursday"], [5, "Friday"], [6, "Saturday"], [0, "Sunday"],
];
const fmt = (h: [number, number] | null) => (h ? `${h[0]}:00 – ${h[1]}:00` : "Closed");

export default function Visit({ heading = true }: { heading?: boolean }) {
  const s = useOpenState();
  return (
    <section className={heading ? "section" : ""} id="visit">
      <div className="wrap">
        {heading && (
          <div className="section-head">
            <div>
              <p className="eyebrow">Visit us</p>
              <h2 className="h2">The Retro Hub, Lavington</h2>
            </div>
          </div>
        )}
        <div className="visit__grid">
          <div className="visit__info">
            <div className="open-now">
              <span className={`status-dot ${s ? (s.open ? "is-open" : "is-closed") : ""}`} />
              <div>
                <strong>{s?.title ?? "Opening hours"}</strong>
                <small>{s?.sub ?? "Mon–Fri 9–5, Sat 9–1"}</small>
              </div>
            </div>
            <div className="visit__block">
              <h3>Address</h3>
              <p>{SITE.address.line1}<br />{SITE.address.line2}<br />{SITE.address.city}</p>
              <a className="link" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SITE.mapsQuery)}`} target="_blank" rel="noopener">
                Get directions →
              </a>
            </div>
            <div className="visit__block">
              <h3>Hours</h3>
              <ul className="hours">
                {ROWS.map(([d, name]) => (
                  <li key={d} className={s?.day === d ? "is-today" : ""}><span>{name}</span><span>{fmt(SITE.hours[d])}</span></li>
                ))}
              </ul>
            </div>
            <div className="visit__block">
              <h3>Call or message</h3>
              <div className="phones">
                {SITE.phones.map((p) => <a key={p.tel} href={`tel:${p.tel}`}>{p.label}</a>)}
              </div>
              <div className="visit__actions">
                <a className="btn btn--wa btn--sm" href={waLink("Hi RNN Motors, ")} target="_blank" rel="noopener">WhatsApp</a>
                <a className="btn btn--ghost btn--sm" href={SITE.instagram} target="_blank" rel="noopener">Instagram</a>
              </div>
            </div>
          </div>
          <div className="visit__map">
            <iframe
              title="Map to RNN Motors, Ndoto Road, Lavington"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&z=15&output=embed`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
