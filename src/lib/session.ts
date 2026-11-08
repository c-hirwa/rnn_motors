// Edge-safe session helpers (used by middleware and server code).
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "rnn_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const key = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET is missing or too short");
  return new TextEncoder().encode(s);
};

export type Session = { uid: string; email: string; name: string };

export async function signSession(s: Session) {
  return new SignJWT(s)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return { uid: String(payload.uid), email: String(payload.email), name: String(payload.name) };
  } catch {
    return null;
  }
}

export const sessionCookie = (value: string) => ({
  name: SESSION_COOKIE,
  value,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
});
