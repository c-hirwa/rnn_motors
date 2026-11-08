"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useOpenState } from "../OpenDot";

export type Slide = { slug: string; title: string; sub: string; url: string; focus: string; alt: string };

export default function Hero({ slides, count, makes }: { slides: Slide[]; count: number; makes: number }) {
  const [cur, setCur] = useState(0);
  const open = useOpenState();

  useEffect(() => {
    if (slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setCur((c) => (c + 1) % slides.length), 6000);
    return () => clearTimeout(t);
  }, [cur, slides.length]);

  const s = slides[cur];

  return (
    <section className="hero" aria-label="Welcome">
      <span className="shoot" aria-hidden="true" />
      <div className="wrap hero__grid">
        <div className="hero__text">
          <p className="eyebrow">The Retro Hub · Lavington, Nairobi</p>
          <h1 className="hero__title">
            Cars for <span className="metal">everyone.</span>
          </h1>
          <p className="hero__lede">Luxury, executive and 4×4 cars to buy, import to order, or hire with a chauffeur.</p>
          <div className="hero__cta">
            <Link href="/cars" className="btn btn--primary">Browse {count} cars</Link>
            <Link href="/visit" className="btn btn--ghost">Book a viewing</Link>
          </div>
          <dl className="hero__facts">
            <div>
              <dt>In stock</dt>
              <dd>{count} cars</dd>
            </div>
            <div>
              <dt>Marques</dt>
              <dd>{makes} brands</dd>
            </div>
            <div>
              <dt>Showroom</dt>
              <dd>
                <span className={`status-dot ${open ? (open.open ? "is-open" : "is-closed") : ""}`} />
                {open ? open.title.replace(" now", "") : "Mon–Sat"}
              </dd>
            </div>
          </dl>
        </div>

        {s && (
          <div className="hero__media">
            <div className="hero__frame">
              {slides.map((sl, i) => (
                <Link key={sl.slug} href={`/cars/${sl.slug}`} className={`hero__slide ${i === cur ? "is-active" : ""}`} aria-hidden={i !== cur} tabIndex={i === cur ? 0 : -1}>
                  <Image
                    src={sl.url}
                    alt={sl.alt}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 900px) 100vw, 620px"
                    style={{ objectFit: "cover", objectPosition: sl.focus }}
                  />
                </Link>
              ))}
            </div>
            <div className="hero__foot">
              <Link href={`/cars/${s.slug}`} className="hero__caption">
                <strong>{s.title}</strong>
                <span>{s.sub}</span>
              </Link>
              <div className="hero__dots" role="tablist" aria-label="Featured car">
                {slides.map((sl, i) => (
                  <button key={sl.slug} role="tab" aria-selected={i === cur} aria-label={sl.title} className={i === cur ? "is-active" : ""} onClick={() => setCur(i)} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
