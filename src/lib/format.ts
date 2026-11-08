export const CATEGORIES = {
  exotic: "Exotic & Luxury",
  executive: "Executive & Performance",
  utility: "Premium Utility",
} as const;
export type Category = keyof typeof CATEGORIES;

export const STATUSES = {
  draft: "Draft",
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
} as const;
export type Status = keyof typeof STATUSES;

export const CONDITIONS = {
  new: "Brand new (0 km)",
  "foreign-used": "Foreign used",
  "locally-used": "Locally used",
} as const;

export const ENQUIRY_TYPES = {
  car: "Car enquiry",
  viewing: "Viewing request",
  hire: "Hire request",
  import: "Import quote",
  general: "General",
} as const;

export const ENQUIRY_STATUSES = { new: "New", contacted: "Contacted", closed: "Closed" } as const;

export const kes = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const priceLabel = (p: number | null | undefined) => (p ? kes(p) : "Price on request");
export const km = (n: number | null | undefined) => (n == null ? null : n === 0 ? "0 km" : `${n.toLocaleString("en-KE")} km`);
export const carName = (c: { make: string; model: string }) => `${c.make} ${c.model}`;
export const carTitle = (c: { make: string; model: string; year: number | null }) => `${c.year ? c.year + " " : ""}${c.make} ${c.model}`;
export const mediaUrl = (key: string) => `/media/${key}`;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const timeAgo = (d: Date) => {
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
