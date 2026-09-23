/**
 * C-28 state core (TASK-005). The Contact form's submission state machine, with no DOM
 * access, so every branch runs under Vitest with a mocked fetch.
 * contact-form-client.ts binds this module to the page markup.
 *
 * Branches on the contract's closed error-code enum, never on status text or message
 * text (ui-specification.md section 7.1).
 */

import { isErrorCode, REFERENCE_PATTERN, type ErrorCode } from "./api-types";
import {
  FIELD_ERROR_MESSAGES,
  validateContactSubmission,
  type ContactSubmission,
  type FieldError,
  type FieldName,
  type Interest,
} from "./contact-validation";

export const CONTACT_ENDPOINT = "/api/contact";

/** FR-039. */
export const SUBMIT_TIMEOUT_MS = 15_000;

/** FR-038. */
export const SEND_FAILURE_MESSAGE =
  "We couldn't send your message. Please try again, or email sales@tamsinfotech.com.";

/** FR-049. */
export const RATE_LIMIT_MESSAGE = "Too many messages. Please try again in a few minutes.";

/** Tab and focus order of the fields (SCR-004 accessibility). */
export const FIELD_ORDER: readonly FieldName[] = [
  "name",
  "company",
  "workEmail",
  "phone",
  "interest",
  "message",
];

/** Id of a field's error line, the target of its aria-describedby (FR-037). */
export function errorIdFor(field: FieldName): string {
  return `contact-${field}-error`;
}

/** Parses the space-separated data-calling-codes attribute (ADR-006). */
export function parseCallingCodes(attribute: string | undefined): ReadonlySet<string> {
  if (attribute === undefined) return new Set();
  return new Set(attribute.split(/\s+/).filter((code) => /^\d+$/.test(code)));
}

/** Raw field values as the visitor typed them. Interest is "" while unselected. */
export type FormValues = Readonly<Record<FieldName, string>>;

export type Banner = "send-failure" | "rate-limited";

export interface ThankYouRows {
  /** The submitted, trimmed Work email (FR-036). */
  readonly sentTo: string;
  /** The submitted Interest. */
  readonly topic: Interest;
  /** The 200 body's `reference` (FR-054). */
  readonly reference: string;
}

export type FormState =
  | {
      readonly phase: "editing";
      readonly fieldErrors: readonly FieldError[];
      readonly banner: Banner | null;
    }
  | { readonly phase: "submitting" }
  | { readonly phase: "sent"; readonly rows: ThankYouRows };

export const INITIAL_FORM_STATE: FormState = { phase: "editing", fieldErrors: [], banner: null };

export type FailureReason =
  | Exclude<ErrorCode, "VALIDATION_FAILED" | "RATE_LIMITED">
  | "timeout"
  | "network"
  | "unexpected";

export type SubmitOutcome =
  | { readonly kind: "accepted"; readonly reference: string }
  | { readonly kind: "field-errors"; readonly fieldErrors: readonly FieldError[] }
  | { readonly kind: "rate-limited" }
  | { readonly kind: "send-failure"; readonly reason: FailureReason };

/** Where the page moves focus after an action. Null leaves focus where it is. */
export type FocusTarget = FieldName | "thank-you-heading" | null;

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

const KNOWN_FIELD_MESSAGES: ReadonlySet<string> = new Set(Object.values(FIELD_ERROR_MESSAGES));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFieldName(value: unknown): value is FieldName {
  return typeof value === "string" && (FIELD_ORDER as readonly string[]).includes(value);
}

function isFieldError(value: unknown): value is FieldError {
  return (
    isRecord(value) &&
    isFieldName(value["field"]) &&
    typeof value["message"] === "string" &&
    KNOWN_FIELD_MESSAGES.has(value["message"])
  );
}

/** Orders errors by field order, so focus lands on the first invalid field on screen. */
export function sortFieldErrors(fieldErrors: readonly FieldError[]): readonly FieldError[] {
  return fieldErrors.toSorted(
    (left, right) => FIELD_ORDER.indexOf(left.field) - FIELD_ORDER.indexOf(right.field),
  );
}

/**
 * Maps a response to an outcome. A 200 needs the contract's ContactAccepted body.
 * Every other response branches on `code` only. Anything the contract does not
 * describe is "unexpected" and shows the FR-038 message.
 */
export function interpretResponse(status: number, body: unknown): SubmitOutcome {
  if (status === 200) {
    if (
      isRecord(body) &&
      body["status"] === "sent" &&
      typeof body["reference"] === "string" &&
      REFERENCE_PATTERN.test(body["reference"])
    ) {
      return { kind: "accepted", reference: body["reference"] };
    }
    return { kind: "send-failure", reason: "unexpected" };
  }

  const code = isRecord(body) ? body["code"] : undefined;
  if (!isErrorCode(code)) return { kind: "send-failure", reason: "unexpected" };

  switch (code) {
    case "VALIDATION_FAILED": {
      const raw = isRecord(body) ? body["fieldErrors"] : undefined;
      const fieldErrors = Array.isArray(raw) ? raw.filter(isFieldError) : [];
      // An empty list gives the visitor nothing to correct, so it falls back to FR-038.
      if (fieldErrors.length === 0) return { kind: "send-failure", reason: "unexpected" };
      return { kind: "field-errors", fieldErrors: sortFieldErrors(fieldErrors) };
    }
    case "RATE_LIMITED":
      return { kind: "rate-limited" };
    default:
      // SPAM_CHECK_FAILED, SEND_FAILED, and the three non-user-facing codes (section 7.1).
      return { kind: "send-failure", reason: code };
  }
}

export interface EnquiryPayload extends ContactSubmission {
  readonly turnstileToken: string;
}

/**
 * Calls submitContactEnquiry once. Abandons the request after timeoutMs (FR-039).
 * Never throws: a network failure or timeout becomes a send-failure outcome.
 */
export async function postEnquiry(
  payload: EnquiryPayload,
  fetchImpl: FetchLike,
  timeoutMs: number = SUBMIT_TIMEOUT_MS,
): Promise<SubmitOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "same-origin",
      signal: controller.signal,
    });
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      // The deadline also covers reading the body.
      if (controller.signal.aborted) return { kind: "send-failure", reason: "timeout" };
      // A body that is not JSON is outside the contract; interpretResponse maps it to FR-038.
      body = undefined;
    }
    return interpretResponse(response.status, body);
  } catch {
    return { kind: "send-failure", reason: controller.signal.aborted ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}

export interface ContactFormDependencies {
  readonly fetch: FetchLike;
  /** Current Turnstile token, or null when none is available yet. */
  readonly readToken: () => string | null;
  /** Requests a fresh Turnstile token (FR-029, FR-055). */
  readonly resetToken: () => void;
  /** Calling codes as digits without "+" (C-11 via data-calling-codes). */
  readonly callingCodes: ReadonlySet<string>;
  readonly timeoutMs?: number;
}

export interface SubmitEffect {
  /** False when the call was ignored because a submission is in flight (FR-040). */
  readonly sent: boolean;
  readonly focus: FocusTarget;
}

export interface ResetEffect {
  /** Values to write back into the fields: FR-024 prefill, Interest unselected. */
  readonly values: FormValues;
  readonly focus: FocusTarget;
}

export interface ContactFormController {
  readonly getState: () => FormState;
  readonly submit: (values: FormValues) => Promise<SubmitEffect>;
  readonly reset: () => ResetEffect;
}

function outcomeToState(outcome: SubmitOutcome, submission: ContactSubmission): FormState {
  switch (outcome.kind) {
    case "accepted":
      return {
        phase: "sent",
        rows: {
          sentTo: submission.workEmail,
          topic: submission.interest,
          reference: outcome.reference,
        },
      };
    case "field-errors":
      return { phase: "editing", fieldErrors: outcome.fieldErrors, banner: null };
    case "rate-limited":
      return { phase: "editing", fieldErrors: [], banner: "rate-limited" };
    case "send-failure":
      return { phase: "editing", fieldErrors: [], banner: "send-failure" };
  }
}

function focusFor(state: FormState): FocusTarget {
  if (state.phase === "sent") return "thank-you-heading";
  if (state.phase === "editing") return state.fieldErrors[0]?.field ?? null;
  return null;
}

/**
 * Builds the form controller. `initialValues` is the state-A field content: empty
 * fields, the server-rendered Phone prefill, and Interest "".
 * `onChange` receives every new state so the page can render it.
 */
export function createContactFormController(
  dependencies: ContactFormDependencies,
  initialValues: FormValues,
  onChange: (state: FormState) => void,
): ContactFormController {
  let state: FormState = INITIAL_FORM_STATE;

  function setState(next: FormState): void {
    state = next;
    onChange(next);
  }

  async function submit(values: FormValues): Promise<SubmitEffect> {
    // FR-040: the guard runs before any await, so a double click or repeated Enter
    // cannot start a second request.
    if (state.phase !== "editing") return { sent: false, focus: null };

    const validation = validateContactSubmission(values, dependencies.callingCodes);
    if (!validation.ok) {
      const fieldErrors = sortFieldErrors(validation.error.fieldErrors);
      setState({ phase: "editing", fieldErrors, banner: null });
      return { sent: false, focus: focusFor(state) };
    }

    setState({ phase: "submitting" });
    const outcome = await postEnquiry(
      { ...validation.value, turnstileToken: dependencies.readToken() ?? "" },
      dependencies.fetch,
      dependencies.timeoutMs,
    );
    // A token is single-use once the server verifies it; a retry needs a fresh one.
    if (outcome.kind !== "accepted") dependencies.resetToken();
    setState(outcomeToState(outcome, validation.value));
    return { sent: true, focus: focusFor(state) };
  }

  function reset(): ResetEffect {
    if (state.phase !== "sent") return { values: initialValues, focus: null };
    dependencies.resetToken();
    setState(INITIAL_FORM_STATE);
    return { values: initialValues, focus: "name" };
  }

  return { getState: () => state, submit, reset };
}

/** Text of the polite summary above the form (SCR-004 state B). */
export function fieldSummaryText(errorCount: number): string {
  if (errorCount === 0) return "";
  return errorCount === 1 ? "1 field needs attention." : `${errorCount} fields need attention.`;
}

export function bannerMessage(banner: Banner): string {
  return banner === "rate-limited" ? RATE_LIMIT_MESSAGE : SEND_FAILURE_MESSAGE;
}
