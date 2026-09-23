// C-08, FR-050. The origin accepts Cloudflare traffic only, so the header is trusted.

export const CF_CONNECTING_IP_HEADER = "CF-Connecting-IP";
const CLIENT_IP_MAX_LENGTH = 45;

// The socket address is read lazily: Astro throws on clientAddress where it is unknown.
export function resolveClientIp(headers: Headers, readSocketAddress: () => string): string {
  const headerValue = headers.get(CF_CONNECTING_IP_HEADER)?.trim() ?? "";
  if (headerValue !== "" && headerValue.length <= CLIENT_IP_MAX_LENGTH) return headerValue;
  return readSocketAddress();
}
