"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CardCar } from "@/lib/cars";
import { CATEGORIES, CONDITIONS } from "@/lib/format";
import CarCard from "./CarCard";
import { prefersReduced } from "./Shell";

const SORTS = {
  featured: "Featured",
  newest: "Newest arrivals",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "year-desc": "Year: newest first",
} as const;
type Sort = keyof typeof SORTS;

export default function InventoryBrowser({ cars }: { cars: CardCar[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const [cat, setCat] = useState(sp.get("category") || "all");
  const [make, setMake] = useState(sp.get("make") || "");
  const [body, setBody] = useState(sp.get("body") || "");
  const [cond, setCond] = useState(sp.get("condition") || "");
  const [maxPrice, setMaxPrice] = useState(sp.get("max") || "");
  const [sort, setSort] = useState<Sort>((sp.get("sort") as Sort) in SORTS ? (sp.get("sort") as Sort) : "featured");
  const [q, setQ] = useState(sp.get("q") || "");
  const [qLive, setQLive] = useState(q);
  const [sold, setSold] = useState(sp.get("sold") === "1");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setQ(qLive.trim()), 220);
    return () => clearTimeout(t);
  }, [qLive]);

  const makes = useMemo(() => [...new Set(cars.map((c) => c.make))].sort(), [cars]);
  const bodies = useMemo(() => [...new Set(cars.map((c) => c.body))].sort(), [cars]);
  const priced = cars.filter((c) => c.priceKes);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = cars.filter((c) => {
      if (!sold && c.status === "sold") return false;
      if (cat !== "all" && c.category !== cat) return false;
      if (make && c.make !== make) return false;
      if (body && c.body !== body) return false;
      if (cond && c.condition !== cond) return false;
      if (maxPrice && c.priceKes && c.priceKes > +maxPrice) return false;
      if (words.length) {
        const hay = `${c.make} ${c.model} ${c.colour} ${c.body} ${c.year ?? ""} ${c.fuel ?? ""}`.toLowerCase();
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    const by = {
      featured: (a: CardCar, b: CardCar) => Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt),
      newest: (a: CardCar, b: CardCar) => b.createdAt.localeCompare(a.createdAt),
      "price-asc": (a: CardCar, b: CardCar) => (a.priceKes ?? Infinity) - (b.priceKes ?? Infinity),
      "price-desc": (a: CardCar, b: CardCar) => (b.priceKes ?? -1) - (a.priceKes ?? -1),
      "year-desc": (a: CardCar, b: CardCar) => (b.year ?? 0) - (a.year ?? 0),
    }[sort];
    return [...list].sort((a, b) => Number(a.status === "sold") - Number(b.status === "sold") || by(a, b));
  }, [cars, cat, make, body, cond, maxPrice, sort, q, sold]);

  const counts = useMemo(() => {
    const base = cars.filter((c) => sold || c.status !== "sold");
    const o: Record<string, number> = { all: base.length };
    base.forEach((c) => (o[c.category] = (o[c.category] || 0) + 1));
    return o;
  }, [cars, sold]);

  /* keep URL in sync (shareable filtered views) */
  useEffect(() => {
    const p = new URLSearchParams();
    if (cat !== "all") p.set("category", cat);
    if (make) p.set("make", make);
    if (body) p.set("body", body);
    if (cond) p.set("condition", cond);
    if (maxPrice) p.set("max", maxPrice);
    if (sort !== "featured") p.set("sort", sort);
    if (q) p.set("q", q);
    if (sold) p.set("sold", "1");
    const s = p.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }, [cat, make, body, cond, maxPrice, sort, q, sold, pathname, router]);

  /* animate results */
  const key = results.map((r) => r.id).join();
  useEffect(() => {
    ScrollTrigger.refresh();
    if (prefersReduced() || !gridRef.current) return;
    gsap.fromTo(gridRef.current.children, { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.04, ease: "expo.out", clearProps: "transform" });
  }, [key]);

  /* category pill */
  useEffect(() => {
    const move = () => {
      const a = chipsRef.current?.querySelector<HTMLElement>(".chip.is-active");
      if (a && pillRef.current) {
        pillRef.current.style.width = a.offsetWidth + "px";
        pillRef.current.style.transform = `translateX(${a.offsetLeft}px)`;
      }
    };
    move();
    document.fonts?.ready.then(move);
    addEventListener("resize", move);
    return () => removeEventListener("resize", move);
  }, [cat, counts]);

  const active = [make, body, cond, maxPrice, q, sold ? "1" : ""].filter(Boolean).length + (cat !== "all" ? 1 : 0);
  const clear = () => {
    setCat("all"); setMake(""); setBody(""); setCond(""); setMaxPrice(""); setQ(""); setQLive(""); setSold(false); setSort("featured");
  };

  const priceSteps = [5_000_000, 10_000_000, 20_000_000, 35_000_000, 50_000_000];

  return (
    <>
      <div className="toolbar">
        <div className="filters" role="tablist" aria-label="Filter by category" ref={chipsRef}>
          {(["all", ...Object.keys(CATEGORIES)] as string[]).map((k) => (
            <button key={k} role="tab" aria-selected={cat === k} className={`chip ${cat === k ? "is-active" : ""}`} onClick={() => setCat(k)}>
              {k === "all" ? "All" : CATEGORIES[k as keyof typeof CATEGORIES]} <sup>{counts[k] || 0}</sup>
            </button>
          ))}
          <span className="filters__pill" ref={pillRef} aria-hidden="true" />
        </div>
        <label className="search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" placeholder="Search make, model, colour…" aria-label="Search the showroom" value={qLive} onChange={(e) => setQLive(e.target.value)} />
        </label>
      </div>

      <div className="refine">
        <button className={`refine__toggle ${showFilters ? "is-open" : ""}`} onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          Filters {active > 0 && <b>{active}</b>}
        </button>
        <div className={`refine__panel ${showFilters ? "is-open" : ""}`}>
          <label><span>Make</span>
            <select value={make} onChange={(e) => setMake(e.target.value)}>
              <option value="">Any make</option>
              {makes.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label><span>Body</span>
            <select value={body} onChange={(e) => setBody(e.target.value)}>
              <option value="">Any body</option>
              {bodies.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label><span>Condition</span>
            <select value={cond} onChange={(e) => setCond(e.target.value)}>
              <option value="">Any</option>
              {Object.entries(CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label><span>Max price</span>
            <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} disabled={!priced.length}>
              <option value="">Any price</option>
              {priceSteps.map((p) => <option key={p} value={p}>Up to KES {(p / 1_000_000).toFixed(0)}M</option>)}
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={sold} onChange={(e) => setSold(e.target.checked)} />
            <span>Show recently sold</span>
          </label>
        </div>
        <div className="refine__right">
          <span className="refine__count"><b>{results.length}</b> {results.length === 1 ? "car" : "cars"}</span>
          <label className="sort"><span className="sr-only">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          {active > 0 && <button className="refine__clear" onClick={clear}>Clear all</button>}
        </div>
      </div>

      <div className="grid" ref={gridRef}>
        {results.map((c, i) => <CarCard key={c.id} car={c} priority={i < 3} />)}
      </div>
      {!results.length && (
        <div className="grid__empty">
          <p>Nothing on the floor matches that right now.</p>
          <Link className="btn btn--gold" href="/import">We can import it for you <span className="arrow">→</span></Link>
        </div>
      )}
    </>
  );
}
