"use client";

import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";

export const WaIcon = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.2c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.7 12.7-12.7S23 3 16 3zm0 23.1c-2 0-3.9-.6-5.6-1.6l-.4-.2-4.1 1.3 1.3-4-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7C5.2 9.7 10 4.9 16 4.9s10.8 4.8 10.8 10.8S22 26.1 16 26.1zm5.9-8.1c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
  </svg>
);

export default function WaFloat() {
  const pathname = usePathname();
  // Car pages have their own sticky enquiry bar on phones.
  const hideMobile = pathname.startsWith("/cars/");
  return (
    <a className={`wa-float ${hideMobile ? "wa-float--desktop" : ""}`} href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener" aria-label="Chat with RNN Motors on WhatsApp">
      <WaIcon />
    </a>
  );
}
