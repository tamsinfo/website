import { afterEach, describe, expect, it, vi } from "vitest";
import type { EnquiryEmail } from "../../src/lib/enquiry-email";
import type { MailConfiguration } from "../../src/lib/runtime-config";
import {
  buildTransportOptions,
  sendEnquiryEmail,
  SMTP_DEADLINE_MS,
  type CreateMailTransport,
  type MailTransport,
  type OutgoingMessage,
} from "../../src/lib/smtp-sender";

const CONFIG: MailConfiguration = {
  smtpHost: "smtp.example.com",
  smtpPort: 587,
  smtpUser: "user",
  smtpPassword: "password",
  mailFrom: "website@example.com",
  salesMailbox: "sales@example.com",
  turnstileSecretKey: "secret",
};

const EMAIL: EnquiryEmail = {
  from: "website@example.com",
  to: "sales@example.com",
  replyTo: "visitor@example.com",
  subject: "Website enquiry TAMS-2026-7K3Q: Services — Acme",
  text: "Reference: TAMS-2026-7K3Q",
};

function fakeTransport(sendMail: MailTransport["sendMail"]) {
  const transport = { sendMail: vi.fn(sendMail), close: vi.fn() };
  const create = vi.fn<CreateMailTransport>(() => transport);
  return { transport, create };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("buildTransportOptions (ADR-004)", () => {
  it("uses STARTTLS with requireTLS on port 587 and 8-second timeouts", () => {
    expect(buildTransportOptions(CONFIG)).toEqual({
      host: "smtp.example.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: "user", pass: "password" },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
  });

  it("uses implicit TLS on port 465", () => {
    const options = buildTransportOptions({ ...CONFIG, smtpPort: 465 });
    expect(options.secure).toBe(true);
    expect(options.requireTLS).toBe(false);
  });
});

describe("sendEnquiryEmail (FR-030, FR-035)", () => {
  it("returns ok when the relay accepts, and closes the transport", async () => {
    const { transport, create } = fakeTransport(async () => ({ rejected: [] }));
    expect(await sendEnquiryEmail(EMAIL, CONFIG, create)).toEqual({ ok: true, value: undefined });
    expect(create).toHaveBeenCalledTimes(1);
    expect(transport.close).toHaveBeenCalledTimes(1);
  });

  it("sends one message whose envelope names the sales mailbox only", async () => {
    const { transport, create } = fakeTransport(async () => ({ rejected: [] }));
    await sendEnquiryEmail(EMAIL, CONFIG, create);
    const message: OutgoingMessage | undefined = transport.sendMail.mock.calls[0]?.[0];
    expect(message?.envelope).toEqual({ from: "website@example.com", to: "sales@example.com" });
    expect(message?.replyTo).toBe("visitor@example.com");
  });

  it("returns SEND_FAILED when the relay rejects or is unreachable", async () => {
    const { transport, create } = fakeTransport(async () => {
      throw new Error("ECONNREFUSED with body Reference: TAMS-2026-7K3Q");
    });
    expect(await sendEnquiryEmail(EMAIL, CONFIG, create)).toEqual({
      ok: false,
      error: "SEND_FAILED",
    });
    expect(transport.close).toHaveBeenCalledTimes(1);
  });

  it("returns SEND_FAILED when the relay rejects the recipient", async () => {
    const { create } = fakeTransport(async () => ({ rejected: ["sales@example.com"] }));
    expect(await sendEnquiryEmail(EMAIL, CONFIG, create)).toEqual({
      ok: false,
      error: "SEND_FAILED",
    });
  });

  it("returns SEND_FAILED when transport creation throws", async () => {
    const create = vi.fn<CreateMailTransport>(() => {
      throw new Error("bad options");
    });
    expect(await sendEnquiryEmail(EMAIL, CONFIG, create)).toEqual({
      ok: false,
      error: "SEND_FAILED",
    });
  });

  it("returns SEND_FAILED and closes the transport after the 8-second deadline", async () => {
    vi.useFakeTimers();
    const { transport, create } = fakeTransport(async () => new Promise(() => undefined));
    const pending = sendEnquiryEmail(EMAIL, CONFIG, create);
    await vi.advanceTimersByTimeAsync(SMTP_DEADLINE_MS - 1);
    expect(transport.close).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(await pending).toEqual({ ok: false, error: "SEND_FAILED" });
    expect(transport.close).toHaveBeenCalledTimes(1);
  });
});
