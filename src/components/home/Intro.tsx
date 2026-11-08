"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReduced } from "../Shell";

const TEXT: (string | { em: string })[] = [
  "From our showroom floor in Lavington to the port at Mombasa, we find, import and hand over the car you ",
  { em: "actually" },
  " want. Brand-new with zero kilometres or a certified low-mileage import. Bought outright, traded in, or hired for the day that matters.",
];

export default function Intro({ inStock, marques }: { inStock: number; marques: number }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const words = root.current!.querySelectorAll(".w");
    const counts = root.current!.querySelectorAll<HTMLElement>("[data-count]");
    if (prefersReduced()) {
      words.forEach((w) => ((w as HTMLElement).style.opacity = "1"));
      counts.forEach((c) => (c.textContent = c.dataset.count!));
      return;
    }
    const ctx = gsap.context(() => {
      gsap.to(words, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: ".intro__text", start: "top 80%", end: "bottom 45%", scrub: true } });
      counts.forEach((el) => {
        const o = { v: 0 };
        gsap.to(o, {
          v: +el.dataset.count!, duration: 2, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
          onUpdate: () => (el.textContent = String(Math.round(o.v))),
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  let k = 0;
  return (
    <section className="intro" id="intro" ref={root}>
      <p className="eyebrow"><span className="line" /> The RNN way</p>
      <p className="intro__text">
        {TEXT.map((part) =>
          typeof part === "string"
            ? part.split(/(\s+)/).map((t) => (t.trim() ? <span className="w" key={k++}>{t}</span> : t))
            : <span className="w" key={k++}><em>{part.em}</em></span>
        )}
      </p>
      <div className="intro__stats">
        <div><span className="stat" data-count={inStock}>0</span><small>Cars on the floor now</small></div>
        <div><span className="stat" data-count={marques}>0</span><small>Marques in stock</small></div>
        <div><span className="stat">0<sup>km</sup></span><small>Brand-new options</small></div>
        <div><span className="stat" data-count={6}>0</span><small>Days a week, open to visit</small></div>
      </div>
    </section>
  );
}
