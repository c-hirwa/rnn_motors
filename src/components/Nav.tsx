"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";
import { useShell } from "./Shell";

const LINKS = [
  { href: "/cars", label: "Showroom" },
  { href: "/import", label: "Import" },
  { href: "/hire", label: "Hire" },
  { href: "/visit", label: "Contact" },
];

export const HeartIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.9 1.3-1.8 2.9-2.9 4.9-2.9 3.5 0 5.6 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
  </svg>
);

export default function Nav() {
  const pathname = usePathname();
  const { shortlist, openDrawer, lockScroll } = useShell();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(scrollY > 20);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => lockScroll(menu), [menu, lockScroll]);

  // Transparent only over the home hero; solid everywhere else.
  const solid = pathname !== "/" || scrolled || menu;
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className={`nav ${solid ? "is-solid" : ""}`}>
        <div className="wrap nav__inner">
          <Link href="/" className="brand" aria-label="RNN Motors home">
            <span className="brand__rnn">RNN</span>
            <span className="brand__motors">Motors</span>
          </Link>
          <nav className="nav__links" aria-label="Primary">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={active(l.href) ? "is-active" : ""}>{l.label}</Link>
            ))}
          </nav>
          <div className="nav__right">
            <button className="icon-btn" type="button" aria-label={`Shortlist (${shortlist.length})`} onClick={openDrawer}>
              <HeartIcon />
              {shortlist.length > 0 && <span className="badge">{shortlist.length}</span>}
            </button>
            <a className="btn btn--primary btn--sm nav__call" href={`tel:${SITE.phones[0].tel}`}>Call us</a>
            <button className="icon-btn burger" type="button" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
              {menu ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      <nav className={`menu ${menu ? "is-open" : ""}`} aria-hidden={!menu}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
        <div className="menu__foot">
          <a className="btn btn--primary btn--block" href={`tel:${SITE.phones[0].tel}`}>Call {SITE.phones[0].label}</a>
          <a className="btn btn--ghost btn--block" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener">WhatsApp us</a>
        </div>
      </nav>
    </>
  );
}
