"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { SITE } from "@/lib/site";
import { prefersReduced, useShell } from "./Shell";
import OpenDot from "./OpenDot";

const LINKS = [
  { href: "/cars", label: "Showroom" },
  { href: "/import", label: "Import" },
  { href: "/hire", label: "Hire" },
  { href: "/visit", label: "Visit" },
];

export const HeartIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.9 1.3-1.8 2.9-2.9 4.9-2.9 3.5 0 5.6 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
  </svg>
);

export default function Nav() {
  const pathname = usePathname();
  const { shortlist, openDrawer, lockScroll } = useShell();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const solidPage = pathname !== "/";

  useEffect(() => {
    let last = scrollY;
    const on = () => {
      const y = scrollY;
      setScrolled(y > 40);
      setHidden(y > last && y > innerHeight * 0.8);
      last = y;
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    lockScroll(menu);
    document.body.classList.toggle("menu-open", menu);
    if (menu && !prefersReduced()) gsap.from(".menu__links a", { y: 60, opacity: 0, duration: 0.9, stagger: 0.07, ease: "expo.out", delay: 0.25 });
  }, [menu, lockScroll]);

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className={`nav ${scrolled || solidPage ? "is-scrolled" : ""} ${hidden && !menu ? "is-hidden" : ""}`}>
        <Link href="/" className="brand" aria-label="RNN Motors home">
          <span className="brand__rnn">RNN</span>
          <span className="brand__motors">Motors</span>
        </Link>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={active(l.href) ? "is-active" : ""} data-magnetic>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav__right">
          <button className="shortlist-btn" type="button" aria-label={`Open shortlist (${shortlist.length})`} onClick={openDrawer}>
            <HeartIcon />
            <span className={`shortlist-btn__count ${shortlist.length ? "has" : ""}`}>{shortlist.length}</span>
          </button>
          <a className="btn btn--ghost btn--sm nav__call" href={`tel:${SITE.phones[0].tel}`} data-magnetic>
            <OpenDot /> Call the showroom
          </a>
          <button className="burger" type="button" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className="menu" aria-hidden={!menu}>
        <nav className="menu__links">
          {LINKS.map((l, i) => (
            <Link key={l.href} href={l.href} onClick={() => setMenu(false)}>
              <small>0{i + 1}</small>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="menu__foot">
          {SITE.phones.map((p) => (
            <a key={p.tel} href={`tel:${p.tel}`}>{p.label}</a>
          ))}
          <a href={SITE.instagram} target="_blank" rel="noopener">Instagram ↗</a>
        </div>
      </div>
    </>
  );
}
