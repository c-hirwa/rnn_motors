"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { finePointer } from "../Shell";

type Item = { href: string; title: string; text: string; img: string | null };

export default function Services({ items }: { items: Item[] }) {
  const float = useRef<HTMLDivElement>(null);
  const [img, setImg] = useState<string | null>(null);
  const [on, setOn] = useState(false);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const loop = () => {
      const p = pos.current;
      p.x += (p.tx - p.x) * 0.14;
      p.y += (p.ty - p.y) * 0.14;
      if (float.current) {
        float.current.style.left = p.x + "px";
        float.current.style.top = p.y + "px";
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [on]);

  return (
    <section className="services" id="services">
      <div className="section-head" data-reveal>
        <div>
          <p className="eyebrow"><span className="line" /> What we do</p>
          <h2 className="h2">One house, <em>three</em> ways in.</h2>
        </div>
      </div>
      <div className="services__list" data-reveal-group>
        {items.map((s, i) => (
          <Link
            key={s.href}
            href={s.href}
            className="service"
            onMouseEnter={(e) => {
              if (!finePointer()) return;
              setImg(s.img);
              Object.assign(pos.current, { x: e.clientX, y: e.clientY, tx: e.clientX, ty: e.clientY });
              setOn(true);
            }}
            onMouseMove={(e) => Object.assign(pos.current, { tx: e.clientX + 40, ty: e.clientY })}
            onMouseLeave={() => setOn(false)}
          >
            <span className="service__num">0{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <span className="service__arrow">↗</span>
          </Link>
        ))}
      </div>
      <div className={`services__float ${on && img ? "is-on" : ""}`} ref={float} aria-hidden="true">
        {img && <img src={img} alt="" />}
      </div>
    </section>
  );
}
