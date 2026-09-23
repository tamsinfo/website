import { readFileSync } from "node:fs";

// The container image copies this file without the rest of src/lib (deploy/Dockerfile),
// so it MUST NOT import any other project module.

export const REFERRER_POLICY = "strict-origin-when-cross-origin";

// A path the router never matches. The adapter answers it with the prerendered 404 page.
export const NOT_FOUND_PATH = "/__not_a_route";

const FALLBACK_CSP_PATHNAME = "/404";
const DIRECT_HTML_SUFFIX = /\.html?$/i;

export type FallbackCspErrorCode =
  | "HEADERS_FILE_UNREADABLE"
  | "HEADERS_FILE_MALFORMED"
  | "FALLBACK_CSP_MISSING";

export type FallbackCspResult =
  | { readonly ok: true; readonly value: string }
  | { readonly ok: false; readonly error: { readonly code: FallbackCspErrorCode } };

// The static handler percent-decodes the path before it looks up a file. A raw-path test
// alone lets `/about/index%2Ehtml` through, so both forms are tested (ADR-002).
export function isDirectHtmlPath(rawUrl: string): boolean {
  const rawPath = rawUrl.split(/[?#]/)[0] ?? "";
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    // A path that cannot be decoded cannot be trusted to name a non-HTML file.
    return true;
  }
  return DIRECT_HTML_SUFFIX.test(rawPath) || DIRECT_HTML_SUFFIX.test(decodedPath);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function findFallbackCsp(entries: unknown): FallbackCspResult {
  if (!Array.isArray(entries)) {
    return { ok: false, error: { code: "HEADERS_FILE_MALFORMED" } };
  }
  for (const entry of entries) {
    if (!isRecord(entry) || entry["pathname"] !== FALLBACK_CSP_PATHNAME) continue;
    const headers = entry["headers"];
    if (!Array.isArray(headers)) {
      return { ok: false, error: { code: "HEADERS_FILE_MALFORMED" } };
    }
    for (const header of headers) {
      if (
        isRecord(header) &&
        header["key"] === "Content-Security-Policy" &&
        typeof header["value"] === "string" &&
        header["value"] !== ""
      ) {
        return { ok: true, value: header["value"] };
      }
    }
  }
  return { ok: false, error: { code: "FALLBACK_CSP_MISSING" } };
}

export function readFallbackCsp(headersFile: URL): FallbackCspResult {
  let text: string;
  try {
    text = readFileSync(headersFile, "utf-8");
  } catch {
    return { ok: false, error: { code: "HEADERS_FILE_UNREADABLE" } };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: { code: "HEADERS_FILE_MALFORMED" } };
  }
  return findFallbackCsp(parsed);
}
