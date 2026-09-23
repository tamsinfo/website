import type { FieldError } from "./contact-validation";

// Wire types derived from docs/03-design/api-contract.yaml (frozen at G3).
// No Node imports: the browser form client also reads these types.

export type Result<Value, Failure> =
  | { readonly ok: true; readonly value: Value }
  | { readonly ok: false; readonly error: Failure };

export const ERROR_CODES = [
  "VALIDATION_FAILED",
  "PAYLOAD_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
  "METHOD_NOT_ALLOWED",
  "SPAM_CHECK_FAILED",
  "RATE_LIMITED",
  "SEND_FAILED",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const ERROR_STATUS: Readonly<Record<ErrorCode, number>> = {
  VALIDATION_FAILED: 400,
  SPAM_CHECK_FAILED: 403,
  METHOD_NOT_ALLOWED: 405,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RATE_LIMITED: 429,
  SEND_FAILED: 502,
};

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === "string" && (ERROR_CODES as readonly string[]).includes(value);
}

// `fieldErrors` is present if and only if `code` is VALIDATION_FAILED.
export type ErrorBody =
  | { readonly code: "VALIDATION_FAILED"; readonly fieldErrors: readonly FieldError[] }
  | { readonly code: Exclude<ErrorCode, "VALIDATION_FAILED"> };

export interface ContactAccepted {
  readonly status: "sent";
  readonly reference: string;
}

export const REFERENCE_PATTERN = /^TAMS-\d{4}-[2-9A-HJ-NP-Z]{4}$/;

export const HEALTH_STATUS = "ok";
