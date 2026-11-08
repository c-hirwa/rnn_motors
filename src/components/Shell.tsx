"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { waLink } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Shared client state: toast, shortlist, smooth scroll                */
/* ------------------------------------------------------------------ */

export type ShortItem = { id: string; slug: string; name: string; make: string; model: string; img: string | null };

type Ctx = {
  toast: (msg: string) => void;
  shortlist: ShortItem[];
  toggleShort: (item: ShortItem) => void;
  isShort: (id: string) => boolean;
  openDrawer: () => void;
  lenis: React.RefObject<Lenis | null>;
  lockScroll: (on: boolean) => void;
};

const ShellCtx = createContext<Ctx | null>(null);
export const useShell = () => {
  const c = useContext(ShellCtx);
  if (!c) throw new Error("useShell must be used inside <Shell>");
  return c;
};

const KEY = "rnn-shortlist-v2";
const load = (): ShortItem[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const toastT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [shortlist, setShortlist] = useState<ShortItem[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [bump, setBump] = useState(0);
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => setShortlist(load()), []);
  const save = (l: ShortItem[]) => {
    setShortlist(l);
    try {
      localStorage.setItem(KEY, JSON.stringify(l));
    } catch {}
  };

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastOn(true);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToastOn(false), 2200);
  }, []);

  const toggleShort = (item: ShortItem) => {
    const has = shortlist.some((s) => s.id === item.id);
    if (has) {
      save(shortlist.filter((s) => s.id !== item.id));
      toast(`Removed ${item.model}`);
    } else {
      save([...shortlist, item]);
      toast(`♥ ${item.model} added to shortlist`);
      setBump((b) => b + 1);
    }
  };

  const lockScroll = useCallback((on: boolean) => {
    if (lenis.current) on ? lenis.current.stop() : lenis.current.start();
    document.documentElement.style.overflow = on ? "hidden" : "";
  }, []);

  /* smooth scroll */
  useEffect(() => {
    if (prefersReduced()) return;
    const l = new Lenis({ lerp: 0.09 });
    lenis.current = l;
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis.current = null;
    };
  }, []);

  /* reset scroll + triggers on navigation */
  useEffect(() => {
    if (!window.location.hash) {
      lenis.current?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    }
    setDrawer(false);
    lockScroll(false);
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, [pathname, lockScroll]);

  /* in-page anchor links (#section) */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href*='#']") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const el = document.querySelector(url.hash);
      if (!el) return;
      e.preventDefault();
      if (lenis.current) lenis.current.scrollTo(el as HTMLElement, { duration: 1.4, offset: -20 });
      else el.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  /* open drawer locks scroll */
  useEffect(() => {
    lockScroll(drawer);
    if (!drawer) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [drawer, lockScroll]);

  const ctx: Ctx = {
    toast,
    shortlist,
    toggleShort,
    isShort: (id) => shortlist.some((s) => s.id === id),
    openDrawer: () => setDrawer(true),
    lenis,
    lockScroll,
  };

  const waText = `Hi RNN Motors, I'm interested in these cars from your showroom:\n${shortlist
    .map((s, i) => `${i + 1}. ${s.name} (${location.origin}/cars/${s.slug})`)
    .join("\n")}\n\nCould you share prices and availability?`;

  return (
    <ShellCtx.Provider value={ctx}>
      <ShortlistBump n={bump} />
      {children}

      <aside className={`drawer ${drawer ? "is-open" : ""} ${shortlist.length ? "" : "is-empty"}`} aria-hidden={!drawer} aria-label="Your shortlist">
        <div className="drawer__backdrop" onClick={() => setDrawer(false)} />
        <div className="drawer__panel">
          <div className="drawer__head">
            <h3 className="h3">Your shortlist</h3>
            <button onClick={() => setDrawer(false)} aria-label="Close shortlist">✕</button>
          </div>
          {shortlist.length ? (
            <ul className="drawer__list" data-lenis-prevent>
              {shortlist.map((s) => (
                <li key={s.id}>
                  <Link href={`/cars/${s.slug}`} onClick={() => setDrawer(false)}>
                    {s.img ? <img src={s.img} alt="" /> : <span className="drawer__noimg" />}
                  </Link>
                  <Link href={`/cars/${s.slug}`} onClick={() => setDrawer(false)}>
                    <small>{s.make}</small>
                    <strong>{s.model}</strong>
                  </Link>
                  <button onClick={() => toggleShort(s)} aria-label={`Remove ${s.name}`}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="drawer__empty">Tap the ♡ on any car to save it here, then send the whole list to the team in one message.</p>
          )}
          <a className="btn btn--gold btn--block" href={shortlist.length ? waLink(waText) : undefined} target="_blank" rel="noopener">
            Send shortlist on WhatsApp <span className="arrow">→</span>
          </a>
        </div>
      </aside>

      <div className={`toast ${toastOn ? "is-on" : ""}`} role="status" aria-live="polite">{toastMsg}</div>
    </ShellCtx.Provider>
  );
}

/** Restart the heart-button bump animation whenever n changes. */
function ShortlistBump({ n }: { n: number }) {
  useEffect(() => {
    if (!n) return;
    const b = document.querySelector(".shortlist-btn");
    if (!b) return;
    b.classList.remove("bump");
    void (b as HTMLElement).offsetWidth;
    b.classList.add("bump");
  }, [n]);
  return null;
}
