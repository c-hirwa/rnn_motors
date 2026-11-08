"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { HeartIcon } from "./Nav";
import { WaIcon } from "./WaFloat";
import { useShell, type ShortItem } from "./Shell";

/** Shortlist + share buttons for the car page. */
export function CarActions({ item }: { item: ShortItem }) {
  const { isShort, toggleShort, toast } = useShell();
  const on = isShort(item.id);
  const share = async () => {
    const url = location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${item.name} | RNN Motors`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied");
      }
    } catch {}
  };
  return (
    <div className="car__mini">
      <button className={`chip-btn ${on ? "is-on" : ""}`} onClick={() => toggleShort(item)} aria-pressed={on}>
        <HeartIcon size={16} /> {on ? "Shortlisted" : "Shortlist"}
      </button>
      <button className="chip-btn" onClick={share}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" /></svg>
        Share
      </button>
    </div>
  );
}

/** Mobile sticky bar with price + quick actions; appears after scrolling past the header. */
export function StickyBar({ title, price, wa }: { title: string; price: string; wa: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = () => setOn(scrollY > 500);
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  return (
    <div className={`stickybar ${on ? "is-on" : ""}`}>
      <div>
        <small>{title}</small>
        <strong>{price}</strong>
      </div>
      <a className="stickybar__btn stickybar__btn--call" href={`tel:${SITE.phones[0].tel}`} aria-label="Call">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
      </a>
      <a className="stickybar__btn" href={wa} target="_blank" rel="noopener"><WaIcon size={20} /> Enquire</a>
    </div>
  );
}
