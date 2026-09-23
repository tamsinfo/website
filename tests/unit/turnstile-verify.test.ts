import { describe, expect, it, vi } from "vitest";
import { SITEVERIFY_URL, verifyTurnstileToken, type Fetch } from "../../src/lib/turnstile-verify";

const PASS = { ok: true, value: undefined };
const FAIL = { ok: false, error: "SPAM_CHECK_FAILED" };

function jsonFetch(body: unknown, status = 200) {
  return vi.fn<Fetch>(async () => Response.json(body, { status }));
}

describe("verifyTurnstileToken (FR-028, ADR-007)", () => {
  it("passes when Siteverify returns success true", async () => {
    const fetchImplementation = jsonFetch({ success: true });
    expect(await verifyTurnstileToken("token", "secret", fetchImplementation)).toEqual(PASS);
  });

  it("posts form-encoded secret and response to Siteverify with an abort signal", async () => {
    const fetchImplementation = jsonFetch({ success: true });
    await verifyTurnstileToken("tok en&", "sec=ret", fetchImplementation);
    const [url, init] = fetchImplementation.mock.calls[0] ?? [];
    expect(url).toBe(SITEVERIFY_URL);
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("Content-Type")).toBe(
      "application/x-www-form-urlencoded",
    );
    const form = new URLSearchParams(String(init?.body));
    expect(form.get("secret")).toBe("sec=ret");
    expect(form.get("response")).toBe("tok en&");
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it.each([
    ["success false (invalid or reused token)", { success: false }],
    ["success as a string", { success: "true" }],
    ["a non-object body", [true]],
  ])("fails on %s", async (_label, body) => {
    expect(await verifyTurnstileToken("token", "secret", jsonFetch(body))).toEqual(FAIL);
  });

  it("fails on a non-2xx status", async () => {
    expect(await verifyTurnstileToken("t", "s", jsonFetch({ success: true }, 500))).toEqual(FAIL);
  });

  it("fails on a network error", async () => {
    const fetchImplementation = vi.fn<Fetch>(async () => {
      throw new TypeError("fetch failed");
    });
    expect(await verifyTurnstileToken("t", "s", fetchImplementation)).toEqual(FAIL);
  });

  it("fails on a body that is not JSON", async () => {
    const fetchImplementation = vi.fn<Fetch>(async () => new Response("<html>"));
    expect(await verifyTurnstileToken("t", "s", fetchImplementation)).toEqual(FAIL);
  });

  // Real timers: AbortSignal.timeout runs on Node's internal clock, which fake timers
  // do not control.
  it("fails when Siteverify exceeds 3 seconds", { timeout: 6000 }, async () => {
    const fetchImplementation = vi.fn<Fetch>(
      async (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(init.signal?.reason));
        }),
    );
    const startedAt = performance.now();
    expect(await verifyTurnstileToken("t", "s", fetchImplementation)).toEqual(FAIL);
    const elapsed = performance.now() - startedAt;
    expect(elapsed).toBeGreaterThanOrEqual(2900);
    expect(elapsed).toBeLessThan(4000);
  });

  it.each([
    ["missing", undefined],
    ["null", null],
    ["a number", 42],
    ["empty", ""],
    ["over 2048 characters", "x".repeat(2049)],
  ])("fails without calling Siteverify when the token is %s", async (_label, token) => {
    const fetchImplementation = jsonFetch({ success: true });
    expect(await verifyTurnstileToken(token, "secret", fetchImplementation)).toEqual(FAIL);
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it("accepts a 2048-character token", async () => {
    const fetchImplementation = jsonFetch({ success: true });
    expect(await verifyTurnstileToken("x".repeat(2048), "s", fetchImplementation)).toEqual(PASS);
  });
});
