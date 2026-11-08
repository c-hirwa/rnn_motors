"use server";

import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SESSION_COOKIE, sessionCookie, signSession } from "@/lib/session";
import { deleteImage, saveImage } from "@/lib/storage";
import { slugify } from "@/lib/format";

const refresh = () => revalidatePath("/", "layout");

/* ================================================================== */
/* Auth                                                                */
/* ================================================================== */

const attempts = new Map<string, { n: number; until: number }>();

export async function login(_prev: { error?: string; email?: string } | null, form: FormData) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const email = String(form.get("email") || "").toLowerCase().trim();
  const a = attempts.get(ip);
  if (a && a.until > Date.now()) return { error: "Too many attempts. Try again in a few minutes.", email };

  const password = String(form.get("password") || "");
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  // Hash anyway when the user doesn't exist, so response time doesn't reveal valid emails.
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : (await bcrypt.hash(password, 12), false);

  if (!user || !ok) {
    const n = (a?.n ?? 0) + 1;
    attempts.set(ip, { n, until: n >= 5 ? Date.now() + 5 * 60_000 : 0 });
    return { error: "That email and password don't match.", email };
  }
  attempts.delete(ip);
  const token = await signSession({ uid: user.id, email: user.email, name: user.name });
  (await cookies()).set(sessionCookie(token));
  const next = String(form.get("next") || "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function changePassword(_prev: { error?: string; ok?: boolean } | null, form: FormData) {
  const s = await requireAdmin();
  const current = String(form.get("current") || "");
  const next = String(form.get("next") || "");
  const confirm = String(form.get("confirm") || "");
  if (next.length < 10) return { error: "Use at least 10 characters." };
  if (next !== confirm) return { error: "The new passwords don't match." };
  const user = await db.user.findUnique({ where: { id: s.uid } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { error: "Your current password is wrong." };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { ok: true };
}

/* ================================================================== */
/* Cars                                                                */
/* ================================================================== */

const optStr = z.string().trim().max(120).transform((v) => v || null);
const optInt = (max: number) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(/[^\d]/g, ""))
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isSafeInteger(v) && v <= max), "Number is too large");

const carSchema = z.object({
  make: z.string().trim().min(1, "Required").max(60),
  model: z.string().trim().min(1, "Required").max(80),
  year: optInt(2100).refine((v) => v === null || v >= 1950, "Check the year"),
  category: z.enum(["exotic", "executive", "utility"]),
  body: z.string().trim().min(1, "Required").max(60),
  colour: z.string().trim().min(1, "Required").max(60),
  interior: optStr,
  engine: optStr,
  power: optStr,
  transmission: optStr,
  drive: optStr,
  fuel: optStr,
  mileageKm: optInt(2_000_000),
  condition: z.enum(["", "new", "foreign-used", "locally-used"]).transform((v) => v || null),
  priceKes: optInt(5_000_000_000),
  status: z.enum(["draft", "available", "reserved", "sold"]),
  featured: z.string().optional().transform((v) => v === "on"),
  forHire: z.string().optional().transform((v) => v === "on"),
  description: z.string().trim().max(4000),
  features: z.string().trim().max(4000),
  slug: z.string().trim().max(80).optional(),
});

export type CarFormState = { error?: string; fieldErrors?: Record<string, string> } | null;

type PhotoOrder = { kind: "existing"; id: string; focus: string } | { kind: "new"; index: number; focus: string };

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "car";
  let slug = root;
  for (let i = 2; ; i++) {
    const hit = await db.car.findUnique({ where: { slug }, select: { id: true } });
    if (!hit || hit.id === excludeId) return slug;
    slug = `${root}-${i}`;
  }
}

const FOCUS_RE = /^\d{1,3}% \d{1,3}%$/;

export async function saveCar(_prev: CarFormState, form: FormData): Promise<CarFormState> {
  await requireAdmin();
  const id = String(form.get("id") || "") || null;

  const parsed = carSchema.safeParse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { error: "Some fields need attention.", fieldErrors };
  }
  const { slug: slugInput, ...d } = parsed.data;

  let order: PhotoOrder[] = [];
  try {
    order = JSON.parse(String(form.get("photoOrder") || "[]"));
  } catch {
    return { error: "Photo data was malformed. Reload and try again." };
  }
  const files = form.getAll("newPhotos").filter((f): f is File => f instanceof File && f.size > 0);
  for (const f of files) {
    if (!f.type.startsWith("image/")) return { error: `${f.name} isn't an image.` };
    if (f.size > 15 * 1024 * 1024) return { error: `${f.name} is over 15 MB.` };
  }

  const existing = id ? await db.car.findUnique({ where: { id }, include: { photos: true } }) : null;
  if (id && !existing) return { error: "That car no longer exists." };

  // Custom slug if given; otherwise keep the current URL, or build one for a new car.
  const slug = slugInput
    ? await uniqueSlug(slugInput, id ?? undefined)
    : existing
      ? existing.slug
      : await uniqueSlug([d.year, d.make, d.model, d.colour].filter(Boolean).join(" "));

  // Process new uploads first, so a bad image fails before anything is written.
  const saved: { key: string; width: number; height: number }[] = [];
  try {
    for (const f of files) saved.push(await saveImage(Buffer.from(await f.arrayBuffer()), slug));
  } catch {
    await Promise.all(saved.map((s) => deleteImage(s.key)));
    return { error: "One of the photos couldn't be read. Try a JPG or PNG." };
  }

  const soldAt = d.status === "sold" ? (existing?.soldAt ?? new Date()) : null;
  const data = { ...d, slug, soldAt };

  const car = existing
    ? await db.car.update({ where: { id: existing.id }, data })
    : await db.car.create({ data });

  // Reconcile photos: keep/reorder existing ones, add new ones, delete removed ones.
  const keepIds = new Set(order.filter((o) => o.kind === "existing").map((o) => (o as { id: string }).id));
  const removed = existing?.photos.filter((p) => !keepIds.has(p.id)) ?? [];
  await db.$transaction([
    ...removed.map((p) => db.photo.delete({ where: { id: p.id } })),
    ...order.flatMap((o, position) => {
      const focus = FOCUS_RE.test(o.focus) ? o.focus : "50% 50%";
      if (o.kind === "existing") {
        if (!existing?.photos.some((p) => p.id === o.id)) return [];
        return [db.photo.update({ where: { id: o.id }, data: { position, focus } })];
      }
      const s = saved[o.index];
      return s ? [db.photo.create({ data: { carId: car.id, key: s.key, width: s.width, height: s.height, position, focus } })] : [];
    }),
  ]);
  await Promise.all(removed.map((p) => deleteImage(p.key)));

  refresh();
  redirect(`/admin/cars?saved=${encodeURIComponent(car.make + " " + car.model)}`);
}

export async function deleteCar(id: string) {
  await requireAdmin();
  const car = await db.car.findUnique({ where: { id }, include: { photos: true } });
  if (!car) return;
  await db.car.delete({ where: { id } });
  await Promise.all(car.photos.map((p) => deleteImage(p.key)));
  refresh();
}

export async function setCarStatus(id: string, status: string) {
  await requireAdmin();
  if (!["draft", "available", "reserved", "sold"].includes(status)) return;
  const car = await db.car.findUnique({ where: { id }, select: { soldAt: true } });
  if (!car) return;
  await db.car.update({ where: { id }, data: { status, soldAt: status === "sold" ? (car.soldAt ?? new Date()) : null } });
  refresh();
}

export async function toggleCarFlag(id: string, flag: "featured" | "forHire") {
  await requireAdmin();
  const car = await db.car.findUnique({ where: { id }, select: { featured: true, forHire: true } });
  if (!car) return;
  await db.car.update({ where: { id }, data: { [flag]: !car[flag] } });
  refresh();
}

export async function duplicateCar(id: string) {
  await requireAdmin();
  const car = await db.car.findUnique({ where: { id } });
  if (!car) return;
  const { id: _id, createdAt: _c, updatedAt: _u, slug, soldAt: _s, ...rest } = car;
  const copy = await db.car.create({ data: { ...rest, status: "draft", featured: false, slug: await uniqueSlug(slug + "-copy") } });
  redirect(`/admin/cars/${copy.id}`);
}

/* ================================================================== */
/* Enquiries                                                           */
/* ================================================================== */

export async function setEnquiryStatus(id: string, status: string) {
  await requireAdmin();
  if (!["new", "contacted", "closed"].includes(status)) return;
  await db.enquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin", "layout");
}

export async function deleteEnquiry(id: string) {
  await requireAdmin();
  await db.enquiry.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin", "layout");
}
