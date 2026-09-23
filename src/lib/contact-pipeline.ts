import type { ContactAccepted, ErrorBody } from "./api-types";
import { ERROR_STATUS } from "./api-types";
import { callingCodeSet } from "./calling-codes";
import { resolveClientIp } from "./client-ip";
import { validateContactSubmission } from "./contact-validation";
import { composeEnquiryEmail, type EnquiryEmail } from "./enquiry-email";
import { generateEnquiryReference, type EnquiryReference } from "./enquiry-reference";
import type { ContactOutcome, OutcomeLogEntry } from "./outcome-log";
import { createRateLimiter, type RateLimiter } from "./rate-limiter";
import { isJsonMediaType, parseJsonBody, readRequestBody } from "./request-body";
import {
  readMailConfiguration,
  type ConfigurationResult,
  type MailConfiguration,
} from "./runtime-config";
import { sendEnquiryEmail, type SendResult } from "./smtp-sender";
import { verifyTurnstileToken, type TurnstileResult } from "./turnstile-verify";

// C-06. Runs the FR-053 check order and returns one typed outcome. Every collaborator
// is injected so tests never reach Siteverify or an SMTP relay.

export interface ContactPipelineDependencies {
  readonly rateLimiter: RateLimiter;
  readonly callingCodes: () => ReadonlySet<string>;
  readonly readConfiguration: () => ConfigurationResult;
  readonly verifyTurnstile: (token: unknown, secretKey: string) => Promise<TurnstileResult>;
  readonly sendEmail: (email: EnquiryEmail, config: MailConfiguration) => Promise<SendResult>;
  readonly generateReference: (now: Date) => EnquiryReference;
  readonly now: () => Date;
}

export type PipelineOutcome =
  | { readonly kind: "sent"; readonly reference: EnquiryReference }
  | { readonly kind: "rejected"; readonly body: ErrorBody; readonly detail?: string };

export const ALLOWED_METHOD = "POST";

export const UNEXPECTED_FAILURE: PipelineOutcome = {
  kind: "rejected",
  body: { code: "SEND_FAILED" },
};

const OUTCOME_BY_CODE: Readonly<Record<ErrorBody["code"], ContactOutcome>> = {
  VALIDATION_FAILED: "invalid",
  SPAM_CHECK_FAILED: "spam_check_failed",
  METHOD_NOT_ALLOWED: "method_not_allowed",
  PAYLOAD_TOO_LARGE: "payload_too_large",
  UNSUPPORTED_MEDIA_TYPE: "unsupported_media_type",
  RATE_LIMITED: "rate_limited",
  SEND_FAILED: "send_failed",
};

function reject(code: Exclude<ErrorBody["code"], "VALIDATION_FAILED">): PipelineOutcome {
  return { kind: "rejected", body: { code } };
}

export function createDefaultDependencies(): ContactPipelineDependencies {
  let callingCodes: ReadonlySet<string> | null = null;
  return {
    rateLimiter: createRateLimiter(),
    callingCodes: () => {
      callingCodes ??= callingCodeSet();
      return callingCodes;
    },
    readConfiguration: readMailConfiguration,
    verifyTurnstile: async (token, secretKey) => verifyTurnstileToken(token, secretKey),
    sendEmail: async (email, config) => sendEnquiryEmail(email, config),
    generateReference: generateEnquiryReference,
    now: () => new Date(),
  };
}

function readTurnstileToken(input: unknown): unknown {
  return typeof input === "object" && input !== null && !Array.isArray(input)
    ? Reflect.get(input, "turnstileToken")
    : undefined;
}

export async function runContactPipeline(
  request: Request,
  readSocketAddress: () => string,
  dependencies: ContactPipelineDependencies,
): Promise<PipelineOutcome> {
  // Step 1. Nothing is read, so a large body with a bad method costs nothing.
  if (request.method !== ALLOWED_METHOD) return reject("METHOD_NOT_ALLOWED");

  // ADR-005: every POST counts, including those rejected by steps 2 to 7 (FR-042).
  const clientIp = resolveClientIp(request.headers, readSocketAddress);
  const { limited } = dependencies.rateLimiter.recordHit(clientIp, dependencies.now().getTime());

  // Steps 2 and 3.
  if (!isJsonMediaType(request.headers.get("Content-Type"))) {
    return reject("UNSUPPORTED_MEDIA_TYPE");
  }
  const body = await readRequestBody(request);
  if (!body.ok) return reject("PAYLOAD_TOO_LARGE");

  // Step 4.
  if (limited) return reject("RATE_LIMITED");

  // Step 5.
  const parsed = parseJsonBody(body.value);
  if (!parsed.ok) {
    return { kind: "rejected", body: { code: "VALIDATION_FAILED", fieldErrors: [] } };
  }
  const validation = validateContactSubmission(parsed.value, dependencies.callingCodes());
  if (!validation.ok) {
    return {
      kind: "rejected",
      body: { code: "VALIDATION_FAILED", fieldErrors: validation.error.fieldErrors },
    };
  }

  // Step 6. Configuration precedes Siteverify because the secret key is configuration.
  const configuration = dependencies.readConfiguration();
  if (!configuration.ok) {
    return {
      kind: "rejected",
      body: { code: "SEND_FAILED" },
      detail: `missing: ${configuration.error.missingVariables.join(",")}`,
    };
  }
  const turnstile = await dependencies.verifyTurnstile(
    readTurnstileToken(parsed.value),
    configuration.value.turnstileSecretKey,
  );
  if (!turnstile.ok) return reject("SPAM_CHECK_FAILED");

  // Step 7. The reference exists only past every rejection path (FR-054).
  const submittedAt = dependencies.now();
  const reference = dependencies.generateReference(submittedAt);
  const email = composeEnquiryEmail(validation.value, reference, configuration.value, submittedAt);
  const sent = await dependencies.sendEmail(email, configuration.value);
  if (!sent.ok) return reject("SEND_FAILED");
  return { kind: "sent", reference };
}

const JSON_CONTENT_TYPE = "application/json";

export function toResponse(outcome: PipelineOutcome): Response {
  if (outcome.kind === "sent") {
    const accepted: ContactAccepted = { status: "sent", reference: outcome.reference };
    return new Response(JSON.stringify(accepted), {
      status: 200,
      headers: { "Content-Type": JSON_CONTENT_TYPE },
    });
  }
  const headers = new Headers({ "Content-Type": JSON_CONTENT_TYPE });
  if (outcome.body.code === "METHOD_NOT_ALLOWED") headers.set("Allow", ALLOWED_METHOD);
  return new Response(JSON.stringify(outcome.body), {
    status: ERROR_STATUS[outcome.body.code],
    headers,
  });
}

// The entry carries the outcome only: never the reference, a field value, or the IP.
export function toOutcomeLogEntry(outcome: PipelineOutcome, time: Date): OutcomeLogEntry {
  const base = {
    time: time.toISOString(),
    outcome: outcome.kind === "sent" ? "sent" : OUTCOME_BY_CODE[outcome.body.code],
  } as const;
  return outcome.kind === "rejected" && outcome.detail !== undefined
    ? { ...base, detail: outcome.detail }
    : base;
}
