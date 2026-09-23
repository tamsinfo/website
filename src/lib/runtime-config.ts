import { isValidEmail } from "./contact-validation";

// C-12, ADR-015. Read at first use inside on-demand code only. Reading at build would
// bake values into dist/ (NFR-015); reading at module load would fail on import in tests.

export interface MailConfiguration {
  readonly smtpHost: string;
  readonly smtpPort: number;
  readonly smtpUser: string;
  readonly smtpPassword: string;
  readonly mailFrom: string;
  readonly salesMailbox: string;
  readonly turnstileSecretKey: string;
}

export type ConfigurationResult =
  | { ok: true; value: MailConfiguration }
  | { ok: false; error: { code: "CONFIGURATION_MISSING"; missingVariables: readonly string[] } };

export type Environment = Readonly<Record<string, string | undefined>>;

const MAIL_VARIABLES = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "MAIL_FROM",
  "SALES_MAILBOX",
  "TURNSTILE_SECRET_KEY",
] as const;

type MailVariable = (typeof MAIL_VARIABLES)[number];

const PORT_PATTERN = /^\d{1,5}$/;
const MAX_PORT = 65_535;

function isValidPort(value: string): boolean {
  if (!PORT_PATTERN.test(value)) return false;
  const port = Number(value);
  return port >= 1 && port <= MAX_PORT;
}

// Header injection guard: an address with CR or LF could add mail headers.
function isHeaderSafeEmail(value: string): boolean {
  return !/[\r\n]/.test(value) && isValidEmail(value);
}

function isValid(variable: MailVariable, value: string): boolean {
  switch (variable) {
    case "SMTP_PORT":
      return isValidPort(value);
    case "MAIL_FROM":
    case "SALES_MAILBOX":
      return isHeaderSafeEmail(value);
    default:
      return value.trim() !== "";
  }
}

// Pure: names every missing or invalid variable, never its value.
export function parseMailConfiguration(environment: Environment): ConfigurationResult {
  const values = new Map<MailVariable, string>();
  const missingVariables: string[] = [];
  for (const variable of MAIL_VARIABLES) {
    const value = environment[variable];
    if (value === undefined || !isValid(variable, value)) {
      missingVariables.push(variable);
    } else {
      values.set(variable, value);
    }
  }
  if (missingVariables.length > 0) {
    return { ok: false, error: { code: "CONFIGURATION_MISSING", missingVariables } };
  }
  const read = (variable: MailVariable): string => values.get(variable) ?? "";
  return {
    ok: true,
    value: {
      smtpHost: read("SMTP_HOST"),
      smtpPort: Number(read("SMTP_PORT")),
      smtpUser: read("SMTP_USER"),
      smtpPassword: read("SMTP_PASSWORD"),
      mailFrom: read("MAIL_FROM"),
      salesMailbox: read("SALES_MAILBOX"),
      turnstileSecretKey: read("TURNSTILE_SECRET_KEY"),
    },
  };
}

let cachedMailConfiguration: MailConfiguration | null = null;

// ADR-015 caches the first complete read only. An incomplete read is repeated on the
// next request, so every failing request logs the current missing variables.
export function readMailConfiguration(): ConfigurationResult {
  if (cachedMailConfiguration !== null) return { ok: true, value: cachedMailConfiguration };
  const result = parseMailConfiguration(process.env);
  if (result.ok) cachedMailConfiguration = result.value;
  return result;
}

// Read per request so the key never enters a prerendered page (NFR-015).
// Null means the Contact page renders no widget (ENT-004).
export function readTurnstileSiteKey(): string | null {
  const siteKey = process.env["TURNSTILE_SITE_KEY"];
  return siteKey === undefined || siteKey.trim() === "" ? null : siteKey;
}
