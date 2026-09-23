import { describe, expect, it } from "vitest";
import {
  callingCodeFor,
  callingCodeSet,
  DEFAULT_CALLING_CODE,
  listCallingCodes,
} from "../../src/lib/calling-codes";

describe("callingCodeFor", () => {
  it.each([
    ["IN", "+91"],
    ["SG", "+65"],
    ["US", "+1"],
    ["CA", "+1"],
  ])("maps %s to %s", (country, code) => {
    expect(callingCodeFor(country)).toBe(code);
  });

  it.each(["XX", "T1", "ZZ", "", "sg", "<script>"])("falls back to +91 for %j", (country) => {
    expect(callingCodeFor(country)).toBe("+91");
  });

  it("falls back to +91 when the header is absent", () => {
    expect(callingCodeFor(null)).toBe(DEFAULT_CALLING_CODE);
    expect(callingCodeFor(undefined)).toBe(DEFAULT_CALLING_CODE);
  });
});

describe("listCallingCodes", () => {
  const codes = listCallingCodes();

  it("lists distinct digit-only codes in ascending numeric order", () => {
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.every((code) => /^\d+$/.test(code))).toBe(true);
    const numeric = codes.map(Number);
    expect(numeric).toEqual(numeric.toSorted((left, right) => left - right));
  });

  it("contains the codes FR-024 names", () => {
    const set = callingCodeSet();
    for (const code of ["1", "65", "91"]) expect(set.has(code)).toBe(true);
  });
});
