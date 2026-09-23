import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// ADR-001: static by default; only /contact, /api/contact, and /health render on demand.
// ADR-003: the adapter answers slash-suffixed routes with 301 when trailingSlash is "never".
// ADR-009: sessions are off, so the container needs no writable session directory.
// ADR-014: origin checking is off, so a cross-origin form POST reaches the 415 check.
// ADR-002: staticHeaders writes each prerendered route's CSP to dist/_headers.json,
// which the adapter sends and server.ts reuses as the fallback policy.
export default defineConfig({
  output: "static",
  trailingSlash: "never",
  session: false,
  build: { format: "directory", inlineStylesheets: "never" },
  adapter: node({ mode: "standalone", staticHeaders: true, bodySizeLimit: 65536 }),
  security: {
    checkOrigin: false,
    csp: {
      algorithm: "SHA-256",
      directives: [
        "default-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "connect-src 'self' https://cloudflareinsights.com",
      ],
      scriptDirective: {
        resources: [
          "'self'",
          "https://challenges.cloudflare.com",
          "https://static.cloudflareinsights.com",
        ],
      },
    },
  },
  vite: { plugins: [tailwindcss()] },
});
