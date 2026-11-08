export const CATEGORIES = {
  exotic: "Exotic & Luxury",
  executive: "Executive & Performance",
  utility: "Premium Utility",
} as const;

export const CONDITIONS = {
  new: "Brand new (0 km)",
  "foreign-used": "Foreign used",
  "locally-used": "Locally used",
} as const;

export const kes = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");
export const priceLabel = (p: number | null | undefined) => (p ? kes(p) : "Price on request");
export const km = (n: number | null | undefined) => (n == null ? null : n === 0 ? "0 km" : `${n.toLocaleString("en-KE")} km`);
export const carName = (c: { make: string; model: string }) => `${c.make} ${c.model}`;
export const carTitle = (c: { make: string; model: string; year: number | null }) => `${c.year ? c.year + " " : ""}${c.make} ${c.model}`;
