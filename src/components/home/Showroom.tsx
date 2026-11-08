"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ShowroomScene } from "./showroom-scene";

const STEPS = [
  {
    tag: "Buy",
    title: "Hand-picked. Ready to drive.",
    text: "Luxury, executive and 4×4 cars waiting at our Lavington showroom. Trade-ins welcome.",
    href: "/cars",
    cta: "See the showroom",
  },
  {
    tag: "Import",
    title: "Can't see it? We'll bring it.",
    text: "Tell us the car you want. We find it abroad and deliver it to you, registered and ready.",
    href: "/import",
    cta: "Request a car",
  },
  {
    tag: "Hire",
    title: "Arrive like you mean it.",
    text: "Weddings, airport transfers and corporate events, with our own cars and chauffeurs.",
    href: "/hire",
    cta: "Book a car",
  },
];

type State = "idle" | "loading" | "ready" | "failed";

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Showroom() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<ShowroomScene | null>(null);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<State>("idle");

  // Scroll → progress through the section → step + car angle.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 0.35;
      setStep(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length)));
      scene.current?.setProgress(p);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Load three.js + the model only when the visitor gets close; render only while on screen.
  useEffect(() => {
    const el = section.current;
    const host = stage.current;
    if (!el || !host) return;
    if (!webglOk()) {
      setState("failed");
      return;
    }
    let cancelled = false;
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || scene.current) return;
        near.disconnect();
        setState("loading");
        import("./showroom-scene")
          .then(({ createShowroomScene }) => {
            if (cancelled) return;
            const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
            scene.current = createShowroomScene(host, {
              url: "/models/concept-car.glb",
              still,
              onReady: () => !cancelled && setState("ready"),
              onError: () => !cancelled && setState("failed"),
            });
            scene.current.setActive(true);
            window.dispatchEvent(new Event("scroll"));
          })
          .catch(() => !cancelled && setState("failed"));
      },
      { rootMargin: "900px 0px" }
    );
    const visible = new IntersectionObserver(([e]) => scene.current?.setActive(e.isIntersecting));
    near.observe(el);
    visible.observe(el);
    return () => {
      cancelled = true;
      near.disconnect();
      visible.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  return (
    <section ref={section} className={`story is-${state}`} aria-labelledby="story-title">
      <div className="story__sticky">
        <div ref={stage} className="story__stage" />
        <div className="story__glow" aria-hidden="true" />

        <div className="wrap story__ui">
          <div className="story__head">
            <p className="eyebrow">What we do</p>
            <h2 className="h2" id="story-title">Buy, import or hire</h2>
          </div>

          <div className="story__steps">
            {STEPS.map((s, i) => (
              <div key={s.tag} className={`story__step ${i === step ? "is-active" : ""}`}>
                <p className="story__tag">
                  <span>0{i + 1}</span> {s.tag}
                </p>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <Link href={s.href} className="btn btn--ghost btn--sm">
                  {s.cta} →
                </Link>
              </div>
            ))}
          </div>

          <div className="story__foot">
            <ol className="story__ticks" aria-hidden="true">
              {STEPS.map((s, i) => (
                <li key={s.tag} className={i <= step ? "is-on" : ""} />
              ))}
            </ol>
            <p className="story__credit">
              3D model: <a href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept" target="_blank" rel="noopener noreferrer">“Car Concept”</a> by Eric Chadwick,{" "}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>, repainted
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
