import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import type { AstroIntegration } from "astro";
import { defineConfig } from "astro/config";

// ADR-001: static by default; only /contact, /api/contact, and /health render on demand.
// ADR-003: the adapter answers slash-suffixed routes with 301 when trailingSlash is "never".
// ADR-009: sessions are off, so the container needs no writable session directory.
// ADR-014: origin checking is off, so a cross-origin form POST reaches the 415 check.
// ADR-002: staticHeaders writes each prerendered route's CSP to dist/_headers.json,
// which the adapter sends and server.ts reuses as the fallback policy.
// ADR-002 and G4 revision request 1: under `astro dev`, Vite injects an inline script and
// runtime <style> tags that Astro cannot hash, so an enforced CSP blocks them and no
// stylesheet applies. This integration turns the policy off only when Astro itself
// reports the "dev" command. Every other command, including `astro build` with any
// --mode or NODE_ENV, keeps the full ADR-002 policy declared below.
const devServerWithoutCsp: AstroIntegration = {
  name: "dev-server-without-csp",
  hooks: {
    "astro:config:setup": ({ command, updateConfig }) => {
      if (command === "dev") {
        updateConfig({ security: { csp: false } });
      }
    },
  },
};

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
  integrations: [devServerWithoutCsp],
  vite: { plugins: [tailwindcss()] },
});
