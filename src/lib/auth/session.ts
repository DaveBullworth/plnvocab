import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "plnvocab_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface SessionPayload {
  admin: true;
  iat: number;
}

function getSessionSecret(): string | null {
  return process.env.SESSION_SECRET ?? null;
}

function base64urlEncode(s: string): string {
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(s: string): string {
  const padded =
    s.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (s.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(payload: string): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function buildToken(): string {
  const payload: SessionPayload = { admin: true, iat: Date.now() };
  const encoded = base64urlEncode(JSON.stringify(payload));
  const sig = sign(encoded);
  if (!sig) throw new Error("SESSION_SECRET is not set");
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): SessionPayload | null {
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expected = sign(encoded);
  if (!expected) return null;

  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(base64urlDecode(encoded)) as SessionPayload;
    if (payload.admin !== true || typeof payload.iat !== "number") return null;
    if (Date.now() - payload.iat > MAX_AGE_SECONDS * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setAdminCookie(): Promise<void> {
  const c = await cookies();
  c.set(COOKIE_NAME, buildToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export async function getAdminFromCookies(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token) !== null;
}

export async function requireAdmin(): Promise<void> {
  if (!(await getAdminFromCookies())) {
    throw new Error("Unauthorized: admin session required");
  }
}
