import { RateLimiterMemory } from "rate-limiter-flexible";

const limiters = new Map<string, RateLimiterMemory>();

function getOrCreateLimiter(keyPrefix: string, maxRequests: number, windowMs: number): RateLimiterMemory {
  const durationInSeconds = Math.ceil(windowMs / 1000);
  const cacheKey = `${keyPrefix}:${maxRequests}:${durationInSeconds}`;
  
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new RateLimiterMemory({
      points: maxRequests,
      duration: durationInSeconds,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

/**
 * Extract client IP address from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Check sliding-window rate limit using rate-limiter-flexible library
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const prefix = key.split(":")[0] || "global";
  const limiter = getOrCreateLimiter(prefix, maxRequests, windowMs);

  try {
    const res = await limiter.consume(key);
    return {
      allowed: true,
      remaining: res.remainingPoints,
      resetTime: Date.now() + res.msBeforeNext,
    };
  } catch (rej: any) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + (rej?.msBeforeNext || windowMs),
    };
  }
}
