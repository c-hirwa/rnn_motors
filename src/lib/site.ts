export const SITE = {
  name: "RNN Motors",
  tagline: "Cars for everyone",
  // Your own domain if set; otherwise the Vercel production domain (set automatically by Vercel).
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  phones: [
    { label: "+254 794 861101", tel: "+254794861101" },
    { label: "+254 723 766 766", tel: "+254723766766" },
  ],
  whatsapp: "254794861101",
  instagram: "https://www.instagram.com/rnn_motors/",
  address: {
    line1: "The Retro Hub, Ndoto Road",
    line2: "off James Gichuru Road, Lavington",
    city: "Nairobi, Kenya",
  },
  mapsQuery: "RNN Motors, Ndoto Road, Lavington, Nairobi",
  /** Day index (0 = Sunday) → [open hour, close hour] in Nairobi time, or null when closed. */
  hours: { 0: null, 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 13] } as Record<number, [number, number] | null>,
};

export const waLink = (text: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
