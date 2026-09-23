import type { Result } from "./api-types";

// C-07, NFR-007. Split into three steps because the rate-limit check (FR-053 step 4)
// sits between the size check and JSON parsing.

export const MAX_BODY_BYTES = 65_536;

const JSON_MEDIA_TYPE = "application/json";

// Parameters such as charset are allowed; the comparison is case-insensitive.
export function isJsonMediaType(contentType: string | null): boolean {
  if (contentType === null) return false;
  const mediaType = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return mediaType === JSON_MEDIA_TYPE;
}

function declaresOversizedBody(headers: Headers): boolean {
  const declared = headers.get("Content-Length");
  if (declared === null || !/^\d+$/.test(declared.trim())) return false;
  return Number(declared.trim()) > MAX_BODY_BYTES;
}

function concatenate(chunks: readonly Uint8Array[], totalBytes: number): Uint8Array {
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

// Reads at most MAX_BODY_BYTES and stops at the first byte beyond it. A stream error
// also maps to PAYLOAD_TOO_LARGE: the adapter's bodySizeLimit backstop raises one.
export async function readRequestBody(
  request: Request,
): Promise<Result<Uint8Array, "PAYLOAD_TOO_LARGE">> {
  if (declaresOversizedBody(request.headers)) return { ok: false, error: "PAYLOAD_TOO_LARGE" };
  if (request.body === null) return { ok: true, value: new Uint8Array(0) };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        // The outcome is already 413; a failed cancel cannot change it.
        await reader.cancel().catch(() => undefined);
        return { ok: false, error: "PAYLOAD_TOO_LARGE" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, error: "PAYLOAD_TOO_LARGE" };
  }
  return { ok: true, value: concatenate(chunks, totalBytes) };
}

// Invalid UTF-8 and invalid JSON both yield VALIDATION_FAILED with no field errors.
export function parseJsonBody(bytes: Uint8Array): Result<unknown, "VALIDATION_FAILED"> {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const value: unknown = JSON.parse(text);
    return { ok: true, value };
  } catch {
    return { ok: false, error: "VALIDATION_FAILED" };
  }
}
