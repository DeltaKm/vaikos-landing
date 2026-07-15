import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/invoice/auth";
import { checkRateLimit, recordFailedAttempt, resetAttempts } from "@/lib/invoice/rate-limit";
import { isOriginAllowed } from "@/lib/invoice/origin";

function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}

export async function POST(request: NextRequest) {
  if (!isOriginAllowed(request)) {
    return NextResponse.json({ error: "Origine della richiesta non valida." }, { status: 403 });
  }

  const identifier = getClientIdentifier(request);
  const rateLimit = checkRateLimit(identifier);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Troppi tentativi di accesso. Riprova tra ${rateLimit.retryAfterSeconds} secondi.`,
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  const password = typeof body === "object" && body !== null && "password" in body
    ? String((body as Record<string, unknown>).password ?? "")
    : "";

  if (!password) {
    recordFailedAttempt(identifier);
    return NextResponse.json({ error: "Password obbligatoria." }, { status: 400 });
  }

  let isValid = false;
  try {
    isValid = await verifyAdminPassword(password);
  } catch (error) {
    console.error("Errore durante la verifica della password:", error);
    return NextResponse.json(
      { error: "Configurazione del server non valida. Contattare l'amministratore." },
      { status: 500 }
    );
  }

  if (!isValid) {
    recordFailedAttempt(identifier);
    return NextResponse.json({ error: "Password non corretta." }, { status: 401 });
  }

  resetAttempts(identifier);

  let token: string;
  try {
    token = await createSessionToken();
  } catch (error) {
    console.error("Errore durante la creazione della sessione:", error);
    return NextResponse.json(
      { error: "Configurazione del server non valida. Contattare l'amministratore." },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
  return response;
}
