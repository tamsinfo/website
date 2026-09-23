import { describe, expect, it } from "vitest";
import {
  createRateLimiter,
  RATE_LIMIT_MAX_KEYS,
  RATE_LIMIT_WINDOW_MS,
} from "../../src/lib/rate-limiter";

const START = 1_800_000_000_000;

function hitTimes(limiterIp: string, count: number, startMs: number, stepMs = 1000) {
  const limiter = createRateLimiter();
  const results: boolean[] = [];
  for (let index = 0; index < count; index += 1) {
    results.push(limiter.recordHit(limiterIp, startMs + index * stepMs).limited);
  }
  return { limiter, results };
}

describe("createRateLimiter (FR-042, ADR-005)", () => {
  it("allows five hits and limits the sixth within 10 minutes", () => {
    const { results } = hitTimes("203.0.113.7", 6, START);
    expect(results).toEqual([false, false, false, false, false, true]);
  });

  it("keeps limiting the seventh and later hits inside the window", () => {
    const { limiter } = hitTimes("203.0.113.7", 6, START);
    expect(limiter.recordHit("203.0.113.7", START + 10_000).limited).toBe(true);
  });

  it("allows a hit again once the oldest hit leaves the sliding window", () => {
    const { limiter } = hitTimes("203.0.113.7", 5, START);
    expect(limiter.recordHit("203.0.113.7", START + RATE_LIMIT_WINDOW_MS + 1).limited).toBe(false);
  });

  it("counts a limited hit, so the window slides with the traffic", () => {
    const limiter = createRateLimiter();
    for (let index = 0; index < 5; index += 1) limiter.recordHit("a", START);
    for (let index = 1; index <= 4; index += 1) {
      expect(limiter.recordHit("a", START + index * 60_000).limited).toBe(true);
    }
    // Four limited hits remain inside the window, so one more is allowed and the
    // next is limited again.
    expect(limiter.recordHit("a", START + RATE_LIMIT_WINDOW_MS + 1).limited).toBe(false);
    expect(limiter.recordHit("a", START + RATE_LIMIT_WINDOW_MS + 2).limited).toBe(true);
  });

  it("keeps separate limits per IP and one shared limit for one IP", () => {
    const limiter = createRateLimiter();
    for (let index = 0; index < 5; index += 1) limiter.recordHit("shared", START);
    expect(limiter.recordHit("shared", START).limited).toBe(true);
    expect(limiter.recordHit("other", START).limited).toBe(false);
  });

  it("evicts the IP with the oldest last request beyond 10,000 keys", () => {
    const limiter = createRateLimiter();
    for (let index = 0; index < 5; index += 1) limiter.recordHit("first", START);
    for (let index = 0; index < RATE_LIMIT_MAX_KEYS; index += 1) {
      limiter.recordHit(`ip-${index}`, START + 1);
    }
    expect(limiter.recordHit("first", START + 2).limited).toBe(false);
  });

  it("does not evict a recently active IP", () => {
    const limiter = createRateLimiter();
    limiter.recordHit("old", START);
    for (let index = 0; index < 5; index += 1) limiter.recordHit("busy", START + 1);
    for (let index = 0; index < RATE_LIMIT_MAX_KEYS - 1; index += 1) {
      limiter.recordHit(`ip-${index}`, START + 2);
    }
    expect(limiter.recordHit("busy", START + 3).limited).toBe(true);
  });
});
