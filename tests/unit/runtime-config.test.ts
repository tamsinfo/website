import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseMailConfiguration, type Environment } from "../../src/lib/runtime-config";

const COMPLETE: Environment = {
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: "587",
  SMTP_USER: "user",
  SMTP_PASSWORD: "secret-value",
  MAIL_FROM: "website@example.com",
  SALES_MAILBOX: "sales@example.com",
  TURNSTILE_SECRET_KEY: "turnstile-secret",
};

function missing(environment: Environment): readonly string[] {
  const result = parseMailConfiguration(environment);
  return result.ok ? [] : result.error.missingVariables;
}

describe("parseMailConfiguration", () => {
  it("returns a typed configuration when every variable is valid", () => {
    expect(parseMailConfiguration(COMPLETE)).toEqual({
      ok: true,
      value: {
        smtpHost: "smtp.example.com",
        smtpPort: 587,
        smtpUser: "user",
        smtpPassword: "secret-value",
        mailFrom: "website@example.com",
        salesMailbox: "sales@example.com",
        turnstileSecretKey: "turnstile-secret",
      },
    });
  });

  it("names every missing variable and returns CONFIGURATION_MISSING", () => {
    const result = parseMailConfiguration({});
    expect(result).toEqual({
      ok: false,
      error: {
        code: "CONFIGURATION_MISSING",
        missingVariables: [
          "SMTP_HOST",
          "SMTP_PORT",
          "SMTP_USER",
          "SMTP_PASSWORD",
          "MAIL_FROM",
          "SALES_MAILBOX",
          "TURNSTILE_SECRET_KEY",
        ],
      },
    });
  });

  it.each(["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "TURNSTILE_SECRET_KEY"])(
    "treats an empty %s as missing",
    (name) => {
      expect(missing({ ...COMPLETE, [name]: "  " })).toEqual([name]);
    },
  );

  it.each(["0", "65536", "abc", "587.5", "-1", ""])("rejects SMTP_PORT %j", (port) => {
    expect(missing({ ...COMPLETE, SMTP_PORT: port })).toEqual(["SMTP_PORT"]);
  });

  it.each(["1", "465", "65535"])("accepts SMTP_PORT %s", (port) => {
    expect(missing({ ...COMPLETE, SMTP_PORT: port })).toEqual([]);
  });

  it.each(["not-an-email", "sales@example.com\r\nBcc: x@example.com", "sales@example.com\n"])(
    "rejects an unsafe SALES_MAILBOX and MAIL_FROM %j",
    (address) => {
      expect(missing({ ...COMPLETE, SALES_MAILBOX: address, MAIL_FROM: address })).toEqual([
        "MAIL_FROM",
        "SALES_MAILBOX",
      ]);
    },
  );

  it("never places a value in the failure", () => {
    const result = parseMailConfiguration({ ...COMPLETE, SMTP_HOST: undefined });
    expect(JSON.stringify(result)).not.toContain("secret-value");
  });
});

describe("readMailConfiguration and readTurnstileSiteKey", () => {
  beforeEach(() => {
    vi.resetModules();
    for (const [name, value] of Object.entries(COMPLETE)) vi.stubEnv(name, value);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports a missing variable at first use, not at import", async () => {
    vi.stubEnv("SMTP_PASSWORD", undefined);
    const { readMailConfiguration } = await import("../../src/lib/runtime-config");
    expect(readMailConfiguration()).toEqual({
      ok: false,
      error: { code: "CONFIGURATION_MISSING", missingVariables: ["SMTP_PASSWORD"] },
    });
  });

  it("retries an incomplete read and caches the first complete read", async () => {
    vi.stubEnv("SMTP_HOST", undefined);
    const { readMailConfiguration } = await import("../../src/lib/runtime-config");
    expect(readMailConfiguration().ok).toBe(false);
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    expect(readMailConfiguration().ok).toBe(true);
    vi.stubEnv("SMTP_HOST", undefined);
    expect(readMailConfiguration().ok).toBe(true);
  });

  it("returns the site key or null", async () => {
    const { readTurnstileSiteKey } = await import("../../src/lib/runtime-config");
    vi.stubEnv("TURNSTILE_SITE_KEY", "1x00000000000000000000AA");
    expect(readTurnstileSiteKey()).toBe("1x00000000000000000000AA");
    vi.stubEnv("TURNSTILE_SITE_KEY", "");
    expect(readTurnstileSiteKey()).toBeNull();
    vi.stubEnv("TURNSTILE_SITE_KEY", undefined);
    expect(readTurnstileSiteKey()).toBeNull();
  });
});
