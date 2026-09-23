import { createTransport } from "nodemailer";
import { describe, expect, it } from "vitest";
import type { ContactSubmission } from "../../src/lib/contact-validation";
import {
  composeEnquiryEmail,
  formatSubmittedAt,
  type EnquiryEmail,
} from "../../src/lib/enquiry-email";
import type { EnquiryReference } from "../../src/lib/enquiry-reference";
import type { MailConfiguration } from "../../src/lib/runtime-config";
import { toOutgoingMessage } from "../../src/lib/smtp-sender";

const REFERENCE = "TAMS-2026-7K3Q" as EnquiryReference;
const SUBMITTED_AT = new Date("2026-09-22T12:34:56Z"); // 18:04 in Kolkata

const CONFIG: MailConfiguration = {
  smtpHost: "smtp.example.com",
  smtpPort: 587,
  smtpUser: "user",
  smtpPassword: "password",
  mailFrom: "website@tamsinfotech.example",
  salesMailbox: "sales@tamsinfotech.example",
  turnstileSecretKey: "secret",
};

const SUBMISSION: ContactSubmission = {
  name: "Priya Raman",
  company: "Acme Stéel",
  workEmail: "ops@northaid.example",
  phone: "+91 98450 12345",
  interest: "Products",
  message: "Line one <b>bold</b>\nLine two\n\nLine four after a blank line.",
};

function compose(overrides: Partial<ContactSubmission> = {}): EnquiryEmail {
  return composeEnquiryEmail({ ...SUBMISSION, ...overrides }, REFERENCE, CONFIG, SUBMITTED_AT);
}

// Renders the message with Nodemailer's own composer, so the test sees real headers.
async function renderRawMessage(email: EnquiryEmail): Promise<string> {
  const transport = createTransport({ streamTransport: true, buffer: true, newline: "unix" });
  const info = await transport.sendMail(toOutgoingMessage(email));
  return info.message.toString("utf-8");
}

describe("composeEnquiryEmail (FR-031 to FR-033, FR-035)", () => {
  it("sets the FR-031 subject with the reference, interest, em dash, and company", () => {
    expect(compose().subject).toBe("Website enquiry TAMS-2026-7K3Q: Products — Acme Stéel");
  });

  it("lists Reference first, then every FR-032 label in order", () => {
    expect(compose().text).toBe(
      [
        "Reference: TAMS-2026-7K3Q",
        "Name: Priya Raman",
        "Company: Acme Stéel",
        "Work email: ops@northaid.example",
        "Phone: +91 98450 12345",
        "Interest: Products",
        "Message:",
        "Line one <b>bold</b>",
        "Line two",
        "",
        "Line four after a blank line.",
        "Submitted: 2026-09-22 18:04 IST",
      ].join("\n"),
    );
  });

  it("writes Not provided for an empty phone", () => {
    expect(compose({ phone: "" }).text).toContain("\nPhone: Not provided\n");
  });

  it("sets Reply-To to the work email, From to MAIL_FROM, and To to the sales mailbox", () => {
    const email = compose();
    expect(email.replyTo).toBe("ops@northaid.example");
    expect(email.from).toBe(CONFIG.mailFrom);
    expect(email.to).toBe(CONFIG.salesMailbox);
  });

  it("strips CR and LF from header values", () => {
    const email = compose({ company: "Evil\r\nBcc: victim@example.com" });
    expect(email.subject).not.toMatch(/[\r\n]/);
  });
});

describe("formatSubmittedAt (FR-032)", () => {
  it("formats in Asia/Kolkata with a 24-hour clock", () => {
    expect(formatSubmittedAt(new Date("2026-01-01T18:45:00Z"))).toBe("2026-01-02 00:15 IST");
    expect(formatSubmittedAt(new Date("2026-06-30T00:00:00Z"))).toBe("2026-06-30 05:30 IST");
  });
});

describe("rendered message (Nodemailer composer)", () => {
  it("encodes the non-ASCII subject as an RFC 2047 encoded word", async () => {
    const raw = await renderRawMessage(compose());
    const subjectLine = /^Subject: (.*(?:\n[ \t].*)*)/m.exec(raw)?.[1] ?? "";
    expect(subjectLine).toMatch(/^=\?UTF-8\?[QB]\?/);
    expect(subjectLine).not.toContain("—");
  });

  it("carries Reply-To, From, and To headers and a plain-text body", async () => {
    const raw = await renderRawMessage(compose());
    expect(raw).toMatch(/^Reply-To: ops@northaid\.example$/m);
    expect(raw).toMatch(/^From: website@tamsinfotech\.example$/m);
    expect(raw).toMatch(/^To: sales@tamsinfotech\.example$/m);
    expect(raw).toMatch(/^Content-Type: text\/plain; charset=utf-8$/m);
    expect(raw).not.toMatch(/text\/html/);
  });

  it("addresses the envelope to the sales mailbox only (FR-035)", async () => {
    const transport = createTransport({ streamTransport: true, buffer: true });
    const info = await transport.sendMail(toOutgoingMessage(compose()));
    expect(info.envelope.to).toEqual(["sales@tamsinfotech.example"]);
  });
});
