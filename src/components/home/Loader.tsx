"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { prefersReduced } from "../Shell";

/** Intro loader: shown once per browser session, on the home page only. */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    let seen = false;
    try {
      seen = sessionStorage.getItem("rnn-intro") === "1";
      sessionStorage.setItem("rnn-intro", "1");
    } catch {}
    const done = () => {
      html.dataset.loading = "";
      html.style.overflow = "";
      setGone(true);
      dispatchEvent(new Event("rnn:loaded"));
    };
    if (seen || prefersReduced()) return done();

    html.dataset.loading = "1";
    html.style.overflow = "hidden";
    const el = root.current!;
    const count = el.querySelector(".loader__count")!;
    const prog = { v: 0 };
    const safety = setTimeout(done, 6000);
    const tl = gsap.timeline({ onComplete: () => { clearTimeout(safety); done(); } });
    tl.fromTo(".loader__mark span", { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.08, ease: "expo.out" })
      .to(prog, {
        v: 100, duration: 1.3, ease: "power2.inOut",
        onUpdate: () => {
          count.textContent = String(Math.round(prog.v)).padStart(3, "0");
          gsap.set(".loader__line i", { scaleX: prog.v / 100 });
        },
      }, 0.1)
      .to(".loader__mark span", { yPercent: -110, duration: 0.5, stagger: 0.05, ease: "power3.in" })
      .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.85, ease: "expo.inOut" }, "-=.25")
      .add(() => dispatchEvent(new Event("rnn:loaded")), "-=.5");
    return () => {
      clearTimeout(safety);
      tl.kill();
    };
  }, []);

  if (gone) return null;
  return (
    <div className="loader" ref={root} aria-hidden="true">
      <div className="loader__inner">
        <div className="loader__mark"><span>R</span><span>N</span><span>N</span></div>
        <div className="loader__line"><i /></div>
        <div className="loader__meta"><span>Lavington · Nairobi</span><span className="loader__count">000</span></div>
      </div>
    </div>
  );
}
