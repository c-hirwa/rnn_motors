"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const fmtH = (h: number) => `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;

function nairobiNow() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Nairobi", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value])
  );
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday), h: +p.hour, m: +p.minute };
}

export type OpenState = { open: boolean; day: number; title: string; sub: string };

export function getOpenState(): OpenState {
  const { day, h, m } = nairobiNow();
  const t = h + m / 60;
  const hrs = SITE.hours[day];
  const open = !!hrs && t >= hrs[0] && t < hrs[1];
  if (open && hrs) {
    const left = hrs[1] * 60 - (h * 60 + m);
    const hh = Math.floor(left / 60);
    return { open, day, title: "Open now", sub: `Closes at ${fmtH(hrs[1])} · ${hh ? hh + "h " : ""}${left % 60}m left` };
  }
  if (hrs && t < hrs[0]) return { open, day, title: "Closed right now", sub: `Opens today at ${fmtH(hrs[0])}` };
  let d = (day + 1) % 7;
  while (!SITE.hours[d]) d = (d + 1) % 7;
  return {
    open,
    day,
    title: "Closed right now",
    sub: `Opens ${d === (day + 1) % 7 ? "tomorrow" : DAYS[d]} at ${fmtH(SITE.hours[d]![0])} · WhatsApp us anytime`,
  };
}

export function useOpenState() {
  const [s, setS] = useState<OpenState | null>(null);
  useEffect(() => {
    setS(getOpenState());
    const i = setInterval(() => setS(getOpenState()), 30000);
    return () => clearInterval(i);
  }, []);
  return s;
}

export default function OpenDot({ big = false }: { big?: boolean }) {
  const s = useOpenState();
  return (
    <span
      className={`status-dot ${s ? (s.open ? "is-open" : "is-closed") : ""} ${big ? "status-dot--big" : ""}`}
      title={s?.title}
      aria-hidden="true"
    />
  );
}
