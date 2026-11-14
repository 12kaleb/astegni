import { createHash } from 'node:crypto';
import { prisma } from './prisma';

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
    return { allowed: false, unavailable: true, retryAfterSeconds: 1 };
  }
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return request.headers.get('x-real-ip') || forwarded || 'unknown';
}
