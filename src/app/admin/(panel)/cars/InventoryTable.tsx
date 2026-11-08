"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { STATUSES, kes, km } from "@/lib/format";
import { deleteCar, duplicateCar, setCarStatus, toggleCarFlag } from "../../actions";

export type Row = {
  id: string; slug: string; make: string; model: string; year: number | null; colour: string; status: string;
  priceKes: number | null; mileageKm: number | null; featured: boolean; forHire: boolean; thumb: string | null;
  photos: number; enquiries: number; updatedAt: string;
};

const TABS = ["all", "available", "reserved", "sold", "draft"] as const;

export default function InventoryTable({ rows, initialStatus }: { rows: Row[]; initialStatus: string }) {
  const [tab, setTab] = useState<string>(TABS.includes(initialStatus as never) ? initialStatus : "all");
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter(
      (r) =>
        (tab === "all" || r.status === tab) &&
        words.every((w) => `${r.make} ${r.model} ${r.year ?? ""} ${r.colour}`.toLowerCase().includes(w))
    );
  }, [rows, tab, q]);

  const run = (id: string, fn: () => Promise<unknown>) => {
    setBusy(id);
    start(async () => {
      await fn();
      setBusy(null);
    });
  };

  return (
    <section className="apanel apanel--flush">
      <div className="atoolbar">
        <div className="atabs">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? "is-active" : ""} onClick={() => setTab(t)}>
              {t === "all" ? "All" : STATUSES[t]} <span>{t === "all" ? rows.length : rows.filter((r) => r.status === t).length}</span>
            </button>
          ))}
        </div>
        <input className="asearch" type="search" placeholder="Search inventory…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="atable-wrap">
        <table className="atable">
          <thead>
            <tr>
              <th>Car</th>
              <th>Status</th>
              <th>Price</th>
              <th className="hide-sm">Mileage</th>
              <th className="hide-sm" title="Shown in the home page slideshow">Featured</th>
              <th className="hide-sm">For hire</th>
              <th className="hide-sm">Leads</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className={busy === r.id && pending ? "is-busy" : ""}>
                <td>
                  <Link href={`/admin/cars/${r.id}`} className="atable__car">
                    {r.thumb ? <img src={r.thumb} alt="" /> : <span className="thumb" />}
                    <span>
                      <strong>{r.make} {r.model}</strong>
                      <small>{[r.year, r.colour, `${r.photos} photo${r.photos === 1 ? "" : "s"}`].filter(Boolean).join(" · ")}</small>
                    </span>
                  </Link>
                </td>
                <td>
                  <select className={`status-select status-select--${r.status}`} value={r.status} onChange={(e) => run(r.id, () => setCarStatus(r.id, e.target.value))} aria-label="Status">
                    {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td>{r.priceKes ? kes(r.priceKes) : <span className="muted">On request</span>}</td>
                <td className="hide-sm">{km(r.mileageKm) ?? <span className="muted">—</span>}</td>
                <td className="hide-sm">
                  <button className={`star ${r.featured ? "is-on" : ""}`} onClick={() => run(r.id, () => toggleCarFlag(r.id, "featured"))} aria-pressed={r.featured} aria-label="Toggle featured">★</button>
                </td>
                <td className="hide-sm">
                  <button className={`switch ${r.forHire ? "is-on" : ""}`} onClick={() => run(r.id, () => toggleCarFlag(r.id, "forHire"))} aria-pressed={r.forHire} aria-label="Toggle available for hire"><i /></button>
                </td>
                <td className="hide-sm">{r.enquiries || <span className="muted">0</span>}</td>
                <td>
                  <div className="row-actions">
                    <Link href={`/admin/cars/${r.id}`} className="abtn">Edit</Link>
                    {r.status !== "draft" && <a href={`/cars/${r.slug}`} target="_blank" rel="noopener" className="abtn abtn--ghost" title="View on site">↗</a>}
                    <details className="more">
                      <summary className="abtn abtn--ghost" aria-label="More actions">⋯</summary>
                      <div>
                        <button onClick={() => run(r.id, () => duplicateCar(r.id))}>Duplicate as draft</button>
                        <button
                          className="danger"
                          onClick={() => {
                            if (confirm(`Delete ${r.make} ${r.model} and all its photos? This can't be undone.`)) run(r.id, () => deleteCar(r.id));
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </details>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="empty">No cars match.</p>}
      </div>
    </section>
  );
}
