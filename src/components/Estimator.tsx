"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { waLink } from "@/lib/site";
import EnquiryForm from "./EnquiryForm";
import { prefersReduced } from "./Shell";

/* Indicative assumptions. Update these when rates change. */
const RATES = { USD: 129.3, GBP: 172, EUR: 151, AED: 35.2, JPY: 0.86 } as const;
const TYPICAL = { USD: 85000, GBP: 68000, EUR: 78000, AED: 310000, JPY: 12500000 };
const FREIGHT_USD = { japan: 1800, uk: 2600, uae: 1500, europe: 2900 } as const;
const CLEARING_KES = 180000;
type Cur = keyof typeof RATES;
type Origin = keyof typeof FREIGHT_USD;
type Fuel = "petrol" | "diesel" | "hybrid" | "electric";

const ORIGINS: [Origin, string][] = [["japan", "Japan"], ["uk", "UK"], ["uae", "UAE"], ["europe", "Europe"]];
const FUELS: [Fuel, string][] = [["petrol", "Petrol"], ["diesel", "Diesel"], ["hybrid", "Hybrid"], ["electric", "Electric"]];
const fmt = (n: number) => Math.round(n).toLocaleString("en-KE");

export default function Estimator() {
  const thisYear = new Date().getFullYear();
  const [cur, setCur] = useState<Cur>("USD");
  const [price, setPrice] = useState("85,000");
  const [origin, setOrigin] = useState<Origin>("japan");
  const [fuel, setFuel] = useState<Fuel>("petrol");
  const [cc, setCc] = useState(3000);
  const [year, setYear] = useState(thisYear - 2);
  const [quote, setQuote] = useState(false);
  const totalRef = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);

  const r = useMemo(() => {
    const raw = +price.replace(/[^\d]/g, "") || 0;
    const fob = raw * RATES[cur];
    const freight = FREIGHT_USD[origin] * RATES.USD;
    const insurance = fob * 0.015;
    const cif = fob + freight + insurance;
    const excRate =
      fuel === "electric" ? 0.1
      : ((fuel === "petrol" || fuel === "hybrid") && cc > 3000) || (fuel === "diesel" && cc > 2500) ? 0.35
      : cc > 1500 ? 0.25 : 0.2;
    const id = cif * 0.25;
    const ed = (cif + id) * excRate;
    const vat = (cif + id + ed) * 0.16;
    const levies = cif * 0.045;
    const total = cif + id + ed + vat + levies + CLEARING_KES;
    const rows: [string, number, string, string][] = [
      ["Car price", fob, "#eee8dc", `${cur} ${fmt(raw)}`],
      ["Freight & insurance", freight + insurance, "#7d776d", `from ${ORIGINS.find((o) => o[0] === origin)![1]}`],
      ["Import duty", id, "#d4b67a", "25%"],
      ["Excise duty", ed, "#b8975a", `${Math.round(excRate * 100)}%`],
      ["VAT", vat, "#8a6f3e", "16%"],
      ["IDF & RDL levies", levies, "#5e4c2b", "4.5%"],
      ["Clearing, port & registration", CLEARING_KES, "#3d3b37", "est."],
    ];
    return { raw, total, rows };
  }, [price, cur, origin, fuel, cc]);

  useEffect(() => {
    const el = totalRef.current!;
    if (prefersReduced()) {
      el.textContent = fmt(r.total);
      shown.current = r.total;
      return;
    }
    const o = { v: shown.current };
    const t = gsap.to(o, { v: r.total, duration: 0.9, ease: "power3.out", onUpdate: () => (el.textContent = fmt(o.v)) });
    shown.current = r.total;
    return () => void t.kill();
  }, [r.total]);

  const tooOld = thisYear - year > 8;
  const pct = (v: number, min: number, max: number) => ({ ["--p" as string]: ((v - min) / (max - min)) * 100 + "%" });
  const spec = `${cur} ${fmt(r.raw)}, from ${origin.toUpperCase()}, ${fuel}${fuel !== "electric" ? ` ${fmt(cc)}cc` : ""}, ${year}`;
  const waText = `Hi RNN Motors, I'd like a firm import quote.\n• Car price: ${cur} ${fmt(r.raw)}\n• Shipping from: ${origin.toUpperCase()}\n• ${fuel[0].toUpperCase() + fuel.slice(1)}${fuel !== "electric" ? ", " + fmt(cc) + " cc" : ""}\n• Year: ${year}\nYour website estimate came to about KES ${fmt(r.total)}.`;

  return (
    <div className="estimator" id="estimator" data-reveal>
      <div className="estimator__form">
        <h3 className="h3">Landed-cost estimator</h3>
        <p className="muted">Get a rough idea of what your import costs once it's on Kenyan roads.</p>

        <div className="field">
          <label htmlFor="est-price">Purchase price abroad</label>
          <div className="money">
            <select aria-label="Currency" value={cur} onChange={(e) => { const c = e.target.value as Cur; setCur(c); setPrice(TYPICAL[c].toLocaleString("en-US")); }}>
              {Object.keys(RATES).map((c) => <option key={c}>{c}</option>)}
            </select>
            <input id="est-price" inputMode="numeric" autoComplete="off" value={price}
              onChange={(e) => { const d = e.target.value.replace(/[^\d]/g, "").slice(0, 12); setPrice(d ? (+d).toLocaleString("en-US") : ""); }} />
          </div>
        </div>

        <div className="field">
          <span className="field__label">Shipping from</span>
          <div className="seg">
            {ORIGINS.map(([v, l]) => <button type="button" key={v} className={origin === v ? "is-active" : ""} onClick={() => setOrigin(v)}>{l}</button>)}
          </div>
        </div>

        <div className="field">
          <span className="field__label">Fuel</span>
          <div className="seg">
            {FUELS.map(([v, l]) => <button type="button" key={v} className={fuel === v ? "is-active" : ""} onClick={() => setFuel(v)}>{l}</button>)}
          </div>
        </div>

        <div className={`field field--range ${fuel === "electric" ? "is-disabled" : ""}`}>
          <label htmlFor="est-cc">Engine size <output>{fmt(cc)} cc</output></label>
          <input id="est-cc" type="range" min={1000} max={6500} step={100} value={cc} style={pct(cc, 1000, 6500)} onChange={(e) => setCc(+e.target.value)} />
        </div>

        <div className="field field--range">
          <label htmlFor="est-year">Year of manufacture <output>{year}</output></label>
          <input id="est-year" type="range" min={thisYear - 11} max={thisYear} step={1} value={year} style={pct(year, thisYear - 11, thisYear)} onChange={(e) => setYear(+e.target.value)} />
          {tooOld && <p className="warn">Kenya generally doesn't allow imports of cars older than 8 years. Ask us about local stock instead.</p>}
        </div>
      </div>

      <div className="estimator__result">
        <p className="eyebrow">Estimated on-the-road cost</p>
        <div className="total"><small>KES</small><span ref={totalRef}>0</span></div>
        <div className="bar">{r.rows.map(([k, v, c]) => <i key={k} style={{ flexGrow: v, background: c }} />)}</div>
        <ul className="breakdown">
          {r.rows.map(([k, v, c, note]) => (
            <li key={k}><i style={{ background: c }} /><span>{k}<small>{note}</small></span><span>{fmt(v)}</span></li>
          ))}
          <li><i /><span><small style={{ margin: 0 }}>1 {cur} ≈ KES {RATES[cur]} (indicative)</small></span><span /></li>
        </ul>
        <p className="fineprint">
          Indicative only. KRA charges duty on its own Current Retail Selling Price (CRSP) schedule, not your purchase price, and rates and
          exchange rates change. Uses 25% import duty, 20–35% excise by engine size, 16% VAT, 2.5% IDF, 2% RDL, and estimated freight,
          clearing and registration. RNN will give you a firm quote.
        </p>
        {quote ? (
          <EnquiryForm
            type="import"
            compact
            details={{ spec, estimateKes: Math.round(r.total), currency: cur, price: r.raw, origin, fuel, cc, year }}
            messageLabel="Make, model & spec you want"
            submitLabel="Request firm quote"
            waHref={waLink(waText)}
          />
        ) : (
          <div className="estimator__ctas">
            <button className="btn btn--gold btn--block" onClick={() => setQuote(true)} data-magnetic>Get a firm quote <span className="arrow">→</span></button>
            <a className="btn btn--ghost btn--block" href={waLink(waText)} target="_blank" rel="noopener">Ask on WhatsApp</a>
          </div>
        )}
      </div>
    </div>
  );
}
