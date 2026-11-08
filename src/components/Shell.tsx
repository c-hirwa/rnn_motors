"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { waLink } from "@/lib/site";

/* Shared client state: toast messages and the shortlist drawer. */

export type ShortItem = { id: string; slug: string; name: string; make: string; model: string; img: string | null };

type Ctx = {
  toast: (msg: string) => void;
  shortlist: ShortItem[];
  toggleShort: (item: ShortItem) => void;
  isShort: (id: string) => boolean;
  openDrawer: () => void;
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

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const toastT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [shortlist, setShortlist] = useState<ShortItem[]>([]);
  const [drawer, setDrawer] = useState(false);

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
    if (shortlist.some((s) => s.id === item.id)) {
      save(shortlist.filter((s) => s.id !== item.id));
      toast(`Removed ${item.model} from your shortlist`);
    } else {
      save([...shortlist, item]);
      toast(`${item.model} added to your shortlist`);
    }
  };

  const lockScroll = useCallback((on: boolean) => {
    document.documentElement.style.overflow = on ? "hidden" : "";
  }, []);

  useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    lockScroll(drawer);
    if (!drawer) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [drawer, lockScroll]);

  const waText = `Hi RNN Motors, I'm interested in these cars:\n${shortlist
    .map((s, i) => `${i + 1}. ${s.name} (${typeof location !== "undefined" ? location.origin : ""}/cars/${s.slug})`)
    .join("\n")}\n\nCould you share prices and availability?`;

  return (
    <ShellCtx.Provider
      value={{ toast, shortlist, toggleShort, isShort: (id) => shortlist.some((s) => s.id === id), openDrawer: () => setDrawer(true), lockScroll }}
    >
      {children}

      <aside className={`drawer ${drawer ? "is-open" : ""}`} aria-hidden={!drawer} aria-label="Your shortlist">
        <div className="drawer__backdrop" onClick={() => setDrawer(false)} />
        <div className="drawer__panel">
          <div className="drawer__head">
            <h2>Your shortlist</h2>
            <button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close shortlist">✕</button>
          </div>
          {shortlist.length ? (
            <ul className="drawer__list">
              {shortlist.map((s) => (
                <li key={s.id}>
                  <Link href={`/cars/${s.slug}`} className="drawer__car">
                    {s.img ? <img src={s.img} alt="" /> : <span className="drawer__noimg" />}
                    <span>
                      <small>{s.make}</small>
                      <strong>{s.model}</strong>
                    </span>
                  </Link>
                  <button className="text-btn" onClick={() => toggleShort(s)} aria-label={`Remove ${s.name}`}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="drawer__empty">Tap the heart on any car to save it here, then send your list to our team in one message.</p>
          )}
          {shortlist.length > 0 && (
            <a className="btn btn--primary btn--block" href={waLink(waText)} target="_blank" rel="noopener">
              Send shortlist on WhatsApp
            </a>
          )}
        </div>
      </aside>

      <div className={`toast ${toastOn ? "is-on" : ""}`} role="status" aria-live="polite">{toastMsg}</div>
    </ShellCtx.Provider>
  );
}
