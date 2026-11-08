"use client";

import { useEffect, useState } from "react";
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
      <button className="btn btn--ghost btn--sm" onClick={() => toggleShort(item)} aria-pressed={on}>
        <HeartIcon size={15} /> {on ? "Saved" : "Save"}
      </button>
      <button className="btn btn--ghost btn--sm" onClick={share}>Share</button>
    </div>
  );
}

/** Sticky bar on phones with the price and a WhatsApp button. */
export function StickyBar({ title, price, wa }: { title: string; price: string; wa: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = () => setOn(scrollY > 420);
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
      <a className="btn btn--wa" href={wa} target="_blank" rel="noopener"><WaIcon size={18} /> Enquire</a>
    </div>
  );
}
