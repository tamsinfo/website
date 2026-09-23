import { describe, expect, it } from "vitest";
import { ERROR_CODES, ERROR_STATUS, isErrorCode, REFERENCE_PATTERN } from "../../src/lib/api-types";

describe("api-types", () => {
  it("maps every contract error code to its documented status", () => {
    expect(ERROR_STATUS).toEqual({
      VALIDATION_FAILED: 400,
      SPAM_CHECK_FAILED: 403,
      METHOD_NOT_ALLOWED: 405,
      PAYLOAD_TOO_LARGE: 413,
      UNSUPPORTED_MEDIA_TYPE: 415,
      RATE_LIMITED: 429,
      SEND_FAILED: 502,
    });
    expect(Object.keys(ERROR_STATUS).toSorted()).toEqual([...ERROR_CODES].toSorted());
  });

  it("recognizes only the closed error-code set", () => {
    expect(isErrorCode("RATE_LIMITED")).toBe(true);
    expect(isErrorCode("rate_limited")).toBe(false);
    expect(isErrorCode(429)).toBe(false);
  });

  it("matches the contract reference pattern", () => {
    expect(REFERENCE_PATTERN.test("TAMS-2026-7K3Q")).toBe(true);
    expect(REFERENCE_PATTERN.test("TAMS-2026-7K3O")).toBe(false);
    expect(REFERENCE_PATTERN.test("TAMS-2026-1K3Q")).toBe(false);
  });
});
