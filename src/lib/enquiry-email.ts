import type { ContactSubmission } from "./contact-validation";
import type { EnquiryReference } from "./enquiry-reference";
import type { MailConfiguration } from "./runtime-config";

// C-14, ENT-005, FR-031 to FR-033. Pure: the SMTP sender (C-15) encodes and sends.

export interface EnquiryEmail {
  readonly from: string;
  readonly to: string;
  readonly replyTo: string;
  readonly subject: string;
  readonly text: string;
}

export const PHONE_NOT_PROVIDED = "Not provided";

const KOLKATA_DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// FR-032: `YYYY-MM-DD HH:mm IST`, independent of the host time zone.
export function formatSubmittedAt(submittedAt: Date): string {
  const parts = new Map(
    KOLKATA_DATE_TIME_FORMAT.formatToParts(submittedAt).map((part) => [part.type, part.value]),
  );
  const read = (type: Intl.DateTimeFormatPartTypes): string => parts.get(type) ?? "";
  return `${read("year")}-${read("month")}-${read("day")} ${read("hour")}:${read("minute")} IST`;
}

// C-10 already rejects CR and LF in these values. Stripping again keeps this module
// safe on its own against header injection (stack profile section 6).
function headerSafe(value: string): string {
  return value.replaceAll(/[\r\n]/g, "");
}

export function composeEnquiryEmail(
  submission: ContactSubmission,
  reference: EnquiryReference,
  config: MailConfiguration,
  submittedAt: Date,
): EnquiryEmail {
  const text = [
    `Reference: ${reference}`,
    `Name: ${submission.name}`,
    `Company: ${submission.company}`,
    `Work email: ${submission.workEmail}`,
    `Phone: ${submission.phone === "" ? PHONE_NOT_PROVIDED : submission.phone}`,
    `Interest: ${submission.interest}`,
    "Message:",
    submission.message,
    `Submitted: ${formatSubmittedAt(submittedAt)}`,
  ].join("\n");

  return {
    from: headerSafe(config.mailFrom),
    to: headerSafe(config.salesMailbox),
    replyTo: headerSafe(submission.workEmail),
    subject: headerSafe(
      `Website enquiry ${reference}: ${submission.interest} — ${submission.company}`,
    ),
    text,
  };
}
