import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE } from "@/lib/site";
import "./globals.css";

// Manrope (variable, 400–700, Latin) is bundled in the repo so builds never depend on fetching from Google Fonts.
const sans = localFont({
  src: "./fonts/manrope-latin.woff2",
  weight: "400 700",
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "RNN Motors | Luxury Cars, Importation and Hire in Nairobi",
    template: "%s | RNN Motors",
  },
  description:
    "RNN Motors, Lavington, Nairobi. Luxury car sales, custom importation and chauffeured car hire: Bentley, Aston Martin, Porsche, Mercedes-AMG, Range Rover and more.",
  openGraph: { siteName: "RNN Motors", type: "website", locale: "en_KE" },
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230a0a0a'/%3E%3Ctext x='32' y='41' font-family='Arial,sans-serif' font-weight='700' font-size='22' text-anchor='middle' fill='%23c9cdd3'%3ERNN%3C/text%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
