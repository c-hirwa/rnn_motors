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
    <section className="visit" id="visit">
      {heading && (
        <div className="section-head" data-reveal>
          <div>
            <p className="eyebrow"><span className="line" /> Visit</p>
            <h2 className="h2">Come and <em>sit in one.</em></h2>
          </div>
        </div>
      )}
      <div className="visit__grid">
        <div className="visit__info" data-reveal-group>
          <div className="open-now">
            <span className={`status-dot ${s ? (s.open ? "is-open" : "is-closed") : ""}`} />
            <div>
              <strong>{s?.title ?? "Checking…"}</strong>
              <small>{s?.sub}</small>
            </div>
          </div>
          <div className="visit__block">
            <h4>Showroom</h4>
            <p>{SITE.address.line1}<br />{SITE.address.line2}<br />{SITE.address.city}</p>
            <a className="link" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SITE.mapsQuery)}`} target="_blank" rel="noopener">
              Get directions ↗
            </a>
          </div>
          <div className="visit__block">
            <h4>Hours <small>(Nairobi time)</small></h4>
            <ul className="hours">
              {ROWS.map(([d, name]) => (
                <li key={d} className={s?.day === d ? "is-today" : ""}>
                  <span>{name}</span>
                  <span>{fmt(SITE.hours[d])}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="visit__block">
            <h4>Talk to us</h4>
            {SITE.phones.map((p) => (
              <a key={p.tel} className="bigphone" href={`tel:${p.tel}`} data-magnetic>{p.label}</a>
            ))}
            <div className="visit__social">
              <a className="btn btn--ghost btn--sm" href={waLink("Hi RNN Motors, ")} target="_blank" rel="noopener">WhatsApp</a>
              <a className="btn btn--ghost btn--sm" href={SITE.instagram} target="_blank" rel="noopener">Instagram</a>
            </div>
          </div>
        </div>
        <div className="visit__map" data-reveal>
          <iframe
            title="Map to RNN Motors, Ndoto Road, Lavington"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&z=15&output=embed`}
          />
          <div className="visit__map-tag">RNN Motors · The Retro Hub</div>
        </div>
      </div>
    </section>
  );
}
