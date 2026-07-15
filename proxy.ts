import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/invoice/auth";

export const config = {
  matcher: ["/invoice", "/invoice/:path*", "/api/invoices/:path*"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  const isLoginPage = pathname === "/invoice/login";
  const isAuthRoute = pathname.startsWith("/api/invoice-auth");

  if (isLoginPage || isAuthRoute) {
    return response;
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isValid = token ? await verifySessionToken(token) : false;

  if (!isValid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
    }
    const loginUrl = new URL("/invoice/login", request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
    return redirectResponse;
  }

  return response;
}
