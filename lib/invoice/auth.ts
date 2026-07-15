import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE_NAME = "vaikos_invoice_session";
export const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours
// The invoice pages (/invoice) and the invoice APIs (/api/invoices,
// /api/invoice-auth) do not share a common path prefix, so the cookie must
// be scoped to "/" to be sent on every relevant request. Protection is
// instead enforced via httpOnly, sameSite, and the signed JWT payload.
export const SESSION_COOKIE_PATH = "/";

interface SessionPayload extends JWTPayload {
  sub: "invoice-admin";
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.INVOICE_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "INVOICE_SESSION_SECRET non impostata o troppo corta. Impostare una stringa segreta di almeno 16 caratteri nelle variabili d'ambiente."
    );
  }
  return new TextEncoder().encode(secret);
}

function getAdminPasswordHash(): string {
  const hash = process.env.INVOICE_ADMIN_PASSWORD_HASH;
  if (!hash) {
    throw new Error(
      "INVOICE_ADMIN_PASSWORD_HASH non impostata. Generare un hash bcrypt con lo script scripts/hash-password.mjs."
    );
  }
  return hash;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = getAdminPasswordHash();
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(): Promise<string> {
  const secret = getSessionSecret();
  const payload: SessionPayload = { sub: "invoice-admin" };
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const secret = getSessionSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload.sub === "invoice-admin";
  } catch {
    return false;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: SESSION_COOKIE_PATH,
    maxAge: SESSION_DURATION_SECONDS,
  };
}
