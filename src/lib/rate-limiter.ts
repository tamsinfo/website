// C-09, ENT-003, ADR-005. In-process sliding log; counters reset on restart (FR-042).

export const RATE_LIMIT_MAX_HITS = 5;
export const RATE_LIMIT_WINDOW_MS = 600_000;
export const RATE_LIMIT_MAX_KEYS = 10_000;

export interface RateLimiter {
  // Records the hit and reports whether it exceeds the limit. `nowMs` is injected for tests.
  recordHit(clientIp: string, nowMs: number): { limited: boolean };
}

export function createRateLimiter(): RateLimiter {
  const hitTimesByIp = new Map<string, number[]>();
  return {
    recordHit(clientIp, nowMs) {
      const windowStart = nowMs - RATE_LIMIT_WINDOW_MS;
      const previous = hitTimesByIp.get(clientIp) ?? [];
      const remaining = previous.filter((time) => time >= windowStart);
      const limited = remaining.length >= RATE_LIMIT_MAX_HITS;
      remaining.push(nowMs);
      // Re-insertion keeps Map order equal to last-request order, so eviction is O(1).
      hitTimesByIp.delete(clientIp);
      hitTimesByIp.set(clientIp, remaining.slice(-RATE_LIMIT_MAX_HITS));
      while (hitTimesByIp.size > RATE_LIMIT_MAX_KEYS) {
        const oldestKey = hitTimesByIp.keys().next().value;
        if (oldestKey === undefined) break;
        hitTimesByIp.delete(oldestKey);
      }
      return { limited };
    },
  };
}
