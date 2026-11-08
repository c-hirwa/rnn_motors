"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { CardCar } from "@/lib/cars";
import { CATEGORIES } from "@/lib/format";
import CarCard from "./CarCard";

const SORTS = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "year-desc": "Year: newest",
} as const;
type Sort = keyof typeof SORTS;

export default function InventoryBrowser({ cars }: { cars: CardCar[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [cat, setCat] = useState(sp.get("category") || "all");
  const [make, setMake] = useState(sp.get("make") || "");
  const [body, setBody] = useState(sp.get("body") || "");
  const [sort, setSort] = useState<Sort>((sp.get("sort") as Sort) in SORTS ? (sp.get("sort") as Sort) : "featured");
  const [qLive, setQLive] = useState(sp.get("q") || "");
  const [q, setQ] = useState(qLive);
  const [sold, setSold] = useState(sp.get("sold") === "1");

  useEffect(() => {
    const t = setTimeout(() => setQ(qLive.trim()), 200);
    return () => clearTimeout(t);
  }, [qLive]);

  const makes = useMemo(() => [...new Set(cars.map((c) => c.make))].sort(), [cars]);
  const bodies = useMemo(() => [...new Set(cars.map((c) => c.body))].sort(), [cars]);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = cars.filter((c) => {
      if (!sold && c.status === "sold") return false;
      if (cat !== "all" && c.category !== cat) return false;
      if (make && c.make !== make) return false;
      if (body && c.body !== body) return false;
      if (words.length) {
        const hay = `${c.make} ${c.model} ${c.colour} ${c.body} ${c.year ?? ""} ${c.fuel ?? ""}`.toLowerCase();
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    const by: Record<Sort, (a: CardCar, b: CardCar) => number> = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || b.added.localeCompare(a.added),
      newest: (a, b) => b.added.localeCompare(a.added),
      "price-asc": (a, b) => (a.priceKes ?? Infinity) - (b.priceKes ?? Infinity),
      "price-desc": (a, b) => (b.priceKes ?? -1) - (a.priceKes ?? -1),
      "year-desc": (a, b) => (b.year ?? 0) - (a.year ?? 0),
    };
    return [...list].sort((a, b) => Number(a.status === "sold") - Number(b.status === "sold") || by[sort](a, b));
  }, [cars, cat, make, body, sort, q, sold]);

  const counts = useMemo(() => {
    const base = cars.filter((c) => sold || c.status !== "sold");
    const o: Record<string, number> = { all: base.length };
    base.forEach((c) => (o[c.category] = (o[c.category] || 0) + 1));
    return o;
  }, [cars, sold]);

  // Keep the URL in sync so filtered views can be shared.
  useEffect(() => {
    const p = new URLSearchParams();
    if (cat !== "all") p.set("category", cat);
    if (make) p.set("make", make);
    if (body) p.set("body", body);
    if (sort !== "featured") p.set("sort", sort);
    if (q) p.set("q", q);
    if (sold) p.set("sold", "1");
    const s = p.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }, [cat, make, body, sort, q, sold, pathname, router]);

  const filtered = cat !== "all" || make || body || q || sold;
  const clear = () => {
    setCat("all"); setMake(""); setBody(""); setQLive(""); setQ(""); setSold(false); setSort("featured");
  };

  return (
    <>
      <div className="toolbar">
        <div className="chips" role="tablist" aria-label="Category">
          {(["all", ...Object.keys(CATEGORIES)] as string[]).map((k) => (
            <button key={k} role="tab" aria-selected={cat === k} className={`chip ${cat === k ? "is-active" : ""}`} onClick={() => setCat(k)}>
              {k === "all" ? "All cars" : CATEGORIES[k as keyof typeof CATEGORIES]}
              <sup>{counts[k] || 0}</sup>
            </button>
          ))}
        </div>
        <label className="search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" placeholder="Search make or model" aria-label="Search cars" value={qLive} onChange={(e) => setQLive(e.target.value)} />
        </label>
      </div>

      <div className="filters">
        <select className="select" value={make} onChange={(e) => setMake(e.target.value)} aria-label="Make">
          <option value="">All makes</option>
          {makes.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select className="select" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Body type">
          <option value="">All body types</option>
          {bodies.map((m) => <option key={m}>{m}</option>)}
        </select>
        <label className="check">
          <input type="checkbox" checked={sold} onChange={(e) => setSold(e.target.checked)} />
          Include sold
        </label>
        <div className="filters__right">
          <span className="count"><b>{results.length}</b> {results.length === 1 ? "car" : "cars"}</span>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {filtered && <button className="text-btn" onClick={clear}>Clear</button>}
        </div>
      </div>

      {results.length ? (
        <div className="grid">
          {results.map((c, i) => <CarCard key={c.id} car={c} priority={i < 3} />)}
        </div>
      ) : (
        <div className="empty-state">
          <p>No cars match those filters right now.</p>
          <div className="hero__cta">
            <button className="btn btn--ghost" onClick={clear}>Clear filters</button>
            <Link className="btn btn--primary" href="/import">Ask us to find one</Link>
          </div>
        </div>
      )}
    </>
  );
}
