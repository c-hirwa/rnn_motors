"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { finePointer, prefersReduced } from "../Shell";

export type Slide = { slug: string; title: string; sub: string; url: string; focus: string; alt: string };

const DUR = 7000;

export default function Hero({ slides }: { slides: Slide[] }) {
  const root = useRef<HTMLElement>(null);
  const [cur, setCur] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const capRef = useRef<HTMLDivElement>(null);

  /* wait for loader (first visit) then animate in */
  useEffect(() => {
    const start = () => {
      setReady(true);
      if (prefersReduced()) return;
      gsap.from(".hero__title .split", { yPercent: 110, opacity: 0, rotate: 3, duration: 1.3, stagger: 0.1, ease: "expo.out" });
      gsap.from([".hero__eyebrow", ".hero__lede", ".hero__cta", ".hero__caption", ".hero__dots", ".hero__scroll"], {
        y: 24, opacity: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", delay: 0.3, clearProps: "transform,opacity",
      });
    };
    if (document.documentElement.dataset.loading === "1") {
      addEventListener("rnn:loaded", start, { once: true });
      return () => removeEventListener("rnn:loaded", start);
    }
    start();
  }, []);

  /* autoplay */
  useEffect(() => {
    if (!ready || paused || slides.length < 2) return;
    const t = setTimeout(() => setCur((c) => (c + 1) % slides.length), DUR);
    return () => clearTimeout(t);
  }, [cur, ready, paused, slides.length]);

  /* pause when off screen */
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting), { threshold: 0.15 });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  /* caption swap animation */
  useEffect(() => {
    if (prefersReduced() || !capRef.current) return;
    gsap.fromTo(capRef.current.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "power3.out" });
  }, [cur]);

  /* parallax */
  useEffect(() => {
    if (prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.to(".hero__slides", { yPercent: 18, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero__content", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
    }, root);
    let off = () => {};
    if (finePointer()) {
      const qx = gsap.quickTo(".hero__slides", "x", { duration: 1.2, ease: "power3" });
      const qy = gsap.quickTo(".hero__slides", "y", { duration: 1.2, ease: "power3" });
      const m = (e: MouseEvent) => {
        qx((e.clientX / innerWidth - 0.5) * -24);
        qy((e.clientY / innerHeight - 0.5) * -16);
      };
      const el = root.current!;
      el.addEventListener("mousemove", m);
      off = () => el.removeEventListener("mousemove", m);
    }
    return () => {
      off();
      ctx.revert();
    };
  }, []);

  const s = slides[cur];

  return (
    <section className={`hero ${paused || !ready ? "is-paused" : ""}`} ref={root} aria-label="Featured vehicles" style={{ ["--dur" as string]: DUR / 1000 + "s" }}>
      <div className="hero__slides">
        {slides.map((sl, i) => (
          <figure key={sl.slug} className={`hero__slide ${i === cur ? "is-active" : ""}`}>
            <Image src={sl.url} alt={sl.alt} fill priority={i === 0} sizes="100vw" quality={80} style={{ objectFit: "cover", objectPosition: sl.focus }} />
          </figure>
        ))}
      </div>
      <div className="hero__shade" />

      <div className="hero__content">
        <p className="eyebrow hero__eyebrow"><span className="line" /> The Retro Hub · Lavington, Nairobi</p>
        <h1 className="hero__title" aria-label="Cars for everyone.">
          <span className="split">Cars</span> <span className="split">for</span>
          <br />
          <em className="split">everyone.</em>
        </h1>
        <p className="hero__lede">Exotic, executive and go-anywhere cars. Bought, imported to order, or hired with a chauffeur for the day.</p>
        <div className="hero__cta">
          <Link href="/cars" className="btn btn--gold" data-magnetic>Explore the showroom <span className="arrow">→</span></Link>
          <Link href="/import" className="btn btn--ghost" data-magnetic>Import a car</Link>
        </div>
      </div>

      {s && (
        <Link href={`/cars/${s.slug}`} className="hero__caption" aria-live="polite">
          <span className="hero__index"><b>{String(cur + 1).padStart(2, "0")}</b> / {String(slides.length).padStart(2, "0")}</span>
          <div ref={capRef}>
            <strong>{s.title}</strong>
            <span>{s.sub} ↗</span>
          </div>
        </Link>
      )}
      <div className="hero__dots" role="tablist" aria-label="Choose featured car" style={{ gridTemplateColumns: `repeat(${slides.length},1fr)` }}>
        {slides.map((sl, i) => (
          <button
            key={sl.slug}
            role="tab"
            aria-selected={i === cur}
            aria-label={sl.title}
            className={`${i === cur && ready ? "is-active" : ""} ${i < cur ? "is-done" : ""}`}
            onClick={() => setCur(i)}
          >
            <i key={i === cur ? `a${cur}` : "i"} />
          </button>
        ))}
      </div>
      <a href="#intro" className="hero__scroll" aria-label="Scroll down"><span>Scroll</span><i /></a>
    </section>
  );
}
