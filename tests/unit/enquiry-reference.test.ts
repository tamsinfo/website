import { describe, expect, it } from "vitest";
import {
  generateEnquiryReference,
  kolkataYear,
  REFERENCE_ALPHABET,
  REFERENCE_PATTERN,
} from "../../src/lib/enquiry-reference";

describe("generateEnquiryReference (FR-054, ENT-007)", () => {
  it("matches ^TAMS-\\d{4}-[2-9A-HJ-NP-Z]{4}$ with 14 characters", () => {
    for (let index = 0; index < 500; index += 1) {
      const reference = generateEnquiryReference(new Date("2026-09-22T12:00:00Z"));
      expect(reference).toMatch(REFERENCE_PATTERN);
      expect(reference).toHaveLength(14);
      expect(reference.startsWith("TAMS-2026-")).toBe(true);
    }
  });

  it("draws the suffix only from the 32-symbol alphabet", () => {
    expect(REFERENCE_ALPHABET).toHaveLength(32);
    expect(REFERENCE_ALPHABET).not.toMatch(/[01IO]/);
    const seen = new Set<string>();
    for (let index = 0; index < 2000; index += 1) {
      for (const symbol of generateEnquiryReference(new Date()).slice(10)) seen.add(symbol);
    }
    for (const symbol of seen) expect(REFERENCE_ALPHABET).toContain(symbol);
    // 8,000 draws from 32 symbols reach every symbol with overwhelming probability.
    expect(seen.size).toBe(32);
  });

  it("uses the year in Asia/Kolkata, not UTC, at the new-year boundary", () => {
    // 2026-12-31T19:00Z is 2027-01-01 00:30 in Kolkata (UTC+05:30).
    expect(kolkataYear(new Date("2026-12-31T19:00:00Z"))).toBe("2027");
    expect(kolkataYear(new Date("2026-12-31T18:29:00Z"))).toBe("2026");
    expect(generateEnquiryReference(new Date("2026-12-31T19:00:00Z"))).toMatch(/^TAMS-2027-/);
  });
});
