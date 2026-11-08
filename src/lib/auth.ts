import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, verifySession } from "./session";

export async function getSession() {
  const c = await cookies();
  const s = await verifySession(c.get(SESSION_COOKIE)?.value);
  if (!s) return null;
  // Make sure the account still exists (e.g. after a reset or removal).
  const user = await db.user.findUnique({ where: { id: s.uid }, select: { id: true } });
  return user ? s : null;
}

/** Call at the top of every admin page and admin server action. */
export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}
