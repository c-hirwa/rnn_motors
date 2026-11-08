"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "../actions";

const ICONS = {
  dash: "M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z",
  cars: "M5 17h14M6.5 17a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm14 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM3 17v-4l2-5h14l2 5v4",
  add: "M12 5v14M5 12h14",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  cog: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  out: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  site: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
};
const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

export default function AdminNav({ name, email, newEnquiries }: { name: string; email: string; newEnquiries: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/admin", label: "Dashboard", icon: ICONS.dash, exact: true },
    { href: "/admin/cars", label: "Inventory", icon: ICONS.cars, exact: false, not: "/admin/cars/new" },
    { href: "/admin/cars/new", label: "Add a car", icon: ICONS.add, exact: true },
    { href: "/admin/enquiries", label: "Enquiries", icon: ICONS.mail, badge: newEnquiries },
    { href: "/admin/settings", label: "Settings", icon: ICONS.cog },
  ];
  const isActive = (l: (typeof links)[number]) =>
    l.exact ? pathname === l.href : pathname.startsWith(l.href) && pathname !== l.not;

  return (
    <aside className={`anav ${open ? "is-open" : ""}`}>
      <div className="anav__top">
        <Link href="/admin" className="brand"><span className="brand__rnn">RNN</span><span className="brand__motors">Admin</span></Link>
        <button className="anav__burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>☰</button>
      </div>
      <nav onClick={() => setOpen(false)}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={isActive(l) ? "is-active" : ""}>
            <Icon d={l.icon} /> {l.label}
            {!!l.badge && <b className="anav__badge">{l.badge}</b>}
          </Link>
        ))}
        <a href="/" target="_blank" rel="noopener"><Icon d={ICONS.site} /> View website</a>
      </nav>
      <div className="anav__user">
        <div><strong>{name}</strong><small>{email}</small></div>
        <form action={logout}>
          <button title="Sign out" aria-label="Sign out"><Icon d={ICONS.out} /></button>
        </form>
      </div>
    </aside>
  );
}
