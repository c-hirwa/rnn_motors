"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReduced } from "./Shell";

const STEPS = [
  ["Source", "We search verified dealers and auctions for your make, trim, colour and mileage."],
  ["Inspect", "Independent pre-shipment inspection and full history check before any money moves."],
  ["Ship", "Roll-on/roll-off or container shipping to Mombasa, insured end to end."],
  ["Clear", "KRA duty, KEBS compliance and port clearance, handled by our agents."],
  ["Register", "NTSA registration, Kenyan plates and logbook in your name."],
  ["Hand over", "Detailed, fuelled and handed over at the showroom or at your door."],
];

export default function ImportSteps() {
  const root = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const items = Array.from(root.current!.querySelectorAll("li"));
    if (prefersReduced() || innerWidth <= 1100) {
      const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-lit")), { threshold: 0.6 });
      items.forEach((i) => io.observe(i));
      return () => io.disconnect();
    }
    const ctx = gsap.context(() => {
      gsap.to(".steps__line b", {
        scaleX: 1, ease: "none",
        scrollTrigger: {
          trigger: root.current, start: "top 75%", end: "bottom 45%", scrub: true,
          onUpdate: (st) => items.forEach((li, i) => li.classList.toggle("is-lit", st.progress >= i / items.length + 0.02)),
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <ol className="steps" ref={root}>
      {STEPS.map(([h, p], i) => (
        <li key={h}><span>{i + 1}</span><h4>{h}</h4><p>{p}</p></li>
      ))}
      <i className="steps__line"><b /></i>
    </ol>
  );
}
