"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

export type EnquiryResult = { ok: boolean; error?: string; fieldErrors?: Record<string, string> };

const schema = z.object({
  type: z.enum(["car", "viewing", "hire", "import", "general"]),
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a phone number")
    .max(25)
    .regex(/^[+\d][\d\s()-]{6,}$/, "That doesn't look like a phone number"),
  email: z.union([z.literal(""), z.string().trim().email("Check your email address").max(120)]).optional(),
  message: z.string().trim().max(2000).optional().default(""),
  carId: z.string().max(40).optional(),
  details: z.string().max(4000).optional().default("{}"),
});

// Very small in-memory rate limit: 5 enquiries per 10 minutes per IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

export async function submitEnquiry(_prev: EnquiryResult | null, form: FormData): Promise<EnquiryResult> {
  // Honeypot: real people never fill this hidden field.
  if (form.get("company")) return { ok: true };

  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return { ok: false, error: "Too many requests. Please try again in a few minutes, or WhatsApp us." };

  const d = parsed.data;
  let detailsObj: Record<string, unknown> = {};
  try {
    const p = JSON.parse(d.details || "{}");
    if (p && typeof p === "object" && !Array.isArray(p)) detailsObj = p;
  } catch {}
  const viewingDate = String(form.get("viewingDate") || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(viewingDate)) detailsObj.viewingDate = viewingDate;
  const details = JSON.stringify(detailsObj);

  let carId: string | null = null;
  if (d.carId) carId = (await db.car.findUnique({ where: { id: d.carId }, select: { id: true } }))?.id ?? null;

  await db.enquiry.create({
    data: { type: d.type, name: d.name, phone: d.phone, email: d.email || null, message: d.message, details, carId },
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}
