/**
 * Minimal in-memory login rate limiter.
 *
 * This project has no database, so attempts are tracked per-process in a
 * Map keyed by client identifier (IP address). This is sufficient to slow
 * down brute-force attempts against a single-admin area, but it resets
 * whenever the server process restarts and is not shared across multiple
 * server instances. This limitation is documented in the README.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count: number;
  windowStart: number;
}

const attempts = new Map<string, AttemptRecord>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const record = attempts.get(identifier);

  if (!record || now - record.windowStart > WINDOW_MS) {
    attempts.set(identifier, { count: 0, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((record.windowStart + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const record = attempts.get(identifier);

  if (!record || now - record.windowStart > WINDOW_MS) {
    attempts.set(identifier, { count: 1, windowStart: now });
    return;
  }

  record.count += 1;
}

export function resetAttempts(identifier: string): void {
  attempts.delete(identifier);
}
