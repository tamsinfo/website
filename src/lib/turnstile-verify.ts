import type { Result } from "./api-types";
import { codePointLength } from "./contact-validation";

// C-13, ADR-007, FR-028. Uses the global fetch so no SDK dependency is needed.

export const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export const SITEVERIFY_TIMEOUT_MS = 3000;
export const TURNSTILE_TOKEN_MAX_LENGTH = 2048;

export type Fetch = (input: string, init: RequestInit) => Promise<Response>;

export type TurnstileResult = Result<void, "SPAM_CHECK_FAILED">;

const FAILED: TurnstileResult = { ok: false, error: "SPAM_CHECK_FAILED" };

// A malformed token fails without a network call; it is not a field error (FR-028).
export function isWellFormedToken(token: unknown): token is string {
  if (typeof token !== "string") return false;
  const length = codePointLength(token);
  return length >= 1 && length <= TURNSTILE_TOKEN_MAX_LENGTH;
}

function isSuccessBody(body: unknown): boolean {
  return typeof body === "object" && body !== null && Reflect.get(body, "success") === true;
}

export async function verifyTurnstileToken(
  token: unknown,
  secretKey: string,
  fetchImplementation: Fetch = fetch,
): Promise<TurnstileResult> {
  if (!isWellFormedToken(token)) return FAILED;
  try {
    const response = await fetchImplementation(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });
    if (!response.ok) return FAILED;
    const body: unknown = await response.json();
    return isSuccessBody(body) ? { ok: true, value: undefined } : FAILED;
  } catch {
    // Timeout, network error, and parse failure all count as a failed token (ADR-007).
    return FAILED;
  }
}
