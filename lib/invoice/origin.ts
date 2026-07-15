import type { NextRequest } from "next/server";

/**
 * Basic CSRF protection for state-changing requests: verifies that the
 * Origin (or, as a fallback, Referer) header matches the request's own
 * host. Requests without a same-origin Origin/Referer are rejected.
 */
export function isOriginAllowed(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (!host) {
    return false;
  }

  const candidate = origin ?? referer;
  if (!candidate) {
    // Allow same-origin requests that omit both headers only in local dev
    // tooling scenarios is unsafe; require the header to be present.
    return false;
  }

  try {
    const candidateUrl = new URL(candidate);
    return candidateUrl.host === host;
  } catch {
    return false;
  }
}
