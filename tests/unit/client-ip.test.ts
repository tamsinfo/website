import { describe, expect, it } from "vitest";
import { resolveClientIp } from "../../src/lib/client-ip";

const SOCKET = "198.51.100.9";

function resolve(headerValue: string | null): string {
  const headers = new Headers();
  if (headerValue !== null) headers.set("CF-Connecting-IP", headerValue);
  return resolveClientIp(headers, () => SOCKET);
}

describe("resolveClientIp (FR-050)", () => {
  it("uses CF-Connecting-IP when present", () => {
    expect(resolve("203.0.113.7")).toBe("203.0.113.7");
  });

  it("trims the header value", () => {
    expect(resolve("  203.0.113.7  ")).toBe("203.0.113.7");
  });

  it("uses the socket peer address when the header is absent", () => {
    expect(resolve(null)).toBe(SOCKET);
  });

  it("ignores an empty header value", () => {
    expect(resolve("   ")).toBe(SOCKET);
  });

  it("accepts a 45-character value and ignores a 46-character value", () => {
    expect(resolve("a".repeat(45))).toBe("a".repeat(45));
    expect(resolve("a".repeat(46))).toBe(SOCKET);
  });

  it("does not read the socket address when the header is usable", () => {
    const headers = new Headers({ "CF-Connecting-IP": "203.0.113.7" });
    expect(
      resolveClientIp(headers, () => {
        throw new Error("socket address read");
      }),
    ).toBe("203.0.113.7");
  });
});
