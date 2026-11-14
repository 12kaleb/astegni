import { createHash } from 'node:crypto';
import { prisma } from './prisma';

const fallbackBuckets = new Map();
const MAX_FALLBACK_BUCKETS = 10_000;

function consumeFallbackBucket(key, limit, windowMs) {
  const now = Date.now();
  if (fallbackBuckets.size >= MAX_FALLBACK_BUCKETS) {
    for (const [bucketKey, bucket] of fallbackBuckets) {
      if (bucket.resetAt <= now) fallbackBuckets.delete(bucketKey);
    }
  }

  let bucket = fallbackBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (fallbackBuckets.size >= MAX_FALLBACK_BUCKETS) {
      return { allowed: false, retryAfterSeconds: 1, fallback: true };
    }
    bucket = { count: 0, resetAt: now + windowMs };
    fallbackBuckets.set(key, bucket);
  }
  bucket.count += 1;
  return {
    allowed: bucket.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    fallback: true,
  };
}

/** Consume one request from a PostgreSQL-backed fixed-window bucket. */
export async function consumeRateLimit({ scope, identity, limit, windowMs }) {
  const key = createHash('sha256').update(`${scope}:${identity}`).digest('hex');

  try {
    const [bucket] = await prisma.$queryRaw`
      WITH cleanup AS (
        DELETE FROM "RateLimitBucket"
        WHERE "resetAt" < NOW() - INTERVAL '1 day'
        RETURNING "key"
      )
      INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
      VALUES (${key}, 1, NOW() + (${windowMs} * INTERVAL '1 millisecond'))
      ON CONFLICT ("key") DO UPDATE
      SET
        "count" = CASE
          WHEN "RateLimitBucket"."resetAt" <= NOW() THEN 1
          ELSE "RateLimitBucket"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "RateLimitBucket"."resetAt" <= NOW()
            THEN NOW() + (${windowMs} * INTERVAL '1 millisecond')
          ELSE "RateLimitBucket"."resetAt"
        END
      RETURNING "count", "resetAt"
    `;

    const count = Number(bucket.count);
    const retryAfterSeconds = Math.max(1, Math.ceil((new Date(bucket.resetAt).getTime() - Date.now()) / 1000));
    return { allowed: count <= limit, retryAfterSeconds };
  } catch (error) {
    console.error(`[rate-limit] ${scope} limiter unavailable:`, error);
    return consumeFallbackBucket(key, limit, windowMs);
  }
}

export function getClientIp(request) {
  const proxyIsTrusted = process.env.VERCEL === '1' || process.env.TRUST_PROXY_HEADERS === 'true';
  if (!proxyIsTrusted) return 'untrusted-proxy';
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return request.headers.get('x-real-ip') || forwarded || 'unknown';
}

export function rateLimitExceededResponse(result, message) {
  const response = Response.json({ error: message }, { status: 429 });
  response.headers.set('Retry-After', String(result.retryAfterSeconds));
  if (result.fallback) response.headers.set('X-RateLimit-Mode', 'memory-fallback');
  return response;
}
