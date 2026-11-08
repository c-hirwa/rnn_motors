"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { finePointer, prefersReduced } from "./Shell";

/**
 * Site-wide effects: custom cursor, magnetic buttons, scroll reveals.
 * Mark elements with data-reveal (fade up), data-reveal-group (stagger children),
 * data-magnetic, and data-cursor="view" (+ data-cursor-label).
 */
export default function Effects() {
  const pathname = usePathname();
  const cursor = useRef<HTMLDivElement>(null);

  /* cursor */
  useEffect(() => {
    if (!finePointer() || prefersReduced()) return;
    const cur = cursor.current!;
    const dot = cur.querySelector<HTMLElement>(".cursor__dot")!;
    const ring = cur.querySelector<HTMLElement>(".cursor__ring")!;
    const label = cur.querySelector<HTMLElement>(".cursor__label")!;
    document.body.classList.add("has-cursor");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0;
    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;
    };
    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const view = t.closest<HTMLElement>("[data-cursor=view]");
      const ignore = t.closest("[data-cursor-ignore]");
      const hov = t.closest("a,button,input,select,textarea,label,[data-hover]");
      cur.classList.toggle("is-view", !!view && !ignore);
      cur.classList.toggle("is-hover", (!view || !!ignore) && !!hov);
      cur.classList.toggle("is-hidden", !!t.closest("iframe"));
      label.textContent = view?.dataset.cursorLabel || "View";
    };
    const leave = () => cur.classList.add("is-hidden");
    const enter = () => cur.classList.remove("is-hidden");
    addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over);
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);
    loop();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  /* reset cursor state on navigation */
  useEffect(() => {
    cursor.current?.classList.remove("is-view", "is-hover");
  }, [pathname]);

  /* magnetic (delegated, so it works for elements rendered later) */
  useEffect(() => {
    if (!finePointer() || prefersReduced()) return;
    let active: HTMLElement | null = null;
    const release = (el: HTMLElement) => {
      el.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)";
      el.style.transform = "";
      setTimeout(() => (el.style.transition = ""), 600);
    };
    const move = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-magnetic]");
      if (active && active !== el) release(active);
      active = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px,${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
    };
    addEventListener("mousemove", move, { passive: true });
    return () => removeEventListener("mousemove", move);
  }, []);

  /* scroll reveals, re-run per page */
  useEffect(() => {
    if (prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", clearProps: "transform", scrollTrigger: { trigger: el, start: "top 90%", once: true } }
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((g) => {
        gsap.fromTo(
          g.children,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.09, ease: "expo.out", clearProps: "transform", scrollTrigger: { trigger: g, start: "top 88%", once: true } }
        );
      });
    });
    const t = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, [pathname]);

  return (
    <div className="cursor" ref={cursor} aria-hidden="true">
      <div className="cursor__dot" />
      <div className="cursor__ring">
        <span className="cursor__label">View</span>
      </div>
    </div>
  );
}
