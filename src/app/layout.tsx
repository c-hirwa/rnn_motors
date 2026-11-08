import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Manrope({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "RNN Motors | Luxury & Exotic Cars, Importation and Hire in Nairobi",
    template: "%s | RNN Motors",
  },
  description:
    "RNN Motors, Lavington, Nairobi. Luxury and exotic car sales, custom importation and chauffeured luxury car hire. Bentley, Aston Martin, Porsche, Mercedes-AMG, Range Rover. Cars for everyone.",
  openGraph: { siteName: "RNN Motors", type: "website", locale: "en_KE" },
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230b0b0c'/%3E%3Ctext x='32' y='42' font-family='Georgia,serif' font-size='26' text-anchor='middle' fill='%23d4b67a'%3ERNN%3C/text%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = { themeColor: "#0b0b0c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
