"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import type { CardCar } from "@/lib/cars";
import { carName } from "@/lib/format";
import { prefersReduced } from "../Shell";

export default function Signature({ cars }: { cars: CardCar[] }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    const mm = gsap.matchMedia(root);
    mm.add("(min-width: 901px)", () => {
      const track = root.current!.querySelector<HTMLElement>(".signature__track")!;
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: ".signature__pin", pin: true, scrub: 1, start: "top top",
          end: () => "+=" + dist(), invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (st) => gsap.set(".signature__progress i", { scaleX: st.progress }),
        },
      });
      gsap.utils.toArray<HTMLElement>(".sig__img").forEach((img) => {
        gsap.fromTo(img, { xPercent: -8 }, {
          xPercent: 8, ease: "none",
          scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
        });
      });
      gsap.to(".signature__intro", { opacity: 0.15, ease: "none", scrollTrigger: { trigger: ".signature__pin", start: "top top", end: () => "+=" + innerWidth * 0.5, scrub: true } });
    });
    return () => mm.revert();
  }, []);

  if (!cars.length) return null;
  return (
    <section className="signature" ref={root}>
      <div className="signature__pin">
        <div className="signature__intro">
          <p className="eyebrow"><span className="line" /> The Signature Collection</p>
          <h2 className="h2">The cars that <em>define</em> us.</h2>
          <p>Scroll to move through the collection.</p>
          <div className="signature__progress"><i /></div>
        </div>
        <div className="signature__track">
          {cars.map((c, i) => (
            <Link key={c.id} href={`/cars/${c.slug}`} className="sig" data-cursor="view" data-cursor-label="Open">
              {c.photo && (
                <div className="sig__img">
                  <Image src={c.photo.url} alt={`${c.colour} ${carName(c)}`} fill sizes="(max-width: 900px) 80vw, 40vw" style={{ objectFit: "cover", objectPosition: c.photo.focus }} />
                </div>
              )}
              <span className="sig__num">0{i + 1}</span>
              <div className="sig__body">
                <small>{c.make}</small>
                <h3>{c.model}</h3>
                <p>{c.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
