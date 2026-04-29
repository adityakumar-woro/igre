// Simple in-memory rate limiter, sliding window.
// Acceptable for single-instance deployments.
// TODO: swap to Upstash Redis for multi-instance / serverless.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const REQ_LIMIT = Number(process.env.RATE_LIMIT_REQUESTS ?? 10);
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);

export function rateLimit(key: string, limit = REQ_LIMIT, windowMs = WINDOW_MS) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

// Periodically prune expired buckets to keep memory usage in check.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [k, b] of buckets) {
      if (b.resetAt < now) buckets.delete(k);
    }
  }, 5 * 60_000).unref?.();
}
