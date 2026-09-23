import type { APIContext, APIRoute } from "astro";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REFERENCE_PATTERN } from "../../src/lib/api-types";

// Drives C-05 end to end with the real pipeline, validator, reference generator, and
// composer. Only the network edges are fake: Nodemailer's transport and global fetch.

interface SentMessage {
  readonly from: string;
  readonly to: string;
  readonly replyTo: string;
  readonly subject: string;
  readonly text: string;
  readonly envelope: { readonly from: string; readonly to: string };
}

const smtp = vi.hoisted(() => ({
  sent: [] as unknown[],
  transportOptions: [] as unknown[],
  behavior: "accept" as "accept" | "reject",
}));

vi.mock("nodemailer", () => ({
  createTransport: (options: unknown) => {
    smtp.transportOptions.push(options);
    return {
      sendMail: async (message: unknown) => {
        smtp.sent.push(message);
        if (smtp.behavior === "reject") {
          // Real Nodemailer errors can echo the message; the log MUST NOT carry it.
          throw new Error(`550 rejected: ${JSON.stringify(message)}`);
        }
        return { accepted: ["sales@example.com"], rejected: [] };
      },
      close: () => undefined,
    };
  },
}));

const ENVIRONMENT = {
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: "587",
  SMTP_USER: "smtp-user",
  SMTP_PASSWORD: "smtp-password-value",
  MAIL_FROM: "website@example.com",
  SALES_MAILBOX: "sales@example.com",
  TURNSTILE_SECRET_KEY: "turnstile-secret-value",
} as const;

const SOCKET_ADDRESS = "198.51.100.1";
const URL = "http://localhost/api/contact";
const MAX_BODY_BYTES = 65_536;

const VALID = {
  name: "Priya Raman",
  company: "Northaid Logistics",
  workEmail: "ops@northaid.example",
  phone: "+91 98450 12345",
  interest: "Services",
  message: "We plan to move from ECC to S/4HANA Cloud next year and need a partner.",
  turnstileToken: "XXXX.DUMMY.TOKEN.XXXX",
};

let handler: APIRoute;
let siteverify: ReturnType<typeof vi.fn<typeof fetch>>;
let logWrites: string[];

beforeEach(async () => {
  smtp.sent.length = 0;
  smtp.transportOptions.length = 0;
  smtp.behavior = "accept";
  for (const [key, value] of Object.entries(ENVIRONMENT)) vi.stubEnv(key, value);
  siteverify = vi.fn<typeof fetch>(async () => Response.json({ success: true }));
  vi.stubGlobal("fetch", siteverify);
  logWrites = [];
  vi.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array) => {
    logWrites.push(String(chunk));
    return true;
  });
  // A fresh module gives each test its own rate-limit store and configuration cache.
  vi.resetModules();
  const endpoint = await import("../../src/pages/api/contact");
  handler = endpoint.ALL;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

interface CallOptions {
  readonly method?: string;
  readonly contentType?: string | null;
  readonly body?: BodyInit | null;
  readonly clientIp?: string | null;
  readonly readSocketAddress?: () => string;
}

async function call(options: CallOptions = {}): Promise<Response> {
  const headers = new Headers();
  const contentType = options.contentType === undefined ? "application/json" : options.contentType;
  if (contentType !== null) headers.set("Content-Type", contentType);
  const clientIp = options.clientIp === undefined ? "203.0.113.7" : options.clientIp;
  if (clientIp !== null) headers.set("CF-Connecting-IP", clientIp);
  const method = options.method ?? "POST";
  const body = options.body === undefined ? JSON.stringify(VALID) : options.body;
  const request = new Request(URL, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? null : body,
  });
  const readSocketAddress = options.readSocketAddress ?? (() => SOCKET_ADDRESS);
  const context = {
    request,
    get clientAddress() {
      return readSocketAddress();
    },
  };
  return handler(context as unknown as APIContext);
}

function post(submission: Record<string, unknown>, clientIp?: string): Promise<Response> {
  return call({ body: JSON.stringify(submission), ...(clientIp ? { clientIp } : {}) });
}

function logEntries(): Record<string, unknown>[] {
  return logWrites.map((line) => JSON.parse(line) as Record<string, unknown>);
}

function sentMessages(): SentMessage[] {
  return smtp.sent as SentMessage[];
}

// A valid submission padded with an ignored property to an exact UTF-8 byte size.
function paddedBody(totalBytes: number): string {
  const empty = JSON.stringify({ ...VALID, padding: "" });
  return JSON.stringify({ ...VALID, padding: "x".repeat(totalBytes - empty.length) });
}

describe("POST /api/contact 200 (FR-030, FR-054)", () => {
  it("returns status sent and a reference that matches the contract pattern", async () => {
    const response = await call();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    const body = (await response.json()) as Record<string, unknown>;
    expect(Object.keys(body).toSorted()).toEqual(["reference", "status"]);
    expect(body["status"]).toBe("sent");
    expect(body["reference"]).toMatch(REFERENCE_PATTERN);
  });

  it("sends exactly one email whose subject and first body line carry the reference", async () => {
    const response = await call();
    const { reference } = (await response.json()) as { reference: string };
    expect(sentMessages()).toHaveLength(1);
    const [message] = sentMessages();
    expect(message?.subject).toBe(`Website enquiry ${reference}: Services — Northaid Logistics`);
    const lines = message?.text.split("\n") ?? [];
    expect(lines[0]).toBe(`Reference: ${reference}`);
    expect(lines.slice(1, 7)).toEqual([
      "Name: Priya Raman",
      "Company: Northaid Logistics",
      "Work email: ops@northaid.example",
      "Phone: +91 98450 12345",
      "Interest: Services",
      "Message:",
    ]);
    expect(lines.at(-1)).toMatch(/^Submitted: \d{4}-\d{2}-\d{2} \d{2}:\d{2} IST$/);
  });

  it("sets Reply-To to the trimmed work email and sends only to the sales mailbox", async () => {
    await post({ ...VALID, workEmail: "  ops@northaid.example  " });
    const [message] = sentMessages();
    expect(message?.replyTo).toBe("ops@northaid.example");
    expect(message?.from).toBe("website@example.com");
    expect(message?.to).toBe("sales@example.com");
    expect(message?.envelope).toEqual({ from: "website@example.com", to: "sales@example.com" });
  });

  it("uses the configured SMTP transport with 8-second timeouts", async () => {
    await call();
    expect(smtp.transportOptions).toEqual([
      expect.objectContaining({
        host: "smtp.example.com",
        port: 587,
        requireTLS: true,
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000,
      }),
    ]);
  });

  it("verifies the token with Siteverify using the secret key", async () => {
    await call();
    expect(siteverify).toHaveBeenCalledTimes(1);
    const form = new URLSearchParams(String(siteverify.mock.calls[0]?.[1]?.body));
    expect(form.get("secret")).toBe("turnstile-secret-value");
    expect(form.get("response")).toBe(VALID.turnstileToken);
  });

  it("accepts an absent phone, a calling code alone, and unknown fields", async () => {
    const { phone: _phone, ...withoutPhone } = VALID;
    expect((await post(withoutPhone, "203.0.113.20")).status).toBe(200);
    expect((await post({ ...VALID, phone: "+91" }, "203.0.113.21")).status).toBe(200);
    expect((await post({ ...VALID, extra: { nested: true } }, "203.0.113.22")).status).toBe(200);
    for (const message of sentMessages().slice(0, 2)) {
      expect(message.text).toContain("\nPhone: Not provided\n");
    }
  });

  it("sends two emails for two identical submissions", async () => {
    expect((await call()).status).toBe(200);
    expect((await call()).status).toBe(200);
    expect(sentMessages()).toHaveLength(2);
  });

  it("carries HTML and line breaks in the message as literal text", async () => {
    const message = "<script>alert(1)</script>\nSecond line of the enquiry text.";
    await post({ ...VALID, message });
    expect(sentMessages()[0]?.text).toContain(`Message:\n${message}\nSubmitted:`);
  });
});

describe("POST /api/contact 400 (FR-027)", () => {
  it("returns one entry per failing field in form order", async () => {
    const response = await post({
      name: "",
      company: "   ",
      workEmail: "not-an-email",
      phone: "abc",
      interest: "services",
      message: "too short",
      turnstileToken: "token",
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      code: "VALIDATION_FAILED",
      fieldErrors: [
        { field: "name", message: "Enter your name." },
        { field: "company", message: "Enter your company name." },
        { field: "workEmail", message: "Enter a valid email address." },
        { field: "phone", message: "Enter a valid phone number." },
        { field: "interest", message: "Choose an interest." },
        { field: "message", message: "Message must be at least 20 characters." },
      ],
    });
    expect(siteverify).not.toHaveBeenCalled();
    expect(sentMessages()).toHaveLength(0);
  });

  it("treats absent required fields as empty", async () => {
    const response = await post({ turnstileToken: "token" });
    const body = (await response.json()) as { fieldErrors: { field: string }[] };
    expect(body.fieldErrors.map((error) => error.field)).toEqual([
      "name",
      "company",
      "workEmail",
      "interest",
      "message",
    ]);
  });

  it.each([["not json"], ["{"], [""]])(
    "returns empty fieldErrors for invalid JSON %j",
    async (body) => {
      const response = await call({ body });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ code: "VALIDATION_FAILED", fieldErrors: [] });
    },
  );

  it.each([["[]"], ["null"], ['"text"'], ["42"]])(
    "returns empty fieldErrors for the non-object body %s",
    async (body) => {
      const response = await call({ body });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ code: "VALIDATION_FAILED", fieldErrors: [] });
    },
  );

  it("reports the over-length message rule", async () => {
    const response = await post({ ...VALID, message: "m".repeat(4001) });
    expect(await response.json()).toEqual({
      code: "VALIDATION_FAILED",
      fieldErrors: [{ field: "message", message: "Message must be at most 4000 characters." }],
    });
  });
});

describe("POST /api/contact 403 (FR-028)", () => {
  it("fails when Siteverify reports success false", async () => {
    siteverify.mockImplementation(async () => Response.json({ success: false }));
    const response = await call();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ code: "SPAM_CHECK_FAILED" });
    expect(sentMessages()).toHaveLength(0);
  });

  it("fails when Siteverify is unreachable", async () => {
    siteverify.mockImplementation(async () => {
      throw new TypeError("fetch failed");
    });
    expect((await call()).status).toBe(403);
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["non-string", 123],
    ["over 2048 characters", "t".repeat(2049)],
  ])("fails without calling Siteverify when the token is %s", async (_label, token) => {
    const response = await post({ ...VALID, turnstileToken: token });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ code: "SPAM_CHECK_FAILED" });
    expect(siteverify).not.toHaveBeenCalled();
  });
});

describe("/api/contact 405 (FR-027, FR-053)", () => {
  it.each([["GET"], ["HEAD"], ["PUT"], ["PATCH"], ["DELETE"], ["OPTIONS"]])(
    "%s returns 405 with Allow: POST",
    async (method) => {
      const response = await call({ method });
      expect(response.status).toBe(405);
      expect(response.headers.get("Allow")).toBe("POST");
      expect(await response.json()).toEqual({ code: "METHOD_NOT_ALLOWED" });
      expect(response.headers.has("Access-Control-Allow-Origin")).toBe(false);
    },
  );

  it("AC-006.9: PUT with a 70 KB body returns 405 without reading it or calling Siteverify", async () => {
    const headers = new Headers({ "Content-Type": "application/json" });
    const request = new Request(URL, { method: "PUT", headers, body: "x".repeat(70 * 1024) });
    const response = await handler({
      request,
      clientAddress: SOCKET_ADDRESS,
    } as unknown as APIContext);
    expect(response.status).toBe(405);
    expect(request.bodyUsed).toBe(false);
    expect(siteverify).not.toHaveBeenCalled();
  });

  it("does not count non-POST requests toward the rate limit", async () => {
    for (let index = 0; index < 6; index += 1) await call({ method: "GET" });
    expect((await call()).status).toBe(200);
  });
});

describe("POST /api/contact 413 (NFR-007)", () => {
  it("accepts a valid 65,536-byte body", async () => {
    const body = paddedBody(MAX_BODY_BYTES);
    expect(new TextEncoder().encode(body).byteLength).toBe(MAX_BODY_BYTES);
    expect((await call({ body })).status).toBe(200);
  });

  it("rejects a 65,537-byte body", async () => {
    const response = await call({ body: paddedBody(MAX_BODY_BYTES + 1) });
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ code: "PAYLOAD_TOO_LARGE" });
    expect(siteverify).not.toHaveBeenCalled();
  });

  it("rejects a streamed 65,537-byte body without Content-Length", async () => {
    const bytes = new TextEncoder().encode(paddedBody(MAX_BODY_BYTES + 1));
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let offset = 0; offset < bytes.byteLength; offset += 1000) {
          controller.enqueue(bytes.slice(offset, offset + 1000));
        }
        controller.close();
      },
    });
    const request = new Request(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.7" },
      body,
      duplex: "half",
    } as RequestInit);
    const response = await handler({
      request,
      clientAddress: SOCKET_ADDRESS,
    } as unknown as APIContext);
    expect(response.status).toBe(413);
  });

  it("fits the largest valid submission in 4-byte characters within the limit", async () => {
    const wide = "😀";
    const body = JSON.stringify({
      name: wide.repeat(100),
      company: wide.repeat(150),
      workEmail: `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(57)}`,
      phone: "+".concat("1".repeat(19)),
      interest: "Other",
      message: wide.repeat(4000),
      turnstileToken: "t".repeat(2048),
    });
    expect(new TextEncoder().encode(body).byteLength).toBeLessThanOrEqual(MAX_BODY_BYTES);
    expect((await call({ body })).status).toBe(200);
  });
});

describe("POST /api/contact 415 (FR-027)", () => {
  it.each([
    ["text/plain"],
    ["application/x-www-form-urlencoded"],
    ["multipart/form-data; boundary=x"],
    [null],
  ])("rejects Content-Type %j", async (contentType) => {
    const response = await call({ contentType });
    expect(response.status).toBe(415);
    expect(await response.json()).toEqual({ code: "UNSUPPORTED_MEDIA_TYPE" });
  });

  it("accepts application/json with parameters, case-insensitively", async () => {
    expect((await call({ contentType: "Application/JSON; charset=UTF-8" })).status).toBe(200);
  });
});

describe("POST /api/contact 429 (FR-042, FR-050)", () => {
  it("rate-limits the sixth POST from one IP", async () => {
    const statuses: number[] = [];
    for (let index = 0; index < 6; index += 1) statuses.push((await call()).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
    const response = await call();
    expect(await response.json()).toEqual({ code: "RATE_LIMITED" });
    expect(sentMessages()).toHaveLength(5);
  });

  it("counts rejected POSTs", async () => {
    for (let index = 0; index < 5; index += 1) await call({ contentType: "text/plain" });
    expect((await call()).status).toBe(429);
  });

  it("keys on CF-Connecting-IP, so another IP is not limited", async () => {
    for (let index = 0; index < 5; index += 1) await call({ clientIp: "203.0.113.50" });
    expect((await call({ clientIp: "203.0.113.50" })).status).toBe(429);
    expect((await call({ clientIp: "203.0.113.51" })).status).toBe(200);
  });

  it("falls back to the socket address when CF-Connecting-IP is absent", async () => {
    for (let index = 0; index < 5; index += 1) await call({ clientIp: null });
    expect((await call({ clientIp: null })).status).toBe(429);
    expect((await call({ clientIp: SOCKET_ADDRESS })).status).toBe(429);
  });
});

describe("POST /api/contact 502 (FR-030, NFR-015)", () => {
  it("returns SEND_FAILED without a reference when SMTP rejects", async () => {
    smtp.behavior = "reject";
    const response = await call();
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ code: "SEND_FAILED" });
    expect(sentMessages()).toHaveLength(1);
  });

  it("returns SEND_FAILED before Siteverify when configuration is missing", async () => {
    vi.stubEnv("SMTP_HOST", undefined);
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const response = await call();
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ code: "SEND_FAILED" });
    expect(siteverify).not.toHaveBeenCalled();
    expect(logEntries()).toEqual([
      {
        time: expect.any(String),
        outcome: "send_failed",
        detail: "missing: SMTP_HOST,TURNSTILE_SECRET_KEY",
      },
    ]);
  });

  it("maps an unexpected exception to SEND_FAILED instead of throwing", async () => {
    const response = await call({
      clientIp: null,
      readSocketAddress: () => {
        throw new Error("clientAddress unavailable");
      },
    });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ code: "SEND_FAILED" });
    expect(logEntries()).toEqual([{ time: expect.any(String), outcome: "send_failed" }]);
  });
});

describe("FR-053 check order", () => {
  it("405 beats an oversized body", async () => {
    const response = await call({ method: "PUT", body: "x".repeat(MAX_BODY_BYTES + 1) });
    expect(response.status).toBe(405);
  });

  it("415 beats an oversized body", async () => {
    const response = await call({
      contentType: "text/plain",
      body: "x".repeat(MAX_BODY_BYTES + 1),
    });
    expect(response.status).toBe(415);
  });

  it("413 beats the rate limit", async () => {
    for (let index = 0; index < 5; index += 1) await call();
    expect((await call({ body: "x".repeat(MAX_BODY_BYTES + 1) })).status).toBe(413);
  });

  it("429 beats invalid fields from a rate-limited IP", async () => {
    for (let index = 0; index < 5; index += 1) await call();
    expect((await post({ name: "" })).status).toBe(429);
  });

  it("400 beats a bad Turnstile token, and Siteverify is not called", async () => {
    const response = await post({ ...VALID, name: "", turnstileToken: "" });
    expect(response.status).toBe(400);
    expect(siteverify).not.toHaveBeenCalled();
  });

  it("403 beats SMTP: no email is sent when Turnstile fails", async () => {
    siteverify.mockImplementation(async () => Response.json({ success: false }));
    expect((await call()).status).toBe(403);
    expect(smtp.transportOptions).toHaveLength(0);
  });
});

describe("outcome log (NFR-017, NFR-018)", () => {
  it("writes exactly one line per request with the matching outcome", async () => {
    const cases: [CallOptions, number, string][] = [
      [{ clientIp: "10.0.0.1" }, 200, "sent"],
      [{ clientIp: "10.0.0.2", body: "[]" }, 400, "invalid"],
      [{ clientIp: "10.0.0.3", method: "DELETE" }, 405, "method_not_allowed"],
      [{ clientIp: "10.0.0.4", body: "x".repeat(MAX_BODY_BYTES + 1) }, 413, "payload_too_large"],
      [{ clientIp: "10.0.0.5", contentType: "text/html" }, 415, "unsupported_media_type"],
      [
        { clientIp: "10.0.0.6", body: JSON.stringify({ ...VALID, turnstileToken: "" }) },
        403,
        "spam_check_failed",
      ],
    ];
    for (const [options, status, outcome] of cases) {
      logWrites.length = 0;
      const response = await call(options);
      expect(response.status).toBe(status);
      expect(logWrites).toHaveLength(1);
      expect(logWrites[0]?.endsWith("\n")).toBe(true);
      expect(logWrites[0]?.split("\n")).toHaveLength(2);
      const entry = JSON.parse(logWrites[0] ?? "") as Record<string, unknown>;
      expect(entry).toEqual({ time: expect.any(String), outcome });
      expect(new Date(String(entry["time"])).toISOString()).toBe(entry["time"]);
    }
  });

  it("logs rate_limited once for the sixth request", async () => {
    for (let index = 0; index < 6; index += 1) await call({ clientIp: "10.0.0.9" });
    expect(logEntries().map((entry) => entry["outcome"])).toEqual([
      "sent",
      "sent",
      "sent",
      "sent",
      "sent",
      "rate_limited",
    ]);
  });

  it("never writes a field value, the IP, the token, or the reference", async () => {
    const markers = {
      name: "MARKERNAME",
      company: "MARKERCOMPANY",
      workEmail: "markeremail@markerdomain.example",
      phone: "+44 7700 900123",
      interest: "Careers",
      message: "MARKERMESSAGE long enough for the rule to pass.",
      turnstileToken: "MARKERTOKEN",
    };
    const clientIp = "192.0.2.123";
    const success = await post(markers, clientIp);
    const { reference } = (await success.json()) as { reference: string };
    smtp.behavior = "reject";
    await post(markers, clientIp);
    await post({ ...markers, message: "MARKERSHORT" }, clientIp);
    await post({ ...markers, turnstileToken: "" }, clientIp);
    const output = logWrites.join("");
    expect(logWrites).toHaveLength(4);
    for (const value of [...Object.values(markers), clientIp, reference, "550 rejected"]) {
      expect(output).not.toContain(value);
    }
    expect(output).not.toContain("MARKER");
    expect(output).not.toContain("7700");
    expect(output).not.toContain("smtp-password-value");
    expect(output).not.toContain("turnstile-secret-value");
  });
});
