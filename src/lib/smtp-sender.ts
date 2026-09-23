import { createTransport } from "nodemailer";
import type { Result } from "./api-types";
import type { EnquiryEmail } from "./enquiry-email";
import type { MailConfiguration } from "./runtime-config";

// C-15, ADR-004. The only module that imports Nodemailer.

export const SMTP_DEADLINE_MS = 8000;
const IMPLICIT_TLS_PORT = 465;

export interface SmtpTransportOptions {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly requireTLS: boolean;
  readonly auth: { readonly user: string; readonly pass: string };
  readonly connectionTimeout: number;
  readonly greetingTimeout: number;
  readonly socketTimeout: number;
  readonly disableFileAccess: boolean;
  readonly disableUrlAccess: boolean;
}

export interface OutgoingMessage {
  readonly from: string;
  readonly to: string;
  readonly replyTo: string;
  readonly subject: string;
  readonly text: string;
  readonly envelope: { readonly from: string; readonly to: string };
}

export interface MailTransport {
  sendMail(message: OutgoingMessage): Promise<{ readonly rejected?: readonly unknown[] }>;
  close(): void;
}

export type CreateMailTransport = (options: SmtpTransportOptions) => MailTransport;

export type SendResult = Result<void, "SEND_FAILED">;

const SEND_FAILED: SendResult = { ok: false, error: "SEND_FAILED" };

export function buildTransportOptions(config: MailConfiguration): SmtpTransportOptions {
  const implicitTls = config.smtpPort === IMPLICIT_TLS_PORT;
  return {
    host: config.smtpHost,
    port: config.smtpPort,
    secure: implicitTls,
    requireTLS: !implicitTls,
    auth: { user: config.smtpUser, pass: config.smtpPassword },
    connectionTimeout: SMTP_DEADLINE_MS,
    greetingTimeout: SMTP_DEADLINE_MS,
    socketTimeout: SMTP_DEADLINE_MS,
    disableFileAccess: true,
    disableUrlAccess: true,
  };
}

const createNodemailerTransport: CreateMailTransport = (options) => {
  const transport = createTransport({ ...options, auth: { ...options.auth } });
  return {
    sendMail: async (message) =>
      transport.sendMail({ ...message, envelope: { ...message.envelope } }),
    close: () => transport.close(),
  };
};

// The explicit envelope keeps the sales mailbox the only recipient, whatever the
// headers say (FR-035).
export function toOutgoingMessage(email: EnquiryEmail): OutgoingMessage {
  return { ...email, envelope: { from: email.from, to: email.to } };
}

// One transport per message (ADR-004). The timer starts before connect, so a slow
// greeting and a slow DATA phase share one 8-second budget. Errors are mapped, never
// logged: a Nodemailer error can carry the message body (NFR-017).
export async function sendEnquiryEmail(
  email: EnquiryEmail,
  config: MailConfiguration,
  createMailTransport: CreateMailTransport = createNodemailerTransport,
): Promise<SendResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<SendResult>((resolve) => {
    timer = setTimeout(() => resolve(SEND_FAILED), SMTP_DEADLINE_MS);
  });
  let transport: MailTransport | undefined;
  try {
    transport = createMailTransport(buildTransportOptions(config));
    const delivery = transport
      .sendMail(toOutgoingMessage(email))
      .then((info): SendResult =>
        (info.rejected?.length ?? 0) > 0 ? SEND_FAILED : { ok: true, value: undefined },
      )
      .catch((): SendResult => SEND_FAILED);
    return await Promise.race([delivery, deadline]);
  } catch {
    return SEND_FAILED;
  } finally {
    clearTimeout(timer);
    transport?.close();
  }
}
